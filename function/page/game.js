const db = require('../../setting/db');

const flipc = (req, res ) => {
res.render('game/flip-coin');
};

const tebakangka = (req, res) => {const username = req.session.username;

    db.query('SELECT saldo FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat mengambil saldo');
        }

        const balance = results[0].saldo;
        res.render('game/tebakangka', { username, balance }); // Tampilkan halaman game dengan saldo
    });
}
const ptebakangka =  (req, res) => {
    const username = req.session.username;
    const guess = parseInt(req.body.guess, 10); // Tebakan pengguna
    const randomNumber = Math.floor(Math.random() * 10) + 1; // Angka acak antara 1-10
    let message = '';

    // Ambil saldo pengguna
    db.query('SELECT saldo FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat mengambil saldo');
        }

        let balance = results[0].saldo;

        if (guess === randomNumber) {
            const reward = 10000; // Jumlah hadiah
            balance += reward;
            message = `Selamat! Anda menebak dengan benar dan mendapatkan Rp${reward.toLocaleString()}`;
        } else {
            const loss = 5000; // Biaya penalti
            balance -= loss;
            message = `Maaf, tebakan salah. Angka yang benar adalah ${randomNumber}. Saldo Anda berkurang Rp${loss.toLocaleString()}`;
        }

        // Perbarui saldo pengguna di database
        db.query('UPDATE users SET saldo = ? WHERE username = ?', [balance, username], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Terjadi kesalahan saat memperbarui saldo');
            }

            res.render('game/tebakangka', { username, balance, message }); // Render ulang halaman game dengan saldo terbaru
        });
    });
}
module.exports={
    flipc,
    ptebakangka,
    tebakangka
};