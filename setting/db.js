const mysql = require('mysql2')

// Buat koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'haikungm_bots', // Ganti dengan username MySQL kamu
    password: 'Haikallol123', // Ganti dengan password MySQL kamu
    database: 'haikungm_bots'
});

// Cek koneksi
db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err);
        return;
    }
    console.log('Terhubung ke database MySQL');
});

module.exports = (db);