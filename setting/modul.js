const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const session = require('express-session');

const secret = session({
    secret: 'HaikungAntiJebol', // ganti dengan secret yang lebih aman
    resave: false,
    saveUninitialized: true,
    cookie: {
        resave: false,
        saveUninitialized: true,
         secure: false,//http or no kal!!
         maxAge: 3600000, // 1 jam dalam milidetik
        } 
});
function ceklogin(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/'); // Arahkan ke halaman login jika belum login
    }
}

// Middleware untuk memeriksa autentikasi
function HarusLogin(req, res, next) {
    if (req.session.loggedin) {
        next(); // Lanjut ke route berikutnya jika sudah login
    } else {
        req.session.error = req.session.error || null; // Set error jika ada
        res.render('login', { error: req.session.error });
        req.session.error = null; // Reset error setelah ditampilkan
    }
}



module.exports = {
    express,
    path,
    app,
    session,
    HarusLogin,
    ceklogin,
    secret,
    fs
}