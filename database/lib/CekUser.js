
const fs = require('fs');
const path = require('path');
const userFilePath = './database/user.json';
let users = JSON.parse(fs.readFileSync(userFilePath));

const userDatabasePath = path.join(__dirname, '..', 'user.json');

const CekUser = (from) => {
    const data = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};

    if (data[from]) {
        return `${data[from]}`;
    } else {
        return 'Kamu Belum Terdaftar';
    }
};

module.exports = {CekUser};