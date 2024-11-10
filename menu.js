require('./setting');//require('./database/lib/bankcek');
const { modul } = require('./database/lib/module')
const { axios, path, fs, baileys, process } = modul
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, generateForwardMessageContent } = baileys

const { isOwner, isPremium } = require('./database/lib/role');
// Path ke file owner.json dan user.json
const roleDatabasePath = path.join(__dirname, 'database', 'role.json');
const userDatabasePath = path.join(__dirname, 'database', 'user.json');

// Fungsi untuk membaca data voucher dari file JSON
const readVouchers = () => {
    const filePath = path.join(__dirname, 'database', 'voucher.json');
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

// Fungsi untuk memperbarui status voucher
const updateVoucherStatus = (kode, status) => {
    const filePath = path.join(__dirname, 'database', 'voucher.json');
    const vouchers = readVouchers();
    const voucher = vouchers.vouchers.find(v => v.kode === kode);
    
    if (voucher) {
        voucher.redeemed = status;
        fs.writeFileSync(filePath, JSON.stringify(vouchers, null, 2));
    } else {
        console.error(`Voucher dengan kode ${kode} tidak ditemukan.`);
    }
};



// Fungsi untuk menambahkan voucher baru
const addVoucher = (paket, harga, kode) => {
    const filePath = path.join(__dirname, 'database', 'voucher.json');
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
module.exports = handleMenu = async (sock, from, commandText) => {

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
            if(!isOwner(from)){
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
            if(!isOwner(from)){
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
                if(!isOwner(from)){
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









        //default: {
        // reply(`Hai saya ${global.namabot}\nSaya dibuat oleh ${global.namaowner}\n\nMohon bersabar, saya masih tahap pengembangan :)\nIni nomor owner saya wa.me/${global.owner}`);
        // break;
        // }
    }
};

module.exports = { handleMenu };
