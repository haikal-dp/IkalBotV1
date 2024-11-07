const express = require('express');
const path = require('path');
const { startBot } = require('./index'); // Import startBot dari file index.js
const app = express();
const axios = require('axios');  // Tambahkan axios

const port = process.env.PORT || 9999;

app.use(express.json({ limit: '10mb' }));
let sock1; // Variabel global untuk menyimpan sock1
// Di bagian atas app.js
let messageLogs = [];
// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));


// Mulai bot dan simpan sock1
startBot().then((result) => {
    sock1 = result.sock1; // Ambil sock1 dari hasil startBot
    console.log('Telah Tersambung Pada Server Express');
}).catch((err) => {
    console.error('Gagal memulai bot:', err);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/logs', (req, res) => {
    res.render('logs', { messages: messageLogs });
});

// Endpoint API untuk mendapatkan logs dalam format JSON
app.get('/api/logs', (req, res) => {
    res.json(messageLogs);
});

// Endpoint untuk menerima logs baru
app.post('/api/logs', (req, res) => {
    const { from, message, sockId, timestamp } = req.body;
    messageLogs.unshift({ from, message, sockId, timestamp }); // Menambah log baru di awal array
    if (messageLogs.length > 100) { // Batasi jumlah log yang disimpan
        messageLogs = messageLogs.slice(0, 100);
    }
    res.json({ success: true });
});
// Endpoint untuk mengirim pesan
app.post('/kirimpesan', async (req, res) => {
    const { nomor, pesan } = req.body;

    if (!nomor || !pesan) {
        return res.status(400).send({ error: 'Nomor dan pesan harus disertakan!' });
    }

    try {
        // Kirim pesan menggunakan sock1
        await sock1.sendMessage(nomor + '@s.whatsapp.net', { text: pesan });
        res.send({ status: 'Pesan berhasil dikirim!' });
        console.log('Pesan dikirim')
    } catch (err) {
        console.error('Gagal mengirim pesan:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan' });
    }
});

app.post('/tiktok', async (req, res) => {
    const { nomor, whoL,like, totalL, viewc, pesan, join, who, komen, view, follow,wholL, whoid } = req.body;

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


app.get('/kirimpesan', (req, res) => {
    res.render('kirimpesan')
})
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
