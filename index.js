const { modul } = require('./database/lib/module')
const {axios, path, fs,pino, process} = modul
const {notifyOwner,handleNewUser,handleGroupMessage} = require ('./database/lib/fungsi')
let menu = require('./menu'); // Menggunakan let agar bisa di-reassign
const { makeWASocket,useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
// Konfigurasi logger untuk menghilangkan output pino dari console
const logger = pino({ level: 'silent' });


const fotoPath = './database/foto';
if (!fs.existsSync(fotoPath)){
    fs.mkdirSync(fotoPath, { recursive: true });
}


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
