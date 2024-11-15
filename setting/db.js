const mysql = require('mysql2');
require ('../setting');
// Buat koneksi ke database
const db = mysql.createConnection({
    host: global.hostdb, // Tetap gunakan 'localhost' jika database berada di server yang sama
    user: global.userdb, // Gunakan username yang Anda buat di cPanel
    password: global.passdb, // Masukkan password yang Anda tentukan di cPanel
    database: global.namadb // Gunakan nama database yang benar
});

// Cek koneksi
db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err);
        return;
    }
    consolea.log('Terhubung ke database MySQL');
});

module.exports = db;



// const mysql = require('mysql2');

// // Buat koneksi ke database
// const db = mysql.createConnection({
//     host: 'localhost', // Tetap gunakan 'localhost' jika database berada di server yang sama
//     user: 'root', // Gunakan username yang Anda buat di cPanel
//     password: '', // Masukkan password yang Anda tentukan di cPanel
//     database: 'express' // Gunakan nama database yang benar
// });

// // Cek koneksi
// db.connect((err) => {
//     if (err) {
//         console.error('Koneksi ke database gagal:', err);
//         return;
//     }
//     console.log('Terhubung ke database MySQL');
// });

// module.exports = db;
