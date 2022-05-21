const crypto = require('crypto');
const { encrypt } = require('./crypto');

function getToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const encryptedHex = encrypt(token);

    return encryptedHex;
}

module.exports = getToken;