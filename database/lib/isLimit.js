const fs = require('fs');
const userFilePath = './database/user.json';
let users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));

// Fungsi untuk mengecek dan mengurangi limit
const isLimit = (sender) => {
    if (!users[sender]) {
        // Jika pengguna baru, tambahkan limit 100
        users[sender] = { limit: 100 };
    }

    if (users[sender].limit > 0) {
        users[sender].limit -= 1; // Kurangi limit
        fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2)); // Simpan perubahan
        return true; // Masih ada limit
    } else {
        return false; // Jika limit habis
    }
};

module.exports = { isLimit };
