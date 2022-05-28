const crypto = require('crypto');
const { encrypt, decrypt } = require('./crypto');

function getToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const encryptedHex = encrypt(token);

    return encryptedHex;
}

function checkToken(token) {
    try {
        const tokenArray = token.split(':');
        const iv = tokenArray[0];
        const tokenHex = tokenArray[1];
        const decryptedBuffer = decrypt(tokenHex, iv);
        if (decryptedBuffer) {
            return decryptedBuffer;
        }
        throw new Error('Token not valid');
    } catch (error) {
        return false;
    }
}

module.exports = {
    getToken,
    checkToken
};