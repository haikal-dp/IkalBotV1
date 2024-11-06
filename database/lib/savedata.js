const { modul } = require('./module')
const {axios, path, fs,p, process} = modul
const groupDatabasePath = path.join(__dirname, 'database', 'group.json');
const userDatabasePath = path.join(__dirname, 'database', 'user.json');
const roleDatabasePath = path.join(__dirname, 'database', 'role.json');

module.exports = {
    groupDatabasePath,
    userDatabasePath,
    roleDatabasePath
}