const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

function encrypt(buffer) {
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, process.env.KEY, initVector);
    const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);

    if (typeof buffer === 'string') {
        const encryptedHex = `${initVector.toString('hex')}:${encryptedBuffer.toString('hex')}`;
        return encryptedHex;
    } else {
        return { encryptedBuffer, initVector };
    }
}

function decrypt(buffer, iv) {
    const bufferData = typeof buffer === 'string' ? Buffer.from(buffer, 'hex') : Buffer.from(buffer);
    const initVector = typeof buffer === 'string' ? Buffer.from(iv, 'hex') : Buffer.from(iv);

    const decipher = crypto.createDecipheriv(algorithm, process.env.KEY, initVector);
    const decryptedBuffer = Buffer.concat([decipher.update(bufferData), decipher.final()]);

    return typeof buffer === 'string' ? decryptedBuffer.toString() : decryptedBuffer;
}

module.exports = {
    encrypt,
    decrypt
}