require('./setting');
const express = require('express');
const path = require('path');
const { startBot, replynano } = require('./index');
const app = express();
const axios = require('axios');
const secret = require('./setting/modul').secret;
const ceklogin = require('./setting/modul').ceklogin;
const HarusLogin = require('./setting/modul').HarusLogin;
const fs = require('fs');
const db = require('./setting/db');
const { error404, error403, error500 } = require('./function/page/error');
const { awal, tes, logout, lobby, pdaftar, plogin, daftar } = require('./function/page/pengguna.js');
const { flipc, tebakangka, ptebakangka } = require('./function/page/game');
const { apilogs, user, foto,salon, index,logs, kirimpesan2,kirimpesan } = require('./function/page/page.js');
const port = process.env.PORT || global.port;

app.use(secret);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

let sock1;
let sock2;

startBot().then((result) => {
    sock1 = result.sock1;
    sock2 = result.sock2
    console.log('Telah Tersambung Pada Server Express');
}).catch((err) => {
    console.error('Gagal memulai bot:', err);
});
require('./setting.js')
app.get('/salon', salon)
app.get('/', index);
app.get('/foto', foto);
app.get('/user', user);
app.get('/tes', tes);
app.get('/login', HarusLogin, awal);
app.get('/lobby', HarusLogin, lobby);
app.get('/daftar', daftar);
app.get('/flip-coin', ceklogin, flipc);
app.get('/tebakangka', ceklogin, tebakangka);
app.get('/logs', logs);
app.get('/api/logs', apilogs);
app.get('/kirimpesan', kirimpesan);
app.get('/kirimpesan2', kirimpesan2);

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
app.post('/kirimpesan2', async (req, res) => {
    const { nomor, pesan } = req.body;
    
const fkontak = { key: {participant: `0@s.whatsapp.net`, ...(nomor + '@s.whatsapp.net' ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': `Haikal Dwi Putra`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${`'ownername'`},;;;\nFN:${`'ownername'`}\nitem1.TEL;waid=6285892928715:6285892928715\nitem1.X-ABLabel:Mobile\nEND:VCARD`, 'jpegThumbnail': global.thumb, thumbnail: global.thumb,sendEphemeral: true}}}

    if (!nomor || !pesan) {
        return res.status(400).send({ error: 'Nomor dan pesan harus disertakan!' });
    }
    try {
        sock2.sendMessage(nomor + '@s.whatsapp.net',
            { text: pesan,
                contextInfo:{
                mentionedJid:[nomor + '@s.whatsapp.net'],
                forwardingScore: 0,
                isForwarded: false,
                "externalAdReply": {
                "showAdAttribution": true,
                "containsAutoReply": true,
                "title": `Haikal Dwi Putra`,
                "body": `Ini Portofolio saya👇`,
                "previewType": "VIDEO",
                "thumbnailUrl": 'https://telegra.ph/file/49f2b139a2aff4bb934f7.jpg',
                "sourceUrl": 'https://haikung.my.id'}}},
                {})
        //replynano
        //await sock2.sendMessage(nomor + '@s.whatsapp.net', { text: pesan });
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

app.listen(port,'localhost', () => {
    console.log(`Server berjalan di port ${port}`);
});

module.exports = {
    sock1,
    startBot
}
