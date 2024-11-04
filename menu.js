require('./setting');//require('./database/lib/bankcek');
const { modul } = require('./database/lib/module')

require('./database/listmenu');

const { clockString, parseMention, formatp, tanggal, getTime, isUrl, sleep, runtime, fetchJson, getBuffer, jsonformat, format, reSize, generateProfilePicture, getRandom } = require('./database/lib/myfunc')
const { os, axios, baileys, chalk, cheerio, path, child_process, crypto, cookie, FormData, FileType, fetch, fs, fsx, ffmpeg, Jimp, jsobfus, PhoneNumber, process, moment, ms, speed, syntaxerror, util, ytdl, googleTTS, nodecron, maker } = modul

const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, generateForwardMessageContent } = baileys
const { error } = require('console');

const { isGroup } = require('./database/lib/isGroup');
const { isPc } = require('./database/lib/isPc');
const { isOwner } = require('./database/lib/isOwner');
const { isPremium } = require('./database/lib/isPremium');
const { addLimit } = require('./database/lib/AddLimit')
const { addSaldo } = require ('./database/lib/AddSaldo');
const { isLimit } = require('./database/lib/isLimit');
const { cekLimit } = require('./database/lib/cekLimit');
const { cekSaldo } = require('./database/lib/cekSaldo');
const { cekCoin } = require('./database/lib/cekCoin');

const vouchers = JSON.parse(fs.readFileSync('./database/voucher.json'));
// Path ke file owner.json dan user.json
const roleDatabasePath = path.join(__dirname, 'database', 'role.json');
const userDatabasePath = path.join(__dirname, 'database', 'user.json');

module.exports = handleMenu = async (sock, from, commandText) => {
    const users = JSON.parse(fs.readFileSync('./database/user.json'));
    const sender = from; // Ambil pengirim pesan
    const reply = (message) => sock.sendMessage(from, { text: message }); // Fungsi untuk membalas pesan
    const command = commandText.split(' ')[0].toLowerCase();
    const args = commandText.slice(command.length + 1).trim().split(/\s+/); // Ubah menjadi array
    const text = args.join(' '); // Ini akan bekerja dengan args sebagai array
    const pesan = args.slice(1).join(' ');
    const widipe = axios.create({
        baseURL: 'https://widipe.com',
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    }); switch (command) {
        case 'nyulikv2': {
        if (!isOwner) return reply('Khusus owner bro!');
            //if (!isGroup(from)) return reply('Perintah ini hanya bisa digunakan di dalam grup!');
            
            // Path ke file JSON yang berisi daftar nomor
            const jsonFilePath = './nomor.json'; // Sesuaikan path ini dengan path sebenarnya
            
            if (!fs.existsSync(jsonFilePath)) return reply('File nomor tidak ditemukan!');const nomorList = JSON.parse(fs.readFileSync(jsonFilePath));
            
            if (!Array.isArray(nomorList) || nomorList.length === 0) return reply('Tidak ada nomor yang tersedia untuk dimasukkan.');
        reply(`Proses menambahkan ${nomorList.length} nomor ke grup dimulai...`);
        
            // Fungsi untuk menambahkan nomor dengan delay
            const addMembers = async () => {
                for (let i = 0; i < nomorList.length; i++) {
                    const targetJid = nomorList[i];
                    try {
                        await sock.groupParticipantsUpdate(from, [targetJid], 'add'); // Tambahkan nomor ke grup
                        reply(`Berhasil menambahkan ${targetJid} ke grup.`);
                    } catch (err) {
                        reply(`Gagal menambahkan ${targetJid} ke grup.`);
                        console.error(err);
                    }
                    // Delay 5 detik sebelum menambahkan nomor berikutnya
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            };
        
            // Jalankan fungsi untuk menambahkan nomor
            addMembers();
        
            break;
        }
        
        case 'nyulik': {
            //if (!isGroup(from)) return reply('Perintah ini hanya bisa digunakan di dalam grup!');
            
            if (!text) return reply('Masukkan nomor yang valid!');
        
            const targetJid = `${text}@s.whatsapp.net`; // Nomor yang akan dimasukkan ke grup
            
            try {
                await sock.groupParticipantsUpdate(from, [targetJid], 'add'); // Tambahkan nomor ke grup
                reply(`Berhasil menambahkan ${text} ke grup!`);
            } catch (err) {
                reply('Gagal menambahkan nomor ke grup. Mungkin bot tidak memiliki izin.');
                console.error(err);
            }
            break;
        }
            case 'chord':{
            
                if (!text) return reply('Kamu mau cari chord lagu apa nih ');
            
                widipe.get(`/chord?query=${encodeURIComponent(text)}`)
                    .then(response => {
                        const thumb = response.data.result.thumb;
                        const title = response.data.result.title;
                        const album = response.data.result.album;
                        const chord = response.data.result.chord;  // Ambil 'result' dari respons
                       // sock.sendMessage(from, { image: { url: `${thumb}` }, caption: `Berikut hasil gpencarian lagunya\n\nJudul:${title}\nAlbum:${album}\n\nLiriknya:${lirik}`});
          
                        reply(`Judul:${text}\n\nNih Cordnya\n\n${chord}`);  // Kirim hasil kembali ke pengguna
                        
                    })
                    .catch(error => {
                        console.error('Error during the request:', error);
                        reply('Maaf, terjadi kesalahan saat memproses permintaan.');
                    });
                break;
                }
                case 'ringtone': {
                    if (!text) return reply('Contoh Ringtone: iphone');
                
                    widipe.get(`/ringtone?text=${encodeURIComponent(text)}`)
                        .then(response => {
                            const results = response.data.result;
                            if (!results.length) return reply('Tidak ditemukan ringtone.');
                
                            // Variabel untuk menyimpan hasil
                            let resultText = '';
                
                            // Looping setiap item dan gabungkan hasilnya
                            results.forEach(item => {
                                const title = item.title || 'Tidak ada judul';
                                const source = item.source || 'Tidak ada sumber';
                                const audio = item.audio || 'Tidak ada audio';
                                resultText += `🎵 *Judul*: ${title}\n🔗 *Sumber*: ${source}\n🔊 *Audio*: ${audio}\n\n`;
                            });
                
                            // Mengirim hasil ke pengguna
                            reply(resultText.trim());
                        })
                        .catch(error => {
                            console.error('Error during the request:', error);
                            reply('Maaf, terjadi kesalahan saat memproses permintaan.');
                        });
                    break;
                }
                case 'addvoucher':
                    if (!isOwner) return reply('Khusus owner bro!');
                    
                    let amount = args[0];
                    if (!amount || isNaN(amount)) return reply('Tolong masukkan jumlah saldo!');
                
                    // Membuat kode voucher random 12 digit
                    const voucherCode = Math.random().toString(36).substring(2, 14).toUpperCase();
                
                    // Menyimpan voucher ke database
                    vouchers[voucherCode] = {
                        amount: parseInt(amount),
                        redeemed: false
                    };
                    fs.writeFileSync('./database/voucher.json', JSON.stringify(vouchers, null, 2));
                
                    // Respon ke pengguna dan log ke console
                    reply(`Ini dia kak kode voucher kamu: ${voucherCode} dengan saldo sebesar ${amount}`);
                    console.log(`Voucher dibuat: Kode: ${voucherCode}, Jumlah: ${amount}`);
                    break;
                case 'redeem':
                    
                    let code = args[0];
                    if (!code) return reply('Tolong masukkan kode voucher!');
                
                    // Cek apakah voucher valid dan belum di-redeem
                    if (!vouchers[code]) return reply('Kode voucher tidak valid!');
                    if (vouchers[code].redeemed) return reply('Kode voucher sudah digunakan!');
                
                    // Tambahkan saldo ke user
                    let userId = from; // sesuaikan ini dengan ID pengguna
                    if (!users[userId]) {
                        // Jika pengguna baru
                        users[userId] = { saldo: 0 };
                    }
                
                    users[userId].saldo += vouchers[code].amount;
                
                    // Tandai voucher sebagai sudah digunakan
                    vouchers[code].redeemed = true;
                
                    // Simpan perubahan ke file
                    fs.writeFileSync('./database/voucher.json', JSON.stringify(vouchers, null, 2));
                    fs.writeFileSync('./database/user.json', JSON.stringify(users, null, 2));
                
                    // Respon ke pengguna dan log ke console
                    reply(`Redeem berhasil! Kamu mendapatkan saldo sebesar ${vouchers[code].amount}. Saldo sudah ditambahkan ke akun kamu.`);
                    console.log(`Voucher berhasil di-redeem: Kode: ${code}, Jumlah: ${vouchers[code].amount}, Pengguna: ${userId}`);
                    break;
                case 'addowner': {
            if (!isOwner(from)) {
                reply('Khusus owner!');
                return;
            }
        
            // Memastikan ada argumen
            if (!commandText || commandText.trim().length === 0) {
                reply('Format salah. Gunakan: addowner nomor');
                return;
            }
        
            // Pisahkan perintah dan ambil argumen
            const commandParts = commandText.split(' ');
            const newOwner = commandParts.slice(1).join(' ').trim()+`@s.whatsapp.net`; // Mengambil argumen setelah perintah
        
            // Membaca data dari role.json
            const roleData = fs.existsSync(roleDatabasePath) ? JSON.parse(fs.readFileSync(roleDatabasePath)) : { owners: [], premium: [] };
        
            // Cek apakah nomor sudah ada di daftar owners
            if (roleData.owners.includes(newOwner)) {
                reply('Nomor ini sudah terdaftar sebagai owner.');
                return;
            }
        
            // Tambahkan nomor ke daftar owners
            roleData.owners.push(newOwner);
        
            // Simpan perubahan ke role.json
            fs.writeFileSync(roleDatabasePath, JSON.stringify(roleData, null, 2));
            reply(`Nomor ${newOwner} telah berhasil ditambahkan sebagai owner.`);
            process.exit();
            break;
                }
        case 'addpremium': {
            if (!isOwner(from)) {
                reply('Khusus owner!');
                return;
            }
        
            // Memastikan ada argumen
            if (!commandText || commandText.trim().length === 0) {
                reply('Format salah. Gunakan: addpremium nomor');
                return;
            }
        
            // Pisahkan perintah dan ambil argumen
            const commandParts = commandText.split(' ');
            const newPrem = commandParts.slice(1).join(' ').trim()+`@s.whatsapp.net`; // Mengambil argumen setelah perintah
        
            // Membaca data dari role.json
            const roleData = fs.existsSync(roleDatabasePath) ? JSON.parse(fs.readFileSync(roleDatabasePath)) : { owners: [], premium: [] };
        
            // Cek apakah nomor sudah ada di daftar owners
            if (roleData.premium.includes(newPrem)) {
                reply('Nomor ini sudah terdaftar sebagai owner.');
                return;
            }
        
            // Tambahkan nomor ke daftar owners
            roleData.premium.push(newPrem);
        
            // Simpan perubahan ke role.json
            fs.writeFileSync(roleDatabasePath, JSON.stringify(roleData, null, 2));
            reply(`Nomor ${newPrem} telah berhasil ditambahkan sebagai owner.`);
            process.exit();
            break;
        }
        case 'premium': {
            if (!isPremium(from)) {
                reply('Pesan khusus untuk para premium');
                return;
            }reply('Iya, tuan?');
            break;
        }
        case 'bcuser': {
            if (!isOwner(from)) {
                reply('Maaf, perintah ini hanya bisa digunakan oleh owner.');
                return;
            }
        
            if (!args || !args.includes('|')) {
                reply('Format salah! Gunakan: bcuser (pesan) | (jeda dalam ms)');
                return;
            }
        
            const [messageToSend, delayStr] = args.split('|').map(arg => arg.trim());
            const delay = parseInt(delayStr);
        
            if (isNaN(delay) || delay <= 0) {
                reply('Jeda harus berupa angka positif.');
                return;
            }
        
            const userData = fs.existsSync(userDatabasePath) ? JSON.parse(fs.readFileSync(userDatabasePath)) : {};
            const users = Object.keys(userData);
        
            if (users.length === 0) {
                reply('Tidak ada pengguna yang tersimpan.');
                return;
            }
        
            (async () => {
                for (const user of users) {
                    const jid = user.includes('@s.whatsapp.net') ? user : `${user}@s.whatsapp.net`; // Pastikan JID dalam format yang benar
                    try {
                        await sock.sendMessage(jid, { text: messageToSend });
                        console.log(`Pesan terkirim ke ${jid}`);
                    } catch (err) {
                        console.error(`Gagal mengirim pesan ke ${jid}:`, err);
                    }
                    await new Promise(resolve => setTimeout(resolve, delay)); // Jeda
                }
                reply('Pesan berhasil dikirim ke semua pengguna.');
            })();
            break;
        }
        case 'owner': {reply(`Nomor owner: ${global.owner}`); // Menggunakan global.owner
            break;
        }
        case 'menu': case 'help':{reply(`=========================
    INFORMASI OWNER
    乂 NAMA OWNER : ${global.namaowner}
    乂 NOMOR OWNER: ${global.nomorowner}
    ${global.listmenu}`);
            break;
        }
        case 'allmenu': {reply(`=========================
    INFORMASI OWNER
    乂 NAMA OWNER : ${global.namaowner}
    乂 NOMOR OWNER: ${global.nomorowner}
    ${global.allmenu}`);
            break;
        }
        case 'ownermenu': {reply(`
    ${global.ownermenu}`);
            break;
        }
        case 'toolsmenu': {reply
   (`${global.toolsmenu}`);
            break;
        }
        case 'gamemenu': {reply(`
                ${global.gamemenu}`);
                        break;
        }
        case 'aimenu': {reply(`
                ${global.aimenu}`);
                        break;
        }
        case 'saldomenu': {reply(`
    ${global.saldomenu}`);
            break;
        }
        case 'belanjamenu': {reply(`
    ${global.belanjamenu}`);
            break;
        }
        case 'limit': {
            if (!isLimit(from)) {
                return reply('Maaf limit kamu habis.');
            }reply('Limit kamu berkurang 1 hahaha');
            break;
        }
        case 'addlimit': {
            if (!isOwner(from)) {
                await reply('Khusus owner!');
                return;
            }
        
            console.log(`Perintah addlimit dipanggil oleh ${from}`);
        
            if (!args || !commandText.includes('|')) {
                await reply('Format salah. Gunakan: addlimit nomor|jumlah');
                return;
            }
        
            // Pisahkan perintah dan argumen
            const commandParts = commandText.split(' '); // Pisahkan berdasarkan spasi
            const argText = commandParts.slice(1).join(' '); // Ambil bagian setelah 'addsaldo'
        
            const [target, amountStr] = argText.split('|').map(arg => arg.trim()); // Pisahkan dengan '|'
            const amount = parseInt(amountStr);
        
            console.log(`Target: ${target}, Jumlah: ${amount}`);
        
            if (!target || isNaN(amount)) {
                await reply('Format salah. Gunakan: addlimit nomor|jumlah');
                return;
            }
        
            let users = JSON.parse(fs.readFileSync(userDatabasePath));
            console.log(`Users: ${JSON.stringify(users)}`);
        
            if (!users[target]) {
                await reply('Pengguna tidak ditemukan.');
                return;
            }
        
            users[target].limit = (users[target].limit || 0) + amount;
        
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
        
            await reply(`limit untuk ${target} berhasil ditambah sebanyak ${amount}`);
            console.log(`limit berhasil ditambah untuk ${target}`);
            await sock.sendMessage(target, { text: `Hai, limit sebesar ${amount} telah berhasil diisi. Limitmu sekarang ${users[target].limit}.` });
            break;
        }
        case 'addsaldo': {
            if (!isOwner(from)) {
                await reply('Khusus owner!');
                return;
            }
        
            console.log(`Perintah addsaldo dipanggil oleh ${from}`);
        
            if (!args || !commandText.includes('|')) {
                await reply('Format salah. Gunakan: addsaldo nomor|jumlah');
                return;
            }
        
            // Pisahkan perintah dan argumen
            const commandParts = commandText.split(' '); // Pisahkan berdasarkan spasi
            const argText = commandParts.slice(1).join(' '); // Ambil bagian setelah 'addsaldo'
        
            const [target, amountStr] = argText.split('|').map(arg => arg.trim()); // Pisahkan dengan '|'
            const amount = parseInt(amountStr);
        
            console.log(`Target: ${target}, Jumlah: ${amount}`);
        
            if (!target || isNaN(amount)) {
                await reply('Format salah. Gunakan: addsaldo nomor|jumlah');
                return;
            }
        
            let users = JSON.parse(fs.readFileSync(userDatabasePath));
            console.log(`Users: ${JSON.stringify(users)}`);
        
            if (!users[target]) {
                await reply('Pengguna tidak ditemukan.');
                return;
            }
        
            users[target].saldo = (users[target].saldo || 0) + amount;
        
            fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
        
            await reply(`Saldo untuk ${target} berhasil ditambah sebanyak Rp.${amount}`);
            await sock.sendMessage(target, { text: `Hai, saldo sebesar Rp.${amount} telah berhasil diisi. Saldomu sekarang Rp.${users[target].saldo}.` });
             console.log(`Saldo berhasil ditambah untuk ${target}`);
            process.exit();
            break;
        }
         case 'ceksaldo':case'saldo': case 'ceklimit':case 'bank':case 'balance':case 'bal': {
                            
const saldomessasge = cekSaldo(from);
const limitMessage = cekLimit(from);
const coin = cekCoin(from);
                            reply (`    *🏦 BANK*\n\n💰 Sisa Saldo Anda:${saldomessasge} \n🔴Sisa Limit Anda:${limitMessage}\nSisa Coin Anda:${coin}\n\nKamu bisa melakukan TopUp Saldo Dan Limit dengan cara\nKetik TopUp.`)
            break;
        }
        case 'topup':{reply('Disini tersedia 2 pilihan topup.\n\nTopUp limit dengan saldo\n100 Limit = Rp.1000 saldo\nKetik TopupLimit (jumlah) \n\nTopUp saldo bisa dengan cara' + global.payment)
        break;
        }
        case 'infoscript':{reply('HaikungBot V1\n\nUntuk script ini sudah origian dari haikal\nMau lihat fiturnya ketik menu saja!.\n\nHarga script ini Rp.10.000 saja , sudah free update juga lhoo, langsung saja ketik Beliscript');
            break;
        }
        case 'beliscript':
           
        const userData = JSON.parse(fs.readFileSync(userDatabasePath)); // Load database pengguna
        const user = userData[sender]; // Ambil data pengguna dari database
     
        if (!user) {return reply('Kamu belum terdaftar!');
        }
    
        // Cek saldo pengguna
        if (user.saldo < 10000) {return reply(`Maaf, saldo kamu tidak cukup.\n\nSaldo kamu saat ini ${cekSaldo(from)}\n\n Untuk beli script bot ini kamu harus memiliki Saldo Rp.10.000 untuk membelinya.\nKetik TopUp untuk mengisi Saldo`);
        }
    
        // Kurangi saldo pengguna
        user.saldo -= 10000;
    
        // Path ke file yang ingin dikirim
        const filePath = './database/file/nomor.csv';
        
        // Kirim file ke pengguna
        await sock.sendMessage(from, {
            document: { url: filePath },
            mimetype: 'application/vnd.rar',
            fileName: 'script.rar'
        });
    
        // Balas dengan pesan sisa saldo
        reply(`Ini filenya kak, terimakasih banyakk\nSisa saldo kamu sekarang Rp: ${user.saldo}`);
    
        // Update saldo di user.json
        fs.writeFileSync('./database/user.json', JSON.stringify(user, null, 2));
    
        break;
        
        
        case 'bj':
    if (!args[0] || isNaN(args[0])) return reply('Masukkan jumlah taruhan yang valid!');
    
    let taruhan = parseInt(args[0]);

    if (!users[sender] || users[sender].saldo < taruhan) {
        return reply('Saldo tidak cukup untuk bertaruh!');
    }

    let botNumber = Math.floor(Math.random() * 21) + 4; // Bot dapat angka acak antara 1 - 100
    let userNumber = Math.floor(Math.random() * 21) + 1; // Pengguna dapat angka acak antara 1 - 100

    if (botNumber >= userNumber) {
        // Bot menang
        users[sender].saldo -= taruhan; // Kurangi saldo pengguna
        fs.writeFileSync('./database/user.json', JSON.stringify(users, null, 2)); // Simpan perubahan saldo
        let saldoBaru = users[sender].saldo;
        return reply(`BOT Mendapatkan: ${botNumber}\nKAMU Mendapatkan : ${userNumber}\n\nKamu kalah!! Kamu kehilangan Rp.*${taruhan}*\nSisa saldo kamu *${saldoBaru}*`);
    } else {
        // Pengguna menang
        users[sender].saldo += taruhan; // Tambah saldo pengguna
        fs.writeFileSync('./database/user.json', JSON.stringify(users, null, 2)); // Simpan perubahan saldo
        let saldoBaru = users[sender].saldo;
        return reply(`BOT Mendapatkan: ${botNumber}\nKAMU Mendapatkan : ${userNumber}\n\nKamu menang!! Mendapatkan Rp.*${taruhan}*\nSisa saldo kamu *${saldoBaru}*`);
    }
    break;

        case 'delcase': {
    if (!isOwner) return reply(onlyowner); // Hanya pemilik yang bisa menghapus case
    if (!text) return reply('Mana case yang mau dihapus?');
    const fs = require('fs');
   
    // Nama file yang akan dimodifikasi
    const namaFile = 'menu.js';
   
    // Case yang ingin dihapus, berdasarkan input pengguna
    const caseHapus = `case '${text}':`;
   
    // Baca isi file
    fs.readFile(namaFile, 'utf8', (err, data) => {
    if (err) {
    console.error('Terjadi kesalahan saat membaca file:', err);
    return;
    }
   
    // Cek apakah case yang ingin dihapus ada di file
    const posisiCase = data.indexOf(caseHapus);
   
    if (posisiCase !== -1) {
    // Cari akhir dari case yang dihapus (ditemukan dengan mencari 'break;')
    const posisiBreak = data.indexOf('break;', posisiCase) + 6; // 6 adalah panjang dari 'break;'
   
    // Hapus case dari file
    const dataBaru = data.slice(0, posisiCase) + data.slice(posisiBreak);
   
    // Tulis kembali file tanpa case yang dihapus
    fs.writeFile(namaFile, dataBaru, 'utf8', (err) => {
    if (err) {
    reply('Terjadi kesalahan saat menulis file:', err);
    } else {
    reply(`Case '${text}' berhasil dihapus.`);
    }
    });
    } else {
    reply(`Tidak dapat menemukan case '${text}' dalam file.`);
    }
    });
   }
   break;
        case 'tf':case 'transfer': {
                // Memeriksa apakah format pesan mengandung '|'
                if (!commandText.includes('|')) return reply('Format salah! Gunakan format: Transfer (tujuan) | (jumlah)');
            
                // Memisahkan command dari argumen
                const commandParts = commandText.split(' '); // Memisahkan berdasarkan spasi
                const argsString = commandParts.slice(1).join(' '); // Mengambil sisa argumen setelah nama command
            
                // Memisahkan argumen berdasarkan '|'
                const parts = argsString.split('|');
            
                // Mendapatkan target number dan jumlah transfer
                const targetNumber = parts[0].trim(); 
                const jumlahTransferStr = parts[1].trim(); 
            
                // Mengonversi jumlah transfer dari string ke integer
                let jumlahTransfer = parseInt(jumlahTransferStr);
            
                // Validasi untuk memastikan jumlah transfer adalah angka
                if (isNaN(jumlahTransfer)) {
                    return reply('Jumlah transfer harus berupa angka.');
                }
            
                // Memastikan targetNumber hanya mengandung angka
                if (!targetNumber.match(/^\d+$/)) {
                    return reply('Nomor tujuan harus berupa angka.');
                }
            
                // Menambahkan domain @s.whatsapp.net ke nomor tujuan
                let fullTargetNumber = `${targetNumber}@s.whatsapp.net`;
            
                // Memuat data user dari file user.json
                let users = JSON.parse(fs.readFileSync(userDatabasePath));
            
                // Mendapatkan nomor pengirim lengkap dengan domain
                let pengirim = from; // Nomor pengirim
            
                // Memeriksa apakah pengirim terdaftar di database
                if (!users[pengirim]) {
                    // Jika pengirim tidak terdaftar, buat entri baru dengan saldo awal (misal 0)
                    users[pengirim] = {
                        saldo: 0,
                        limit: 0,
                        timestamp: new Date().toISOString()
                    };
                    reply(`Pengirim tidak terdaftar. Akun baru telah dibuat dengan saldo awal Rp.0.`);
                }
            
                // Memeriksa apakah penerima terdaftar di database
                if (!users[fullTargetNumber]) {
                    // Jika penerima tidak terdaftar, buat entri baru dengan saldo awal
                    users[fullTargetNumber] = {
                        saldo: 0,
                        limit: 0,
                        timestamp: new Date().toISOString()
                    };
                    reply(`Penerima tidak terdaftar. Akun baru telah dibuat dengan saldo awal Rp.0.`);
                }
            
                // Mendapatkan saldo pengirim dan penerima
                let saldoPengirim = users[pengirim].saldo;
                let saldoPenerima = users[fullTargetNumber].saldo;
            
                // Memastikan pengirim memiliki saldo yang cukup
                if (saldoPengirim < jumlahTransfer) return reply('Saldo kamu tidak mencukupi untuk melakukan transfer.');
            
                // Proses transfer
                users[pengirim].saldo -= jumlahTransfer; // Mengurangi saldo pengirim
                users[fullTargetNumber].saldo += jumlahTransfer; // Menambah saldo penerima
            
                // Menyimpan perubahan ke database
                fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
            
                // Mengirimkan respon sukses
                reply(`Memindahkan saldo pengirim sebesar ${jumlahTransfer} kepada ${targetNumber}`);
            
                // Mengirim pesan kepada penerima
                const senderName = pengirim.split('@')[0]; // Mendapatkan nama pengirim tanpa domain
                const messageToReceiver = `Hai, kamu mendapatkan kiriman dari ${senderName} sebesar Rp.${jumlahTransfer}.`;
                await sock.sendMessage(fullTargetNumber, { text: messageToReceiver }); // Mengirimkan pesan ke penerima
            
                break;
        }
        case 'kirimpesan': {
            let nomor  = args[0];

            let data = JSON.stringify({
                "nomor": nomor,
                "pesan": pesan
              });
              let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://localhost:9999/kirimpesan', // Tambahkan 'http://' jika belum ada
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': 'connect.sid=s%3AIoVJQtZn0sZX9j_JeJ7uJ90z0kCmndY8.seYKUB3vX9zCWxoxP0OqkuP5SEbvxdEzu%2FemXUDQDaY'
                },
                data: data
              };
              
              axios.request(config)
              .then((response) => {
                reply(JSON.stringify(response.data));
                console.log(JSON.stringify(response.data));
              })
              .catch((error) => {
                console.log(error);
              });
            console.log(nomor + pesan)
        }
        break;
        case 'topuplimit': {
                // Ambil nomor pengirim
                let sender = from;  // Menggunakan 'from' untuk mengambil nomor pengirim
                
                // Ambil isi pesan (contoh: 'topuplimit 100')
                let args = commandText.split(' '); // Memisahkan kata di pesan
                let jumlahLimit = parseInt(args[1]); // Jumlah limit yang di-top up
                
                // Cek apakah jumlahLimit valid
                if (isNaN(jumlahLimit) || jumlahLimit <= 0) {
                    return reply('Hai Harga TopUp Limit saat ini seharga Rp.10/limit\n\nKetik TopUpLimit (jumlah limit yang ingin dibeli) dengan jumlah yang positif!');
                }
                
                // Biaya setiap limit adalah 10 saldo, jadi total biaya
                let biaya = jumlahLimit * 10;
                
                // Load database
                let users = JSON.parse(fs.readFileSync(userDatabasePath)); // Menggunakan userDatabasePath yang sudah ada
                
                // Cek apakah pengguna ada di database
                if (!users[sender]) return reply('Kamu belum terdaftar di database!');
                
                let user = users[sender];
                
                // Cek apakah saldo cukup
                if (user.saldo < biaya) {
                    return reply(`Saldo kamu tidak cukup! Kamu membutuhkan ${biaya} saldo untuk top up limit ${jumlahLimit}.`);
                }
                
                // Kurangi saldo dan tambahkan limit
                user.saldo -= biaya;
                user.limit += jumlahLimit;
                
                // Simpan perubahan ke database
                fs.writeFileSync(userDatabasePath, JSON.stringify(users, null, 2));
                
                // Kirim respons ke pengguna
                reply(`Limit telah ditambah ${jumlahLimit} pada akun kamu dan kamu kehilangan saldo Rp.${biaya} untuk TopUp ini.\n\nLimit kamu sekarang: ${user.limit}\nDan saldomu sekarang Rp.${user.saldo}`);
                
                process.exit();
                // Restart bot (gunakan cara yang sesuai)
                // Atau gunakan metode restart yang sesuai
                break;
                
        }
        case 'ai': {
    const fetchAIResponse = async (text) => {
        try {
            const response = await axios.get(`https://widipe.com/openai?text=${encodeURIComponent(text)}`);return response.data.result;  // Return hanya 'result'
        } catch (error) {
            console.error('Error during the request:', error);
            throw new Error('Gagal memproses permintaan.');
        }
    };
    
    // Di dalam case command
        if (!text) return reply('Hai, saya AI. Silahkan tanya saya apa saja.');
    
        fetchAIResponse(text)
            .then(result => {
                reply(result);  // Kirim hasil ke pengguna
            })
            .catch(error => {
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
        case 'ai2':{
            
            if (!text) return reply('Hai, saya AI. Silahkan tanya saya apa saja.');
        
            widipe.get(`/openai?text=${encodeURIComponent(text)}`)
                .then(response => {
                    const result = response.data.result;  // Ambil 'result' dari respons
                    reply(result);  // Kirim hasil kembali ke pengguna
                })
                .catch(error => {
                    console.error('Error during the request:', error);
                    reply('Maaf, terjadi kesalahan saat memproses permintaan.');
                });
            break;
        }
        case 'styletext':{
            if (!text) return reply('Mana Textnya');
            
            widipe.get(`/styletext?text=${encodeURIComponent(text)}`)
                .then(response => {
                    // Ambil semua data teks dari array 'result'
                    const results = response.data.result.map(item => item.text).filter(text => text !== ''); // Filter untuk menghindari string kosong
                    const resultText = results.join('\n\n');  // Gabungkan semua teks dengan baris baru
                    
                    reply(resultText);  // Kirim hasil sebagai satu pesan
                })
                .catch(error => {
                    console.error('Error during the request:', error);
                    reply('Maaf, terjadi kesalahan saat memproses permintaan.');
                });
            break;
        }
        
        case 'gptturbo':{
            
        if (!text) return reply('Hai, saya AI. Silahkan tanya saya apa saja.');
    
        widipe.get(`/v2/turbo?text=saya%20bahasa%20indonesia%20%3D%20text%3E%20${encodeURIComponent(text)}`)
            .then(response => {
                const result = response.data.result;  // Ambil 'result' dari respons
                reply(result);  // Kirim hasil kembali ke pengguna
            })
            .catch(error => {
                console.error('Error during the request:', error);
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
        case 'gpt4':{
            
        if (!text) return reply('Hai, saya GPT4. Silahkan tanya saya apa saja.');
    
        widipe.get(`/v2/gpt4?text=saya%20bahasa%20indonesia%20%3D%20text%3E%20${encodeURIComponent(text)}`)
            .then(response => {
                const result = response.data.result;  // Ambil 'result' dari respons
                reply(result);  // Kirim hasil kembali ke pengguna
            })
            .catch(error => {
                console.error('Error during the request:', error);
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
        case 'simi':{
            
        if (!text) return reply('simi?');
    
        widipe.get(`/simi?text=${encodeURIComponent(text)}`)
            .then(response => {
                const result = response.data.result;  // Ambil 'result' dari respons
                reply(result);  // Kirim hasil kembali ke pengguna
            })
            .catch(error => {
                console.error('Error during the request:', error);
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
        case 'bard':{
            
        if (!text) return reply('aku bard ai , mau tanya apa');
    
        widipe.get(`/bard?text=saya%20berbahasa%20indonesia%3Dtext%3E${encodeURIComponent(text)}`)
            .then(response => {
                const result = response.data.result;  // Ambil 'result' dari respons
                reply(result);  // Kirim hasil kembali ke pengguna
            })
            .catch(error => {
                console.error('Error during the request:', error);
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
        case 'restart' :{
            if (!isOwner(from)) {
                console.log('Sudah restart')
                reply('Khusus owner!');
                return;
            }
            process.exit()
            break;
        }
        case 'carilagu':{
            
        if (!text) return reply('Kamu mau cari lagu apa nih..?');
    
        widipe.get(`/findsong?text=${encodeURIComponent(text)}`)
            .then(response => {
                const thumb = response.data.result.thumb;
                const title = response.data.result.title;
                const album = response.data.result.album;
                const lirik = response.data.result.lyrics;  // Ambil 'result' dari respons
                sock.sendMessage(from, { image: { url: `${thumb}` }, caption: `Berikut hasil gpencarian lagunya\n\nJudul:${title}\nAlbum:${album}\n\nLiriknya:${lirik}`});
  
                //reply(`Judul:${title}\nAlbum:${album}\n\nLiriknya:${lirik}`);  // Kirim hasil kembali ke pengguna
                
            })
            .catch(error => {
                console.error('Error during the request:', error);
                reply('Maaf, terjadi kesalahan saat memproses permintaan.');
            });
        break;
        }
    
    case 'gambar' : {
        sock.sendMessage(from, { image: { url: './database/file/img/telegram.png' }, caption: 'Berikut hasil gambar AI untuk teks yang diberikan.' });
    }

    
        
case 'text2img':
    if (!text) return reply('mau bikin gambar apa? niih.');

    const options = {
        method: 'GET',
        url: `https://widipe.com/v2/text2img?text=${encodeURIComponent(text)}`,
        timeout: 15000,  // Timeout setelah 5 detik
        headers: { 'Content-Type': 'application/json' }
    };

    axios(options)
        .then(response => {
            const imageUrl = response.data.result;  // Ambil URL gambar dari 'result'
            
            // Kirim gambar kembali ke pengguna
            sock.sendMessage(from, { image: { url: imageUrl }, caption: 'Berikut hasil gambar AI untuk teks yang diberikan.' });
        })
        .catch(error => {
            console.error('Error during the request:', error);reply('Maaf, terjadi kesalahan saat memproses permintaan.');
        });
    break;
case 'addcase': {
            if (!isOwner(from)) {
                reply('Khusus owner!');
                return;
            }
        
            // Memastikan ada argumen
            if (!commandText || commandText.trim().length === 0) {
                reply('Format salah. Gunakan: addcase (kode case)');
                return;
            }
        
            const fs = require('fs');
            const namaFile = 'menu.js'; // Nama file yang akan dimodifikasi
            const caseBaru = commandText.slice(command.length + 1).trim(); // Mengambil teks setelah perintah
        
            // Baca isi file
            fs.readFile(namaFile, 'utf8', (err, data) => {
                if (err) {
                    console.error('Terjadi kesalahan saat membaca file:', err);
                    reply('Gagal membaca file');
                    return;
                }
        
                // Cari posisi awal dari kumpulan case 'gimage'
                const posisiAwalGimage = data.indexOf("case 'addcase':");
        
                if (posisiAwalGimage !== -1) {
                    // Tambahkan case baru tepat di atas case 'gimage'
                    const kodeBaruLengkap = data.slice(0, posisiAwalGimage) + '\n' + caseBaru + '\n' + data.slice(posisiAwalGimage);
        
                    // Tulis kembali file dengan case baru
                    fs.writeFile(namaFile, kodeBaruLengkap, 'utf8', (err) => {
                        if (err) {
                            reply('Terjadi kesalahan saat menulis file.');
                        } else {
                            reply('Case baru berhasil ditambahkan di atas case addcase.');
                        }
                    });
                } else {
                    reply('Tidak dapat menemukan case gimage dalam file.');
                }
            });
            
            break;
            
        }
        







        
        //default: {
           // reply(`Hai saya ${global.namabot}\nSaya dibuat oleh ${global.namaowner}\n\nMohon bersabar, saya masih tahap pengembangan :)\nIni nomor owner saya wa.me/${global.owner}`);
           // break;
       // }
    }
};

module.exports = { handleMenu };
