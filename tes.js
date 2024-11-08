saya mau nih untuk bot WhatsApp Milik saya dapat di non aktifka melalui express js ,

ini file express saya untuk refrensi

require('./setting');
const express = require('express');
const path = require('path');
const { startBot } = require('./index');
const app = express();
const axios = require('axios');
const secret = require('./setting/modul').secret;
const ceklogin = require('./setting/modul').ceklogin;
const HarusLogin = require('./setting/modul').HarusLogin;
const fs = require('fs');
const db = require('./setting/db');
const {error404, error403, error500} = require('./function/page/error');
const {awal, tes, logout, lobby, pdaftar, plogin, daftar} = require('./function/page/pengguna.js');
const {flipc, tebakangka, ptebakangka} = require('./function/page/game');
const { apilogs,logs, kirimpesan } = require('./function/page/page.js');
const port = process.env.PORT || global.port;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

let sock1;
let sock2
startBot().then((result) => {
    sock1 = result.sock1;
    sock2 = result.sock2
    console.log('Telah Tersambung Pada Server Express | sock1 dan sock2');
}).catch((err) => {
    console.error('Gagal memulai bot:', err);
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(secret);
app.get('/'), (res,req) =>{
    res.send('hallo')
}
app.get('/tes', tes);
app.get('/login', HarusLogin, awal);
app.get('/lobby', HarusLogin, lobby);
app.get('/daftar', daftar);
app.get('/flip-coin', ceklogin, flipc);
app.get('/tebakangka', ceklogin, tebakangka);
app.get('/logs',logs);
app.get('/api/logs',apilogs);
app.get('/kirimpesan', kirimpesan);

//post
app.post('/daftar', pdaftar);
app.post('/login', plogin);
app.post('/tebakangka/play', ceklogin, ptebakangka);
app.get('/logout', logout);
app.post('/api/logs', (req, res) => {
    const { from, message, sockId, timestamp } = req.body;
    messageLogs.unshift({ from, message, sockId, timestamp });
    if (messageLogs.length > 100) {
        messageLogs = messageLogs.slice(0, 100);
    }
    res.json({ success: true });
});
app.post('/kirimpesan', async (req, res) => {
    const { nomor, pesan } = req.body;
    if (!nomor || !pesan) {
        return res.status(400).send({ error: 'Nomor dan pesan harus disertakan!' });
    }
    try {
        await sock1.sendMessage(nomor + '@s.whatsapp.net', { text: pesan });
        res.send({ status: 'Pesan berhasil dikirim!' });
        console.log('Pesan dikirim');
    } catch (err) {
        console.error('Gagal mengirim pesan:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan' });
    }
});
app.post('/tiktok', async (req, res) => {
    const { nomor, whoL, like, totalL, viewc, pesan, join, who, komen, view, follow, wholL, whoid } = req.body;
    try {
        if (komen) {
            await sock1.sendMessage('120363333754784062@g.us', { text: `TIKTOK LIVE :\n\n${who} (userId: ${whoid})\nberkomentar: ${komen}` });
        }
        if (join) {
            await sock1.sendMessage('120363336894802532@g.us', { text: `TIKTOK LIVE :\n\n${join} bergabung ke dalam live` });
        }
        if (totalL) {
            await sock1.sendMessage('120363334817188660@g.us', { text: `TIKTOK LIVE :\n\n${whoL} mengirim like sebanyak ${like}\n\nTotal Likes: ${totalL}` });
        }
        if (viewc) {
            await sock1.sendMessage('120363334577871397@g.us', { text: `TIKTOK LIVE :\n\nTotal Views Now: ${viewc}` });
        }

        const dataToSend = { nomor, like, totalL, viewc, pesan, join, whoL, who, komen, view, follow, whoid };
        const response = await axios.post('https://haikung.my.id/data/tiktok', dataToSend);
        console.log('Data berhasil dikirim ke haikung:', response.data);
        res.send({ status: 'Pesan dan data berhasil dikirim!' });
    } catch (err) {
        console.error('Gagal mengirim pesan atau data:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan atau data' });
    }
});

// Error handlers
app.use(error403);
app.use(error404);
app.use(error500);

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});


ini untuk file index.js (file induk bot)

const { modul } = require('./database/lib/module')
const { axios, path, fs, pino, process } = modul
require('./setting');
const { notifyOwner, handleNewUser, handleGroupMessage } = require('./database/lib/fungsi')
let menu = require('./menu'); // Menggunakan let agar bisa di-reassign
const { makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
// Konfigurasi logger untuk menghilangkan output pino dari console
const logger = pino({ level: 'silent' });

const fotoPath = './database/foto';
if (!fs.existsSync(fotoPath)) {
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
            // try {
            //     await axios.post(`${global.domain}/api/logs`, {
            //         from: from,
            //         message: textMessage,
            //         sockId: sockId,
            //         timestamp: new Date().toISOString()
            //     });
            //     console.log(global.domain)
            //  } catch (error) {
            //     console.error('Gagal mengirim log ke server:', error);
            // }
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