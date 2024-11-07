const mysql = require('mysql2')

// Buat koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan username MySQL kamu
    password: '', // Ganti dengan password MySQL kamu
    database: 'express'
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