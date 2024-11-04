function isPc(message) {
    return !message.key.remoteJid.endsWith('@g.us'); // true jika di chat pribadi
  }

  module.exports = { isPc };