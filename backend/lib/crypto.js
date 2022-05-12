const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

function encrypt(file) {
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, process.env.KEY, initVector);
    const encryptedFile = Buffer.concat([cipher.update(file), cipher.final()]);

    return { encryptedFile, initVector };
}

function decrypt(file, iv) {
    const fileData = Buffer.from(file);
    const initVector = Buffer.from(iv);
    const decipher = crypto.createDecipheriv(algorithm, process.env.KEY, initVector);
    const decryptedFile = Buffer.concat([decipher.update(fileData), decipher.final()]);

    return decryptedFile;
}

module.exports = {
    encrypt,
    decrypt
}