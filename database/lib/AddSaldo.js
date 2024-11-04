const fs = require('fs');
const path = require('path');
const userDatabasePath = path.join(__dirname, '..', 'user.json');






const addSaldo = (target, amount) => {
    const data = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};

    // Jika target ada dalam database, tambahkan limit
    if (data[target]) {
        data[target].saldo += amount; // Tambah limit dengan jumlah yang diberikan
    } else {
        // Jika target tidak ditemukan, buat entri baru untuk target
        data[target] = {
            saldo: amount,
            timestamp: new Date().toISOString()
        };
    }

    // Simpan perubahan ke user.json
    fs.writeFileSync(userDatabasePath, JSON.stringify(data, null, 2));
};

module.exports = { addSaldo };