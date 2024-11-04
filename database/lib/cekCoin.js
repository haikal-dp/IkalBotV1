
const fs = require('fs');
const path = require('path');
const userFilePath = './database/user.json';
let users = JSON.parse(fs.readFileSync(userFilePath));

const userDatabasePath = path.join(__dirname, '..', 'user.json');

const cekCoin = (from) => {
    const data = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};

    if (data[from]) {
        return `${data[from].coin}`;
    } else {
        return 'Silahkan TopUp untuk Mendapatkan Saldo.';
    }
};

module.exports = {cekCoin};