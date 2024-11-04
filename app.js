const express = require('express');
const path = require('path');
const { startBot } = require('./index'); // Import startBot dari file index.js
const app = express();
const fs = require('fs');
const session = require('express-session');
const axios = require('axios');  // Tambahkan axios
const { text } = require('body-parser');
const { waLabelAssociationKey } = require('@whiskeysockets/baileys/lib/Store/make-in-memory-store');
const otpkuapi = 'FIijZbzDScan95VEXWL87Trh4fAKyu';

const port = process.env.PORT || 9999;

app.use(express.json({ limit: '10mb' }));
let sock; // Variabel global untuk menyimpan sock

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(session({
    secret: 'Haikubroook8383', // Key rahasia untuk menandatangani cookie sesi
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Mulai bot dan simpan sock
startBot().then((result) => {
    sock = result.sock; // Ambil sock dari hasil startBot
    console.log('Bot berhasil dijalankan');
}).catch((err) => {
    console.error('Gagal memulai bot:', err);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Redirect root ke login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Endpoint untuk mengirim pesan
app.post('/kirimpesan', async (req, res) => {
    const { nomor, pesan } = req.body;

    if (!nomor || !pesan) {
        return res.status(400).send({ error: 'Nomor dan pesan harus disertakan!' });
    }

    try {
        // Kirim pesan menggunakan sock
        await sock.sendMessage(nomor + '@s.whatsapp.net', { text: pesan });
        res.send({ status: 'Pesan berhasil dikirim!' });
    } catch (err) {
        console.error('Gagal mengirim pesan:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan' });
    }
});

app.post('/tiktok', async (req, res) => {
    const { nomor, whoL,like, totalL, viewc, pesan, join, who, komen, view, follow,wholL, whoid } = req.body;

    try {
        if (komen) {
            await sock.sendMessage('120363333754784062@g.us', { text: `TIKTOK LIVE :\n\n${who} (userId: ${whoid})\nberkomentar: ${komen}` });
        }
        if (join) {
            await sock.sendMessage('120363336894802532@g.us', { text: `TIKTOK LIVE :\n\n${join} bergabung ke dalam live` });
        }
        if (totalL) {
            await sock.sendMessage('120363334817188660@g.us', { text: `TIKTOK LIVE :\n\n${whoL} mengirim like sebanyak ${like}\n\nTotal Likes: ${totalL}` });
        }
        if (viewc) {
            await sock.sendMessage('120363334577871397@g.us', { text: `TIKTOK LIVE :\n\nTotal Views Now: ${viewc}` });
        }

        // Menyiapkan data untuk dikirim ke server haikung.my.id
        const dataToSend = {
            nomor,
            like,
            totalL,
            viewc,
            pesan,
            join,
            whoL,
            who,
            komen,
            view,
            follow,
            whoid
        };

        // Mengirim data ke endpoint haikung.my.id
        const response = await axios.post('https://haikung.my.id/data/tiktok', dataToSend);

        console.log('Data berhasil dikirim ke haikung:', response.data);

        res.send({ status: 'Pesan dan data berhasil dikirim!' });
    } catch (err) {
        console.error('Gagal mengirim pesan atau data:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan atau data' });
    }
});
// Endpoint untuk mengecek status bot
app.get('/', (req, res) => {
    res.send('Bot WhatsApp berjalan!');
});

app.get('/foto', (req, res) => {
    const fotoDir = path.join(__dirname, 'database', 'foto');

    // Membaca semua file di folder ./database/foto
    fs.readdir(fotoDir, (err, files) => {
        if (err) {
            console.error('Gagal membaca folder foto:', err);
            return res.status(500).send('Gagal membaca folder foto');
        }

        // Filter file untuk memastikan hanya gambar yang dikirim ke frontend
        const fotoFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

        // Render halaman dengan daftar foto
        res.render('foto', { fotoFiles });
    });
});

app.get('/kirimpesan', (req, res) => {
    res.render('kirimpesan')
})
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
