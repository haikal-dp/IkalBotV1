const path = require('path');
const groupDatabasePath = path.join(__dirname,'..', 'group.json');
const userDatabasePath = path.join(__dirname,'..', 'user.json');
const roleDatabasePath = path.join(__dirname, '..','role.json');

module.exports = {
    groupDatabasePath,
    userDatabasePath,
    roleDatabasePath
}//kenapa join tidak terbaca atau error