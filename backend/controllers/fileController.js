const File = require('../models/fileSchema');
const { encrypt } = require('../lib/crypto');
const render = require('../lib/render');

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

function getFile(res, id) {
    return new Promise((resolve, reject) => {
        File.find({_id: id})
            .then(result => {
                const [ fileObj ] = result;
                if (!fileObj) {
                    throw new Error();
                }
                resolve(fileObj);
            })
            .catch(error => {
                console.log(error);
                render(404, '404', res);
            });
    });
}

module.exports = {saveFile, getFile};