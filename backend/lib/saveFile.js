const File = require('../models/fileSchema');
const { encrypt } = require('./crypto');

function saveFile(file, fileBuffer, token) {
    const { encryptedBuffer, initVector } = encrypt(fileBuffer);

    const newFile = new File({
        token: token,
        name: file.originalFilename,
        file: {
            contentType: file.mimetype,
            data: encryptedBuffer,
            iv: initVector
        }
    });

    return newFile.save();
}

module.exports = saveFile;