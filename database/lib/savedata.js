
const { isOwner,isPremium} = require('./role');
const path = require('path');
// Path ke file owner.json dan user.json
const roleDatabasePath = path.join(__dirname,  'role.json');
const userDatabasePath = path.join(__dirname, 'user.json');

module.exports = {
    isOwner,
    isPremium,
    roleDatabasePath,
    userDatabasePath
}