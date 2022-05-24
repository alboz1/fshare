const fs = require('fs');
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

function getFile(req, res, id) {
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
                render(404, '404', req, res);
            });
    });
}

function readAndSaveFile(file, token, req, res) {
    let fileBuffer = [];
    const fileStream = fs.createReadStream(file.filepath);
    
    fileStream.on('data', chunk => {
        fileBuffer.push(chunk);
    });
    fileStream.on('end', () => {
        fileBuffer = Buffer.concat(fileBuffer);

        //check if user selected a file to upload
        if (!fileBuffer.length) {
            render(400, 'upload', req, res, {
                error: 'Please select a file to upload!'
            });
            return;
        }

        //check file size
        if (fileBuffer.length >= 16777216) {
            render(413, 'upload', req, res, {
                error: 'File size too large! Maximum file size is 16MB.'
            });
            return;
        }

        const data = saveFile(file, fileBuffer, token);
        data.then(result => {
            res.writeHead(303, {
                'Location': '/upload/?id=' + result._id,
                'Content-Type': 'text/html'
            });
            res.end();
        })
        .catch(error => {
            render(500, 'upload', req, res, {
                error: 'Oops! Something went wrong!'
            });
        });
    });
}

module.exports = {
    getFile,
    readAndSaveFile
};