const fs = require('fs');
const path = require('path');
const roleDatabasePath = path.join(__dirname, '..','role.json');
const isOwner = (from) => {
    if (!fs.existsSync(roleDatabasePath)) {
        console.error('File role.json tidak ditemukan!');
        return false;
    }
    const ownerData = JSON.parse(fs.readFileSync(roleDatabasePath));
    return ownerData.owners.includes(from); // Cek apakah nomor pengirim ada di daftar owner
};
module.exports = { isOwner };