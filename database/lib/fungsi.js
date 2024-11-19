const fs = require('fs');
const path = require('path');
const {groupDatabasePath,userDatabasePath,roleDatabasePath} = require('./savedata.js')
require('../../setting.js')
// Fungsi untuk memberi tahu pemilik bot tentang error
const notifyOwner = async (sock, error) => {
    const roleData = fs.existsSync(roleDatabasePath) ? JSON.parse(fs.readFileSync(roleDatabasePath)) : { owners: [] };
    for (const owner of roleData.owners) {
        await sock.sendMessage(owner, { text: `Error: ${error}` });
    }
};

// Fungsi untuk memeriksa dan menyimpan user baru
const handleNewUser  = async (sock, userJid) => {
    try {
        // Baca database user yang ada
        let users = [];
        if (fs.existsSync(userDatabasePath)) {
            users = JSON.parse(fs.readFileSync(userDatabasePath));
        }

        // Cek apakah user sudah ada di database
        const userExists = users.some(user => user.jid === userJid);

        if (!userExists) {
            // Jika user baru, tambahkan ke database
            const newUser  = {
                jid: userJid,
                firstInteraction: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                messageCount: 1
            };

            users.push(newUser );

            // Simpan ke file database
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
            if (global.newUser){
            // Tunggu 10 detik sebelum mengirim pesan
            await new Promise(resolve => setTimeout(resolve, 12000));

            // Kirim pesan selamat datang
            await sock.sendMessage(userJid, { 
                text: global.hehe0
            });
            await new Promise(resolve => setTimeout(resolve, 15000));

            // Kirim pesan selamat datang
            await sock.sendMessage(userJid, { 
                text: global.hehe
            });
            
            await new Promise(resolve => setTimeout(resolve, 10000));

            await sock.sendMessage(userJid,{
                text: 'sampai sini bisa di fahami?\nSaya akan melanjutkan penjelasan '
            })
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Kirim pesan kedua setelah pesan pertama
            await sock.sendMessage(userJid, { 
                text: global.hehe2
            });
            
            await new Promise(resolve => setTimeout(resolve, 15000));

            // Kirim pesan suara
            const voiceNotePath = path.join(__dirname, '..', '..', 'database', 'audio', 'gg.ogg');
            
            const vd  = path.join(__dirname, '..', '..', 'database', 'audio', 'tes.mp4');
            await sock.sendMessage(userJid, {
                audio: { url: voiceNotePath },
                mimetype: 'audio/mpeg',
                ptt: true
            });
            
            await new Promise(resolve => setTimeout(resolve, 5000));
            
                sock.sendMessage(userJid, { caption: global.vmess, video: { url: vd } })
            } else {
              }
            
            console.log(`User  baru tersimpan: ${userJid}`);
        } else {
            // Update lastInteraction dan messageCount untuk user yang sudah ada
            users = users.map(user => {
                if (user.jid === userJid) {
                    return {
                        ...user,
                        lastInteraction: new Date().toISOString(),
                        messageCount: (user.messageCount || 0) + 1,
                    };
                }
                return user;
            });

            // Simpan perubahan ke file
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error handling new user:', error);
        await notifyOwner(sock, `Error handling new user: ${error.message}`);
    }
};

const handleGroupMessage = async (sock, groupJid, senderJid) => {
    try {
        // Baca database grup yang ada
        let groups = [];
        if (fs.existsSync(groupDatabasePath)) {
            groups = JSON.parse(fs.readFileSync(groupDatabasePath));
        }

        // Cek apakah grup sudah ada di database
        let group = groups.find(g => g.jid === groupJid);

        if (!group) {
            // Jika grup baru, tambahkan ke database
            const groupInfo = await sock.groupMetadata(groupJid);
            group = {
                jid: groupJid,
                name: groupInfo.subject,
                firstInteraction: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                messageCount: 1,
                members: groupInfo.participants.map(p => p.id),
                activeMembers: [senderJid]
            };
            groups.push(group);
        } else {
            // Update informasi grup yang sudah ada
            group.lastInteraction = new Date().toISOString();
            group.messageCount++;
            if (!group.activeMembers.includes(senderJid)) {
                group.activeMembers.push(senderJid);
            }
        }

        // Simpan ke file database
        fs.writeFileSync(groupDatabasePath, JSON.stringify(groups, null, 2));

        console.log(`Informasi grup diperbarui: ${groupJid}`);
    } catch (error) {
        console.error('Error handling group message:', error);
        await notifyOwner(sock, `Error handling group message: ${error.message}`);
    }
};
const updateVoucherStatus = (kode, status) => {
    const filePath = path.join(__dirname, '..', 'voucher.json');
    const vouchers = readVouchers();
    const voucher = vouchers.vouchers.find(v => v.kode === kode);

    if (voucher) {
        voucher.redeemed = status;
        fs.writeFileSync(filePath, JSON.stringify(vouchers, null, 2));
    } else {
        console.error(`Voucher dengan kode ${kode} tidak ditemukan.`);
    }
};
const readVouchers = () => {
    const filePath = path.join(__dirname, '..', 'voucher.json');
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath));
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return { vouchers: [] }; // Kembalikan array kosong jika terjadi kesalahan
        }
    }
    return { vouchers: [] }; // Kembalikan array kosong jika file tidak ada
};
const addVoucher = (paket, harga, kode) => {
    const filePath = path.join(__dirname, '..', 'voucher.json');
    const vouchers = readVouchers();

    // Cek apakah kode sudah ada
    const existingVoucher = vouchers.vouchers.find(v => v.kode === kode);
    if (existingVoucher) {
        return `Voucher dengan kode ${kode} sudah ada.`;
    }

    // Tambahkan voucher baru
    vouchers.vouchers.push({
        paket: paket,
        harga: harga,
        kode: kode,
        redeemed: false
    });

    fs.writeFileSync(filePath, JSON.stringify(vouchers, null, 2));
    return `Voucher baru berhasil ditambahkan: ${paket} - Rp.${harga} - Kode: ${kode}`;
};

module.exports = {
    notifyOwner,
    handleNewUser,
    updateVoucherStatus,
    readVouchers,
    addVoucher,
    handleGroupMessage
}