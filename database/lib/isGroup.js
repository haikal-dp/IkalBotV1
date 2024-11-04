function isGroup(message) {
    return message.key.remoteJid.endsWith('@g.us'); // true jika di dalam grup
  }

  module.exports = {isGroup};