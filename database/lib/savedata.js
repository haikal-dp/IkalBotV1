
const { isOwner,isPremium} = require('./role');
const path = require('path');
// Path ke file owner.json dan user.json
const roleDatabasePath = path.join(__dirname,  '..','role.json');
const userDatabasePath = path.join(__dirname, '..','user.json');
const groupDatabasePath = path.join(__dirname, '..','group.json');
module.exports = {
    isOwner,
    isPremium,
    roleDatabasePath,
    groupDatabasePath,
    userDatabasePath
}