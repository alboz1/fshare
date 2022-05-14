const File = require('../models/fileSchema');
const { encrypt } = require('../lib/crypto');
const render = require('../lib/render');

function saveFile(file, fileBuffer) {
    const { encryptedFile, initVector } = encrypt(fileBuffer);

    const newFile = new File({
        name: file.originalFilename,
        file: {
            contentType: file.mimetype,
            data: encryptedFile,
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
                resolve(fileObj);
            })
            .catch(error => {
                console.log(error);
                render(404, '404', res);
            });
    });
}

module.exports = {saveFile, getFile};