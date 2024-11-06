const fs = require('fs');
const path = require('path');
const roleDatabasePath = path.join(__dirname, '..','role.json');




const isPremium = (from) => {
    if (!fs.existsSync(roleDatabasePath)) {
        console.error('Belum ada premium');
        return false;
    }
    const premiumData = JSON.parse(fs.readFileSync(roleDatabasePath));
    return premiumData.premium.includes(from); // Cek apakah nomor pengirim ada di daftar premium
};

const isOwner = (from) => {
    if (!fs.existsSync(roleDatabasePath)) {
        console.error('File role.json tidak ditemukan!');
        return false;
    }
    const ownerData = JSON.parse(fs.readFileSync(roleDatabasePath));
    return ownerData.owners.includes(from); // Cek apakah nomor pengirim ada di daftar owner
};

module.exports = { 
    isPremium,
    isOwner};