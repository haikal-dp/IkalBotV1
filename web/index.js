const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const axios = require('axios');  // Tambahkan axios
const app = express();
const PORT = 80;
const otpkuapi = 'FIijZbzDScan95VEXWL87Trh4fAKyu';
const bodyParser = require('body-parser');

// Parse incoming request bodies
app.use(bodyParser.json());

// Middleware untuk parsing form data
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(session({
    secret: 'Haikubroook8383', // Key rahasia untuk menandatangani cookie sesi
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Set view engine ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Redirect root ke login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route untuk menampilkan halaman login (GET)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
// Route untuk menampilkan halaman about (GET)
app.get('/haikal', (req, res) => {
    res.render('t'); // Render halaman about.ejs
});


// Route untuk menangani login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const fullUsername = `${username}@s.whatsapp.net`;

    // Baca database user dari file JSON
    let users;
    try {
        users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'user.json'), 'utf-8'));
    } catch (error) {
        console.error("Error reading user database:", error);
        return res.send('Error reading user database.');
    }

    // Cari user berdasarkan full username
    const user = users[fullUsername];

    // Validasi username dan password
    if (user && user.password === password) {
        // Simpan data ke session
        req.session.username = user.username;
        req.session.saldo = user.saldo;

        // Redirect ke /nokos setelah login
        res.redirect('/nokos');
    } else {
        res.send('Login gagal! Username atau password salah.');
    }
});

// Route untuk menampilkan halaman nokos (GET) dan mengambil data dari API OTPku
app.get('/nokos', async (req, res) => {
    if (req.session.username) {
        // Mengambil data dari API OTPku
        try {
            const response = await axios.get(`https://otpku.id/api/json.php?api_key=${otpkuapi}&action=services&country=`);
            const services = response.data.data; // Ambil data dari response

            // Render halaman nokos.ejs dengan data services dari API dan username dari session
            res.render('nokos', {
                username: req.session.username,
                saldo: req.session.saldo,
                services: services // Kirim data services ke template
            });
        } catch (error) {
            console.error("Error fetching data from API:", error);
            res.send('Error fetching data from API.');
        }
    } else {
        res.redirect('/login');
    }
});

// Route untuk menampilkan detail transaksi di nokos-otp
app.get('/nokos-otp/:country/:serviceId', async (req, res) => {
    const { country, serviceId } = req.params;

    // Pastikan user sudah login
    if (!req.session.username) {
        return res.redirect('/login');
    }

    try {
        const response = await axios.get(`https://otpku.id/api/json.php?api_key=${otpkuapi}&action=services&country=${country}`);
        const services = response.data.data;

        // Cari layanan berdasarkan serviceId
        const selectedService = services.find(service => service.id === serviceId);

        if (selectedService) {
            // Mulai countdown dari 20 menit untuk setiap user
            if (!req.session.countdown || req.session.serviceId !== serviceId) {
                req.session.countdown = 20 * 60;  // Set countdown untuk 20 menit
                req.session.serviceId = serviceId;
            }

            res.render('nokos-otp', {
                country: selectedService.country,
                serviceId: selectedService.id,
                phoneNumber: req.session.username,  // Tampilkan username sebagai nomor telepon
                price: selectedService.price,
                tersedia: selectedService.tersedia,
                countdown: req.session.countdown  // Kirim countdown ke template
            });
        } else {
            res.send('Service not found');
        }
    } catch (error) {
        console.error("Error fetching data from API:", error);
        res.send('Error fetching data from API.');
    }
});

// Route untuk menampilkan form kirim pesan
app.get('/kirimpesan', (req, res) => {
    res.render('kirimpesan');  // Render file EJS di folder views
});
// Endpoint untuk mengirim pesan
app.post('/kirimpesan', async (req, res) => {
    const { nomor, pesan } = req.body;  // Ambil data nomor dan pesan dari request
    if (!nomor || !pesan) {
        return res.status(400).json({ status: 'Gagal', message: 'Nomor atau pesan tidak boleh kosong!' });
    }

    try {
        // Panggil fungsi di bawah yang akan mengirim pesan via Baileys
        await kirimPesanWhatsApp(nomor, pesan);
        res.status(200).json({ status: 'Sukses', message: `Pesan terkirim ke ${nomor}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'Gagal', message: 'Terjadi kesalahan saat mengirim pesan.' });
    }
});

// Mulai server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
