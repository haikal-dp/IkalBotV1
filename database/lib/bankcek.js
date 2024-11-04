
const { cekLimit } = require('./cekLimit');
const { cekSaldo } = require('./cekSaldo');
const fs = require('fs');
const path = require('path');

const saldomessasge = cekSaldo(from);
const limitMessage = cekLimit(from);

global.bankcek = `Hai ini dia informasi Bank kamu 🏦
Saldo tersisa:${saldomessasge}
Limit Tersisa:${limitMessage}`