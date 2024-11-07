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
const { apilogs,logs, pkirimpesan, papilogs, ptiktok, kirimpesan } = require('./function/page/page.js');
const port = process.env.PORT || 80;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

let sock1;

startBot().then((result) => {
    sock1 = result.sock1;
    console.log('Telah Tersambung Pada Server Express');
}).catch((err) => {
    console.error('Gagal memulai bot:', err);
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(secret);

app.get('/tes', tes);
app.get('/', HarusLogin, awal);
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
app.post('/api/logs', papilogs);
app.post('/kirimpesan', pkirimpesan);
app.post('/tiktok', ptiktok);

// Error handlers
app.use(error403);
app.use(error404);
app.use(error500);

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});