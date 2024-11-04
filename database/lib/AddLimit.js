const fs = require('fs');
const path = require('path');
const userDatabasePath = path.join(__dirname, '..', 'user.json');






const addLimit = (target, amount) => {
    const data = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};

    // Jika target ada dalam database, tambahkan limit
    if (data[target]) {
        data[target].limit += amount; // Tambah limit dengan jumlah yang diberikan
    } else {
        // Jika target tidak ditemukan, buat entri baru untuk target
        data[target] = {
            limit: amount,
            timestamp: new Date().toISOString()
        };
    }

    // Simpan perubahan ke user.json
    fs.writeFileSync(userDatabasePath, JSON.stringify(data, null, 2));
};


module.exports = { addLimit };