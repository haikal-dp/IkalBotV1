const fs = require('fs');
const channelFilePath = '../channel.json';

const saveChannelData = (channelId) => {
  let channelData = JSON.parse(fs.readFileSync(channelFilePath, 'utf8'));
  if (!channelData.includes(channelId)) {
    channelData.push(channelId);
    fs.writeFileSync(channelFilePath, JSON.stringify(channelData, null, 2));
  }
};

const removeChannelData = (channelId) => {
  let channelData = JSON.parse(fs.readFileSync(channelFilePath, 'utf8'));
  const updatedData = channelData.filter(id => id !== channelId);
  fs.writeFileSync(channelFilePath, JSON.stringify(updatedData, null, 2));
};

module.exports = { saveChannelData, removeChannelData };
