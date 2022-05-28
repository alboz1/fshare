const fs = require('fs');
const render = require('./render');
const saveFile = require('./saveFile');
const crypto = require('crypto');
const ShortUrl = require('../models/shortUrlSchema');

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
            //save short url to database
            const url = new ShortUrl({
                fullUrl: `/file/?id=${result._id}`,
                fileId: result._id
            });
            return url.save();
        })
        .then(result => {
            res.writeHead(303, {
                'Location': '/upload/?id=' + result.fileId,
                'Content-Type': 'text/html'
            });
            res.end();
        })
        .catch(error => {
            console.log(error);
            render(500, 'upload', req, res, {
                error: 'Oops! Something went wrong!'
            });
        });
    });
}

module.exports = readAndSaveFile;