const fs = require('fs');
const groupFilePath = '../group.json';

const saveGroupData = (groupId) => {
  let groupData = JSON.parse(fs.readFileSync(groupFilePath, 'utf8'));
  if (!groupData.includes(groupId)) {
    groupData.push(groupId);
    fs.writeFileSync(groupFilePath, JSON.stringify(groupData, null, 2));
  }
};

const removeGroupData = (groupId) => {
  let groupData = JSON.parse(fs.readFileSync(groupFilePath, 'utf8'));
  const updatedData = groupData.filter(id => id !== groupId);
  fs.writeFileSync(groupFilePath, JSON.stringify(updatedData, null, 2));
};

module.exports = { saveGroupData, removeGroupData };
