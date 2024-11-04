const request = require('request');

const sendMessage = (nomor, pesan) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'http://localhost/p', // Pastikan URL ini sesuai dengan endpoint yang benar
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nomor": nomor,
                "pesan": pesan
            })
        };

        request(options, function (error, response) {
            if (error) {
                return reject(error); // Menolak promise jika terjadi error
            }
            resolve(response.body); // Menyelesaikan promise dengan respons
        });
    });
};

// Membuat array untuk semua promise
const requests = [];
const nomor = "6285172207018"; // Nomor tujuan
const pesan = "Halo, ini pesan dari bot WhatsApp!";

for (let i = 0; i < 10; i++) {
    requests.push(sendMessage(nomor, pesan)); // Menambahkan setiap promise ke array
}

// Menggunakan Promise.all untuk menunggu semua permintaan selesai
Promise.all(requests)
    .then(responses => {
        responses.forEach((response, index) => {
            console.log(`Response ${index + 1}:`, response);
        });
    })
    .catch(error => {
        console.error('Terjadi kesalahan:', error);
    });
