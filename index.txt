const prefixes = ['.', '#', '@']; // Daftar prefix yang diizinkan
let menu = require('./menu'); // Menggunakan let agar bisa di-reassign
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { saveGroupData, removeGroupData } = require('./database/lib/GroupDatabase');
const { saveChannelData, removeChannelData } = require('./database/lib/ChannelDatabase');
const { start } = require('repl');
const { MessageType } = require('@adiwajshing/baileys');

// Konfigurasi logger untuk menghilangkan output pino dari console
const logger = P({ level: 'silent' });
const groupDatabasePath = path.join(__dirname, 'database', 'group.json');
const userDatabasePath = path.join(__dirname, 'database', 'user.json');
const roleDatabasePath = path.join(__dirname, 'database', 'role.json');


const fotoPath = './database/foto';
if (!fs.existsSync(fotoPath)){
    fs.mkdirSync(fotoPath, { recursive: true });
}

// Fungsi untuk memberi tahu pemilik bot tentang error
const notifyOwner = async (sock, error) => {
    const roleData = fs.existsSync(roleDatabasePath) ? JSON.parse(fs.readFileSync(roleDatabasePath)) : { owners: [] };
    for (const owner of roleData.owners) {
        await sock.sendMessage(owner, { text: `Error: ${error}` });
    }
};
let sock;
//const sock = require ('./database/lib/myfunc')
// Fungsi utama untuk memulai bot

async function startBot() {
   
    const { state, saveCreds } = await useMultiFileAuthState('./session');
   
     sock = makeWASocket({
        auth: state,
        logger: logger
    });
    
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('message-new', async (m) => {
        if (m.message && m.message.conversation) {
            const commandText = m.message.conversation;
            const from = m.key.remoteJid; // Ambil remoteJid dari pesan
            await handleMenu(sock, from, commandText); // Panggil dengan benar
        }
    });
// Fungsi untuk memeriksa dan menyimpan user baru
const handleNewUser = async (sock, userJid) => {
    try {
        // Baca database user yang ada
        let users = [];
        if (fs.existsSync(userDatabasePath)) {
            users = JSON.parse(fs.readFileSync(userDatabasePath));
        }

        // Cek apakah user sudah ada di database
        const userExists = users.some(user => user.jid === userJid);

        if (!userExists) {
            // Jika user baru, tambahkan ke database
            const newUser = {
                jid: userJid,
                firstInteraction: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                messageCount: 1
            };

            users.push(newUser);

            // Simpan ke file database
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));

            // Kirim pesan selamat datang
            await sock.sendMessage(userJid, { 
                text: `Selamat datang! 👋\nTerimakasih telah menghubungi bot ini.\nKetik .menu untuk melihat daftar perintah yang tersedia.` 
            });

            console.log(`User baru tersimpan: ${userJid}`);
        } else {
            // Update lastInteraction dan messageCount untuk user yang sudah ada
            users = users.map(user => {
                if (user.jid === userJid) {
                    return {
                        ...user,
                        lastInteraction: new Date().toISOString(),
                        messageCount: (user.messageCount || 0) + 1,
                        coin : 0,
                        saldo: 0,
                        limit: 100
                    };
                }
                return user;
            });

            // Simpan perubahan ke file
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error handling new user:', error);
        await notifyOwner(sock, `Error handling new user: ${error.message}`);
    }
};
const handleGroupMessage = async (sock, groupJid, senderJid) => {
    try {
        // Baca database grup yang ada
        let groups = [];
        if (fs.existsSync(groupDatabasePath)) {
            groups = JSON.parse(fs.readFileSync(groupDatabasePath));
        }

        // Cek apakah grup sudah ada di database
        let group = groups.find(g => g.jid === groupJid);

        if (!group) {
            // Jika grup baru, tambahkan ke database
            const groupInfo = await sock.groupMetadata(groupJid);
            group = {
                jid: groupJid,
                name: groupInfo.subject,
                firstInteraction: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                messageCount: 1,
                members: groupInfo.participants.map(p => p.id),
                activeMembers: [senderJid]
            };
            groups.push(group);
        } else {
            // Update informasi grup yang sudah ada
            group.lastInteraction = new Date().toISOString();
            group.messageCount++;
            if (!group.activeMembers.includes(senderJid)) {
                group.activeMembers.push(senderJid);
            }
        }

        // Simpan ke file database
        fs.writeFileSync(groupDatabasePath, JSON.stringify(groups, null, 2));

        console.log(`Informasi grup diperbarui: ${groupJid}`);
    } catch (error) {
        console.error('Error handling group message:', error);
        await notifyOwner(sock, `Error handling group message: ${error.message}`);
    }
};
    sock.ev.on('messages.upsert', async (msg) => {
        try {
            const message = msg.messages[0];
            if (!message.message || message.key.fromMe) return;

            const from = message.key.remoteJid;
            const textMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
             // Cek apakah pesan dari grup atau chat pribadi
        const isGroup = from.endsWith('@g.us');

        if (isGroup) {
            // Jika pesan dari grup, panggil handleGroupMessage
            await handleGroupMessage(sock, from, sender);
        } else {
            // Jika pesan pribadi, panggil handleNewUser
            await handleNewUser(sock, from);
        }
            await handleNewUser(sock, from);
            
            if (message.message.imageMessage) {
                // Mendownload media gambar sebagai buffer
                const buffer = await downloadMediaMessage(message, 'buffer', {});

                // Pastikan buffer adalah tipe data yang benar
                if (Buffer.isBuffer(buffer)) {
                    // Simpan gambar ke dalam folder ./database/foto
                    const fileName = `${fotoPath}/${Date.now()}.jpg`;
                    fs.writeFileSync(fileName, buffer);
                    console.log(`Foto dari ${from} telah disimpan di: ${fileName}`);
                } else {
                    console.error('Download media gagal, tidak menerima buffer yang valid.');
                }
            }
            // Cetak pesan ke konsol
            console.log(`Pesan masuk dari ${from}: ${textMessage}`);

            // Auto-read pesan
            await sock.readMessages([message.key]);
            //balas pesan
            await menu.handleMenu(sock, from, textMessage);
            
        } catch (error) {
            console.error('Terjadi error:', error);
            await notifyOwner(sock, error); // Notifikasi error ke owner
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            console.log('Koneksi terputus, mencoba menyambung kembali...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot telah aktif sepenuhnya');
        }
    });
    // Fungsi untuk mengirim pesan
async function kirimPesan(nomor, pesan) {
    const id = nomor.includes('@s.whatsapp.net') ? nomor : nomor + '@s.whatsapp.net'; // Format ID nomor
    await sock.sendMessage(id, { text: pesan });
    console.log(`Pesan terkirim ke ${nomor}`);
}

module.exports = { kirimPesan };
console.log('Menjalankan bot (proses loading)...');
return { sock }; 
}

// Fungsi untuk memuat ulang menu.js
const reloadMenu = () => {
    delete require.cache[require.resolve('./menu')]; // Hapus cache dari menu
    menu = require('./menu'); // Reload menu.js
    console.log('menu.js berhasil di-reload.');
};

// Watch untuk file menu.js
fs.watch(path.join(__dirname, 'menu.js'), (eventType, filename) => {
    if (filename) {
        console.log(`menu.js telah diperbarui (${eventType}). Memuat ulang...`);
        reloadMenu(); // Memanggil fungsi reloadMenu
    }
});

// Watch untuk file index.js
fs.watch(path.join(__dirname, 'index.js'), (eventType, filename) => {
    if (filename) {
        console.log(`index.js diperbarui (${eventType}).`);
        // Reload index.js jika diperlukan, meskipun ini tidak umum dilakukan
        delete require.cache[require.resolve('./index')];
    }
});

module.exports = { startBot };
