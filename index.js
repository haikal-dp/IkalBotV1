const { modul } = require('./database/lib/module')
const {axios, path, fs,pino, process} = modul
require('./setting');
const {notifyOwner,handleNewUser,handleGroupMessage} = require ('./database/lib/fungsi')
let menu = require('./menu'); // Menggunakan let agar bisa di-reassign
const { makeWASocket,useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
// Konfigurasi logger untuk menghilangkan output pino dari console
const logger = pino({ level: 'silent' });

const fotoPath = './database/foto';
if (!fs.existsSync(fotoPath)){
    fs.mkdirSync(fotoPath, { recursive: true });
}

let sock1, sock2;

async function startBot() {
    const { state: state1, saveCreds: saveCreds1 } = await useMultiFileAuthState('./session1');
    const { state: state2, saveCreds: saveCreds2 } = await useMultiFileAuthState('./session2');
   
    sock1 = makeWASocket({
        auth: state1,
        logger: logger
    });
    
    sock2 = makeWASocket({
        auth: state2,
        logger: logger
    });
    
    // Setup event listeners for sock1
    setupEventListeners(sock1, saveCreds1, '1');
    
    // Setup event listeners for sock2
    setupEventListeners(sock2, saveCreds2, '2');

    console.log('Menjalankan bot (proses loading)...');
    return { sock1, sock2 };
}

function setupEventListeners(sock, saveCreds, sockId) {
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('message-new', async (m) => {
        if (m.message && m.message.conversation) {
            const commandText = m.message.conversation;
            const from = m.key.remoteJid;
            await handleMenu(sock, from, commandText);
        }
    });

    sock.ev.on('messages.upsert', async (msg) => {
        try {
            const message = msg.messages[0];
            if (!message.message || message.key.fromMe) return;

            const from = message.key.remoteJid;
            const textMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
            const isGroup = from.endsWith('@g.us');
            try {
                await axios.post(`${global.domain}/api/logs`, {
                    from: from,
                    message: textMessage,
                    sockId: sockId,
                    timestamp: new Date().toISOString()
                });
                console.log(global.domain)
             } catch (error) {
                console.error('Gagal mengirim log ke server:', error);
            }
            if (isGroup) {
                const sender = message.key.participant || message.key.remoteJid;
                await handleGroupMessage(sock, from, sender);
            } else {
                await handleNewUser(sock, from);
            }
            
            if (message.message.imageMessage) {
                const buffer = await downloadMediaMessage(message, 'buffer', {});
                if (Buffer.isBuffer(buffer)) {
                    const fileName = `${fotoPath}/${Date.now()}_${sockId}.jpg`;
                    fs.writeFileSync(fileName, buffer);
                    console.log(`Foto dari ${from} telah disimpan di: ${fileName}`);
                } else {
                    console.error('Download media gagal, tidak menerima buffer yang valid.');
                }
            }
            
            console.log(`Pesan masuk dari ${from} (Sock ${sockId}): ${textMessage}`);

            //await sock.readMessages([message.key]);
            await menu.handleMenu(sock, from, textMessage);
            
        } catch (error) {
            console.error(`Terjadi error pada Sock ${sockId}:`, error);
            await notifyOwner(sock, error);
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            console.log(`Koneksi terputus untuk Sock ${sockId}, mencoba menyambung kembali...`, shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(`Bot Sock ${sockId} telah aktif sepenuhnya`);
        }
    });
}

// Fungsi untuk mengirim pesan
async function kirimPesan(sock, nomor, pesan) {
    const id = nomor.includes('@s.whatsapp.net') ? nomor : nomor + '@s.whatsapp.net';
    await sock.sendMessage(id, { text: pesan });
    console.log(`Pesan terkirim ke ${nomor}`);
}

// Fungsi untuk memuat ulang menu.js
const reloadMenu = () => {
    delete require.cache[require.resolve('./menu')];
    menu = require('./menu');
    console.log('menu.js berhasil di-reload.');
};

// Watch untuk file menu.js
fs.watch(path.join(__dirname, 'menu.js'), (eventType, filename) => {
    if (filename) {
        console.log(`menu.js telah diperbarui (${eventType}). Memuat ulang...`);
        reloadMenu();
    }
});

// Watch untuk file index.js
fs.watch(path.join(__dirname, 'index.js'), (eventType, filename) => {
    if (filename) {
        console.log(`index.js diperbarui (${eventType}).`);
        delete require.cache[require.resolve('./index')];
    }
});

module.exports = { startBot, kirimPesan };