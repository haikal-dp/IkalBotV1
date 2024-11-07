
const db = require('../../setting/db');

const awal = (req, res) => {
    res.render('rules', { username: req.session.username });
};
const daftar = (req, res) => {
    const error = req.session.error || null;
    req.session.error = null;
    res.render('daftar', { error });
};

const tes = (req, res) => {
    res.render('tes'); // Merender tampilan 'tes3.ejs'
};
const plogin =  (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Error dalam proses login:', err);
            req.session.error = 'Internal server error';
            return res.redirect('/');
        }

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/');
        } else {
            req.session.error = 'Username atau password salah';
            res.redirect('/');
        }
    });
};
const pdaftar =  (req, res) => {
    const { username, password, email, telepon, bank_id, nama_rek, no_rek } = req.body;

    // Cek apakah username, telepon, atau nomor rekening sudah terdaftar
    db.query('SELECT * FROM users WHERE username = ? OR telepon = ? OR no_rek = ?', [username, telepon, no_rek], (err, results) => {
        if (err) {
            console.error('Error saat memeriksa data:', err);
            return res.status(500).send('Terjadi kesalahan saat memeriksa data');
        }

        if (results.length > 0) {
            req.session.error = 'Username, telepon, atau nomor rekening sudah terdaftar.';
            return res.redirect('/daftar');
        }

        // Jika semua pemeriksaan lolos, lanjutkan pendaftaran
        const query = 'INSERT INTO users (username, password, email, telepon, bank_id, nama_rek, no_rek) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, password, email, telepon, bank_id, nama_rek, no_rek], (err) => {
            if (err) {
                console.error('Error saat mendaftarkan user:', err);
                return res.status(500).send('Terjadi kesalahan saat mendaftar');
            }
            res.redirect('/');
        });
    });
};
const lobby =  (req, res) => {
    const username = req.session.username;
    db.query('SELECT saldo FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error saat mengambil saldo:', err);
            return res.status(500).send('Terjadi kesalahan saat mengambil saldo');
        }

        if (results.length > 0) {
            const balance = results[0].saldo; // Mengambil saldo dari hasil query
            res.render('lobby', { username, balance });
        } else {
            res.status(404).send('Pengguna tidak ditemukan');
        }
    });
};
const logout =  (req, res) => {
    // Hapus session
    req.session.destroy((err) => {
        if (err) {
            console.error('Gagal logout:', err);
            return res.status(500).send('Terjadi kesalahan saat logout');
        }
        // Redirect ke halaman login atau halaman utama setelah logout
        res.redirect('/');
    });
};

// Ekspor rute
module.exports = {
    awal,
    daftar,
    lobby,
    logout,
    plogin,
    pdaftar,
    tes
};