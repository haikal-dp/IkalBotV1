let messageLogs = [];
const logs = (req, res) => {
    res.render('logs', { messages: messageLogs });
};
const apilogs = (req, res) => {
    res.json(messageLogs);
}
const kirimpesan = (req, res) => {
    res.render('kirimpesan');
};
const index = (req, res) => {
    res.render('index');
}
const salon = (req, res) => {
    res.render('salon');
}
const foto = (req, res) => {
    const fotoDir = path.join(__dirname, 'database/foto');
    fs.readdir(fotoDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }

        // Filter hanya file gambar
        const fotoList = files.filter(file => {
            return file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg');
        });

        // Render halaman dengan daftar foto
        res.render('foto', { fotoList });
    });
};
const user = (req, res) => {
    fs.readFile(path.join(__dirname, 'database', 'user.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        const users = JSON.parse(data);
        res.render('user', { users });
    });
}
module.exports = {
    logs,
    kirimpesan,
    user,
    apilogs,
    foto,
    salon,
    index
}