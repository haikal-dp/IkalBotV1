let messageLogs = [];



const logs = (req, res) => {
    res.render('logs', { messages: messageLogs });
};
const apilogs = (req, res) => {
    res.json(messageLogs);
}
const papilogs = (req, res) => {
    const { from, message, sockId, timestamp } = req.body;
    messageLogs.unshift({ from, message, sockId, timestamp });
    if (messageLogs.length > 100) {
        messageLogs = messageLogs.slice(0, 100);
    }
    res.json({ success: true });
}

const pkirimpesan = async (req, res) => {
    const { nomor, pesan } = req.body;
    if (!nomor || !pesan) {
        return res.status(400).send({ error: 'Nomor dan pesan harus disertakan!' });
    }
    try {
        await sock1.sendMessage(nomor + '@s.whatsapp.net', { text: pesan });
        res.send({ status: 'Pesan berhasil dikirim!' });
        console.log('Pesan dikirim');
    } catch (err) {
        console.error('Gagal mengirim pesan:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan' });
    }
};

const ptiktok = async (req, res) => {
    const { nomor, whoL, like, totalL, viewc, pesan, join, who, komen, view, follow, wholL, whoid } = req.body;
    try {
        if (komen) {
            await sock1.sendMessage('120363333754784062@g.us', { text: `TIKTOK LIVE :\n\n${who} (userId: ${whoid})\nberkomentar: ${komen}` });
        }
        if (join) {
            await sock1.sendMessage('120363336894802532@g.us', { text: `TIKTOK LIVE :\n\n${join} bergabung ke dalam live` });
        }
        if (totalL) {
            await sock1.sendMessage('120363334817188660@g.us', { text: `TIKTOK LIVE :\n\n${whoL} mengirim like sebanyak ${like}\n\nTotal Likes: ${totalL}` });
        }
        if (viewc) {
            await sock1.sendMessage('120363334577871397@g.us', { text: `TIKTOK LIVE :\n\nTotal Views Now: ${viewc}` });
        }

        const dataToSend = { nomor, like, totalL, viewc, pesan, join, whoL, who, komen, view, follow, whoid };
        const response = await axios.post('https://haikung.my.id/data/tiktok', dataToSend);
        console.log('Data berhasil dikirim ke haikung:', response.data);
        res.send({ status: 'Pesan dan data berhasil dikirim!' });
    } catch (err) {
        console.error('Gagal mengirim pesan atau data:', err);
        res.status(500).send({ error: 'Gagal mengirim pesan atau data' });
    }
};

const kirimpesan = (req, res) => {
    res.render('kirimpesan');
};
module.exports = {
    logs,
    kirimpesan,
    ptiktok,
    pkirimpesan,
    papilogs,
    apilogs
}