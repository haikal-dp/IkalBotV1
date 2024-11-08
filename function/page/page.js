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
module.exports = {
    logs,
    kirimpesan,
    apilogs
}