const fs = require('fs');
const path = require('path');

const userDatabasePath = path.join(__dirname, '..', 'user.json');

const userFilePath = './database/user.json';
let users = JSON.parse(fs.readFileSync(userFilePath));




const cekLimit = (from) => {
    const data = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};

    if (data[from]) {
        return `${data[from].limit}`;
    } else {
        return 'Kamu belum terdaftar dalam database, silahkan kirim pesan apa saja untuk mendaftar dan mendapatkan limit.';
    }
};


module.exports = { cekLimit };
