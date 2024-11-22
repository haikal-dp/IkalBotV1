require('./setting');//require('./database/lib/bankcek');
require('./config');
const math = require('mathjs');
const { socket } = require('dgram');
const { modul } = require('./database/lib/module')
const { axios, path, fs, baileys, process } = modul
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, generateForwardMessageContent } = baileys
const {roleDatabasePath,userDatabasePath} = require('./database/lib/savedata')
const { isOwner, isPremium } = require('./database/lib/role');
const {updateVoucherStatus,addVoucher,readVouchers} = require('./database/lib/Fungsi');

module.exports = handleMenu = async (sock, from, commandText) => {
    const fkontak = { key: { participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': `'ownername'`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${`'ownername'`},;;;\nFN:${`'ownername'`}\nitem1.TEL;waid=6285892928715:6285892928715\nitem1.X-ABLabel:Mobile\nEND:VCARD`, 'jpegThumbnail': global.thumb, thumbnail: global.thumb, sendEphemeral: true } } }
    
function updateSettingFile() {
    const fs = require('fs');
    const settingPath = './config.js';

    const content = `
global.session = ${global.session};
global.autoread = ${global.autoread};
global.pakaidb = ${global.pakaidb};
global.newUser = ${global.newUser};
`;

    try {
        fs.writeFileSync(settingPath, content, 'utf-8');
        // Reload file setting.js agar perubahan diterapkan
        delete require.cache[require.resolve(settingPath)];
        require(settingPath);
    } catch (err) {
        console.error('Error saat mengubah config.js:', err);
        reply('Terjadi kesalahan saat memperbarui pengaturan.');
    }
}
    const ownerontak = 'BEGIN:VCARD\n' // metadata of the contact card
        + 'VERSION:3.0\n'
        + `FN:${global.namaowner}\n`// full name
        + 'Haikung.my.id;\n' // the organization of the contact
        + 'TEL;type=CELL;type=VOICE;waid=6285173229118:+6285173229118\n' // WhatsApp ID + phone number
        + 'END:VCARD'
    const replyy = (teks) => {
        sock.sendMessage(from,
            {
                text: teks,
                contextInfo: {
                    mentionedJid: [from],
                    forwardingScore: 0,
                    isForwarded: false,
                    "externalAdReply": {
                        "showAdAttribution": true,
                        "containsAutoReply": true,
                        "title": `${global.namabot}`,
                        "body": `instagram Saya`,
                        "previewType": "IMAGE",
                        "thumbnailUrl": 'https://i.ibb.co/5vGsdR2/thumb.jpg',
                        "sourceUrl": 'https://instagram.com/haikung.my.id'
                    }
                }
            },
            { quoted: fkontak })
    }
    const reply = (message) => sock.sendMessage(from, { text: message }); // Fungsi untuk membalas pesan
    const command = commandText.split(' ')[0].toLowerCase();
    const args = commandText.slice(command.length + 1).trim().split(/\s+/); // Ubah menjadi array
    const text = args.join(' '); // Ini akan bekerja dengan args sebagai array
    const pesan = args.slice(1).join(' ');
    const widipe = axios.create({
        baseURL: 'https://widipe.com',
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });

    switch (command) {
      case 'cekwa': {
    if (!args[0]) {
        reply('Masukkan range nomor! Contoh: cekwa 6285173229110-6285173229120');
        return;
    }

    const range = args[0].split('-');
    if (range.length !== 2 || isNaN(range[0]) || isNaN(range[1])) {
        reply('Format range tidak valid! Gunakan format: cekwa 6285173229110-6285173229120');
        return;
    }

    const start = BigInt(range[0]);
    const end = BigInt(range[1]);
    if (start >= end) {
        reply('Range tidak valid! Nomor awal harus lebih kecil dari nomor akhir.');
        return;
    }

    reply('Sedang memeriksa nomor, harap tunggu...');

    let results = '';
    for (let i = start; i <= end; i++) {
        const number = i.toString();
        const jid = `${number}@s.whatsapp.net`;

        try {
            const check = await sock.onWhatsApp(jid);
            if (check.length > 0) {
                results += `*##${number} = sudah ada*\n`;
            } else {
                results += `${number} = belum ada\n`;
            }
        } catch (err) {
            results += `${number} = error memeriksa\n`;
        }
    }

    reply(results.trim());
    break;
}
      
      case 'kalkulator': {
            if (!text) {
                await sock.sendMessage(from, { text: 'Silakan masukkan ekspresi matematika setelah `kalkulator`.\n\nContoh:\n1. kalkulator 1+1+8+9+7x7x5-2x6=\n2. kalkulator 2x99+67-182+888=' });
                break;
            }

            const cleanedExpression = text.replace(/x/gi, '*').replace(/=/g, ''); // Ganti 'x' dengan '*' dan hapus '='
            try {
                const result = math.evaluate(cleanedExpression); // Evaluasi ekspresi menggunakan math.js
                await sock.sendMessage(from, {
                    text: `Hasil dari ekspresi:\n*${args}*\n\nAdalah: *${result}*`,
                });
            } catch (error) {
                await sock.sendMessage(from, { text: 'Maaf, ekspresi matematika tidak valid. Pastikan formatnya benar.\n\nContoh:\n1. kalkulator 1+1+8+9+7x7x5-2x6=\n2. kalkulator 2x99+67-182+888=' });
            }
            break;
        }

      case 'set':
    if (!text) {
        // Jika tidak ada argumen, beri tahu pengguna tentang opsi yang tersedia
        reply('Perintah `set` memiliki beberapa opsi: \n' +
            '1. set session 1/2\n' +
            '2. set autoread on/off\n' +
            '3. set pakaidb on/off\n' +
            '4.set newuser on/off');
        break;
    }

    const settingOption = args[0].toLowerCase();

    // Cek pilihan pengaturan yang diminta
    switch (settingOption) {
        case 'session':
            if (!args[1]) {
                reply('Silakan tentukan nilai: set session 1 untuk false, set session 2 untuk true');
                break;
            }
            const sessionValue = args[1].toLowerCase();
            if (sessionValue === '1') {
                global.session = false;
            } else if (sessionValue === '2') {
                global.session = true;
            } else {
                reply('Pilihan tidak valid untuk session. Gunakan 1 atau 2');
                break;
            }
            updateSettingFile(); // Update setting.js
            reply(`Pengaturan 'session' berhasil diubah menjadi ${global.session}`);
            break;

        case 'autoread':
            if (!args[1]) {
                reply('Silakan tentukan nilai: set autoread on atau set autoread off');
                break;
            }
            const autoreadValue = args[1].toLowerCase();
            if (autoreadValue === 'on') {
                global.autoread = true;
            } else if (autoreadValue === 'off') {
                global.autoread = false;
            } else {
                reply('Pilihan tidak valid untuk autoread. Gunakan on atau off');
                break;
            }
            updateSettingFile(); // Update setting.js
            reply(`Pengaturan 'autoread' berhasil diubah menjadi ${global.autoread ? 'ON' : 'OFF'}`);
            break;

        case 'pakaidb':
            if (!args[1]) {
                reply('Silakan tentukan nilai: set pakaidb on atau set pakaidb off');
                break;
            }
            const pakaidbValue = args[1].toLowerCase();
            if (pakaidbValue === 'on') {
                global.pakaidb = true;
            } else if (pakaidbValue === 'off') {
                global.pakaidb = false;
            } else {
                reply('Pilihan tidak valid untuk pakaidb. Gunakan on atau off');
                break;
            }
            case 'newuser':
            if (!args[1]) {
                reply('Silakan tentukan nilai: set newuser on atau set newuser off');
                break;
            }
            const newuserValue = args[1].toLowerCase();
            if (newuserValue === 'on') {
                global.newUser = true;
            } else if (newuserValue === 'off') {
                global.newUser = false;
            } else {
                reply('Pilihan tidak valid untuk newuser. Gunakan on atau off');
                break;
            }
            updateSettingFile(); // Update setting.js
            reply(`Pengaturan 'newuser' berhasil diubah menjadi ${global.newUser ? 'ON' : 'OFF'}`);
            break;

        default:
            reply('Pilihan tidak valid. Gunakan perintah: set session, set autoread, atau set pakaidb');
            break;
    }
    break;
      
      
      
      
        case 'owner': {
            const sentMsg = await sock.sendMessage(
                from,
                {
                    contacts: {
                        displayName: 'Haikal Dwi putra',
                        contacts: [{ ownerontak }]
                    }
                }
            )
            sentMsg
            break;
        };
        case 'addvoucher-5000': {
            const result = addVoucher('24 jam', '5000', text);
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            reply(result);
            break;
        }
        case 'addvoucher-3000': {
            const result = addVoucher('10 jam', '3000', text);
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            reply(result);
            break;
        }
        case 'voucher': {
            const vouchers = readVouchers();
            if (vouchers.vouchers.length === 0) {
                reply('Tidak ada voucher yang tersedia.');
                break;
            }

            let voucherList = 'Hai Ini adalah list dari harga voucher\n\n';
            voucherList += '[*] PAKET HEMAT [*]\n';
            voucherList += `+ Voucher 10 Jam - Rp.${vouchers.vouchers[0].harga}\n\n\n`;
            // voucherList += `Voucher 24 Jam - Rp.${vouchers.vouchers[1].harga}\n\n`;
            //voucherList += 'PAKET KARYAWAN\n';
            //voucherList += `Voucher 1 Minggu - Rp.${vouchers.vouchers[2].harga}\n`;
            //voucherList += `Voucher 1 Bulan - Rp.${vouchers.vouchers[3].harga}\n\n`;
            voucherList += 'Untuk Pembelian Offline Bisa Datang ke\nErvita Salon, Lantai 1 Blok D 9-10\n\n';
            voucherList += 'Untuk Pembelian Online Bisa balas Pesan ini dengan\n\n*belivoucher*\n\n';
            voucherList += 'kontak ervita salon \nhttps://wa.me/6281294701977'
            reply(voucherList);
            break;
        }
        case 'belivoucher': {
            sock.sendMessage(from, { image: { url: './database/img/qris.jpeg' }, caption: 'Silahkan scan qris ini menggunakan semua aplikasi, masukan harga sesuai dengan voucher yang ingin dibeli, kirimkan bukti foto pembayaran ke chat ini.' });
            break;
        }
        case 'v-3000': {
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            const caption = `Voucher ini berlaku Selama 10 Jam. Di ervita.net`
            const vouchers = readVouchers();
            const voucher = vouchers.vouchers.find(v => v.harga === "3000" && !v.redeemed);

            if (voucher) {
                reply(`Kode voucher Anda adalah: ${voucher.kode}\nVoucher Berlaku:${voucher.paket}\n\nTerrimakasih Semoga Berlangganan`);
                // Update status voucher menjadi redeemed
                updateVoucherStatus(voucher.kode, true);
            } else {
                reply('Maaf, voucher dengan harga Rp.3000 tidak tersedia atau sudah digunakan.');
            }
            break;
        }
        case 'v-5000': {
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            const vouchers = readVouchers();
            const voucher = vouchers.vouchers.find(v => v.harga === "5000" && !v.redeemed);

            if (voucher) {
                reply(`Kode voucher Anda adalah: ${voucher.kode}`);
                // Update status voucher menjadi redeemed
                updateVoucherStatus(voucher.kode, true);
            } else {
                reply('Maaf, voucher dengan harga Rp.5000 tidak tersedia atau sudah digunakan.');
            }
            break;
        }
        case 'v-20000': {
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            const vouchers = readVouchers();
            const voucher = vouchers.vouchers.find(v => v.harga === "20000" && !v.redeemed);

            if (voucher) {
                reply(`Kode voucher Anda adalah: ${voucher.kode}`);
                // Update status voucher menjadi redeemed
                updateVoucherStatus(voucher.kode, true);
            } else {
                reply('Maaf, voucher dengan harga Rp.20000 tidak tersedia atau sudah digunakan.');
            }
            break;
        }
        case 'v-50000': {
            if (!isOwner(from)) {
                reply('sorry')
                return;
            }
            const vouchers = readVouchers();
            const voucher = vouchers.vouchers.find(v => v.harga === "50000" && !v.redeemed);

            if (voucher) {
                reply(`Kode voucher Anda adalah: ${voucher.kode}`);
                // Update status voucher menjadi redeemed
                updateVoucherStatus(voucher.kode, true);
            } else {
                reply('Maaf, voucher dengan harga Rp.50000 tidak tersedia atau sudah digunakan.');
            }
            break;
        }

        case 'chord': {

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
            const newOwner = commandParts.slice(1).join(' ').trim() + `@s.whatsapp.net`; // Mengambil argumen setelah perintah

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
            const newPrem = commandParts.slice(1).join(' ').trim() + `@s.whatsapp.net`; // Mengambil argumen setelah perintah

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
            } reply('Iya, tuan?');
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

        case 'kirimpesan': {
            let nomor = args[0];

            let data = JSON.stringify({
                "nomor": nomor,
                "pesan": pesan
            });
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${global.domain}/kirimpesan`, // Tambahkan 'http://' jika belum ada
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

        case 'ai': {
            const fetchAIResponse = async (text) => {
                try {
                    const response = await axios.get(`https://widipe.com/openai?text=${encodeURIComponent(text)}`); return response.data.result;  // Return hanya 'result'
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
        case 'ai2': {

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
        case 'styletext': {
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
        case 'gptturbo': {

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
        case 'gpt4': {

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
        case 'simi': {

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
        case 'bard': {

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
        case 'restart': {
            if (!isOwner(from)) {
                console.log('Sudah restart')
                reply('Khusus owner!');
                return;
            }
            process.exit()
            break;
        }
        case 'carilagu': {

            if (!text) return reply('Kamu mau cari lagu apa nih..?');

            widipe.get(`/findsong?text=${encodeURIComponent(text)}`)
                .then(response => {
                    const thumb = response.data.result.thumb;
                    const title = response.data.result.title;
                    const album = response.data.result.album;
                    const lirik = response.data.result.lyrics;  // Ambil 'result' dari respons
                    sock.sendMessage(from, { image: { url: `${thumb}` }, caption: `Berikut hasil gpencarian lagunya\n\nJudul:${title}\nAlbum:${album}\n\nLiriknya:${lirik}` });

                    //reply(`Judul:${title}\nAlbum:${album}\n\nLiriknya:${lirik}`);  // Kirim hasil kembali ke pengguna

                })
                .catch(error => {
                    console.error('Error during the request:', error);
                    reply('Maaf, terjadi kesalahan saat memproses permintaan.');
                });
            break;
        }
        case 'gambar': {
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
                    console.error('Error during the request:', error); reply('Maaf, terjadi kesalahan saat memproses permintaan.');
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
        case 'payment': {

            let msg = generateWAMessageFromContent(
                from,
                {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: {
                                    text: `Berikut daftar metode pembayaran saya ya~`
                                },
                                carouselMessage: {
                                    cards: [
                                        {
                                            header: proto.Message.InteractiveMessage.Header.create({
                                                ...(await prepareWAMessageMedia({ image: { url: './data/image/payment/dana.jpg' } }, { upload: sock.waUploadToServer })),
                                                title: '',
                                                gifPlayback: true,
                                                subtitle: `'ownername'`,
                                                hasMediaAttachment: false
                                            }),
                                            body: { text: `> Klik tombol DANA di bawah\n> DANA A/N: ${global.andana}` },
                                            nativeFlowMessage: {
                                                buttons: [
                                                    {
                                                        "name": "cta_copy",
                                                        "buttonParamsJson": `{\"display_text\":\"Payment DANA\",\"id\":\"123456789\",\"copy_code\":\"${global.nodana}\"}`
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            header: proto.Message.InteractiveMessage.Header.create({
                                                ...(await prepareWAMessageMedia({ image: { url: './data/image/payment/gopay.jpg' } }, { upload: sock.waUploadToServer })),
                                                title: '',
                                                gifPlayback: true,
                                                subtitle: `'ownername'`,
                                                hasMediaAttachment: false
                                            }),
                                            body: { text: `> Klik tombol GOPAY di bawah\n> GOPAY A/N: ${global.angopay}` },
                                            nativeFlowMessage: {
                                                buttons: [
                                                    {
                                                        "name": "cta_copy",
                                                        "buttonParamsJson": `{\"display_text\":\"Payment GOPAY\",\"id\":\"123456789\",\"copy_code\":\"${global.nogopay}\"}`
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            header: proto.Message.InteractiveMessage.Header.create({
                                                ...(await prepareWAMessageMedia({ image: { url: './data/image/payment/seabank.png' } }, { upload: sock.waUploadToServer })),
                                                title: '',
                                                gifPlayback: true,
                                                subtitle: `'ownername'`,
                                                hasMediaAttachment: false
                                            }),
                                            body: { text: `> Klik tombol Seabank di bawah\n> Seabank A/N: ${global.anseabank}` },
                                            nativeFlowMessage: {
                                                buttons: [
                                                    {
                                                        "name": "cta_copy",
                                                        "buttonParamsJson": `{\"display_text\":\"Payment Transfer Seabank\",\"id\":\"123456789\",\"copy_code\":\"${global.seabank}\"}`
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            header: proto.Message.InteractiveMessage.Header.create({
                                                ...(await prepareWAMessageMedia({ image: { url: './data/image/payment/bri.png' } }, { upload: sock.waUploadToServer })),
                                                title: '',
                                                gifPlayback: true,
                                                subtitle: `'ownername'`,
                                                hasMediaAttachment: false
                                            }),
                                            body: { text: `> Klik tombol BRI di bawah\n> BRI A/N: ${global.anbri}` },
                                            nativeFlowMessage: {
                                                buttons: [
                                                    {
                                                        "name": "cta_copy",
                                                        "buttonParamsJson": `{\"display_text\":\"Payment Transfer BRI\",\"id\":\"123456789\",\"copy_code\":\"${global.rekbri}\"}`
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            header: proto.Message.InteractiveMessage.Header.create({
                                                ...(await prepareWAMessageMedia({ image: { url: './data/image/payment/qris.jpg' } }, { upload: sock.waUploadToServer })),
                                                title: '',
                                                gifPlayback: true,
                                                subtitle: `'ownername'`,
                                                hasMediaAttachment: false
                                            }),
                                            body: { text: `> SCAN di atas / klik tombol` },
                                            nativeFlowMessage: {
                                                buttons: [
                                                    {
                                                        "name": "cta_url",
                                                        "buttonParamsJson": `{\"display_text\":\"Payment QRIS\",\"url\":\"https://i.ibb.co.com/N3fsFwQ/qr-ID1024325942133-12-09-24-172608640.jpg\",\"merchant_url\":\"https://www.google.com\"}`
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                    //  messageVersion: 1,
                                },
                            },
                        },
                    },
                },

                { quoted: fkontak }
            );

            await sock.relayMessage(msg.key.remoteJid, msg.message, {
                messageId: msg.key.id,
            });
        }
            break;

            case 'setbotbio':{
                if(!isOwner){
                    reply('kamu siapa?')
                    return
                }
                
                    
                sock.updateProfileStatus(text);
                
                reply('done')
                break;
            
            }
       


        //default: {
        // reply(`Hai saya ${global.namabot}\nSaya dibuat oleh ${global.namaowner}\n\nMohon bersabar, saya masih tahap pengembangan :)\nIni nomor owner saya wa.me/${global.owner}`);
        // break;
        // }
    }
};

module.exports = { handleMenu };
