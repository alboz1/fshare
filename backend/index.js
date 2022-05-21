require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const formidable = require('formidable');
const fs = require('fs');
const render = require('./lib/render');
const static = require('./lib/static');
const { decrypt } = require('./lib/crypto');
const getToken = require('./lib/getToken');
const { saveFile, getFile } = require('./controllers/fileController');
const File = require('./models/fileSchema');

const port = process.env.PORT || 4444;

//connect to database
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('connected to database'))
    .catch(error => console.log(error))

const app = http.createServer((req, res) => {
    const url = new URL('http://' + req.headers.host + req.url);
    const params = url.searchParams;
    const fileId = params.get('id');

    //get static files
    if (req.url.includes('assets')) {
        static(req, res);
    } else if (req.url === '/') {
        const encryptedHex = getToken();
        render(200, 'index', res, {token: encryptedHex });
    } else if (req.url.startsWith('/upload') && fileId && req.method === 'GET') {
        getFile(res, fileId)
            .then(result => {
                const isImage = result.file.contentType.includes('image');
                render(200, 'upload', res, {
                    file: {
                        isImage: isImage,
                        name: result.name,
                        downloadURL: `http://${req.headers.host}/download/?id=${result._id}`,
                        shareURL: `http://${req.headers.host}/file/?id=${result._id}`
                    }
                });
            });
    } else if (req.url === '/upload' && req.method === 'POST') {
        const form = formidable();
        form.parse(req, (err, fields, files) => {
            if (err) {
                throw err;
            }

            try {
                const tokenArray = fields.token.split(':');
                const iv = tokenArray[0];
                const token = tokenArray[1];
                const decryptedBuffer = decrypt(token, iv);
                if (!decryptedBuffer) throw new Error();

                File.findOne({ token: decryptedBuffer })
                    .then(result => {
                        if (result) {
                            const isImage = result.file.contentType.includes('image');
                            render(303, 'upload', res, {
                                file: {
                                    isImage: isImage,
                                    name: result.name,
                                    downloadURL: `http://${req.headers.host}/download/?id=${result._id}`,
                                    shareURL: `http://${req.headers.host}/file/?id=${result._id}`
                                }
                            }, result._id);
                        } else {
                            console.log('Started file reading');
                            let fileBuffer = [];
                            const fileStream = fs.createReadStream(files.file.filepath);
                            fileStream.on('data', chunk => {
                                fileBuffer.push(chunk);
                            });
                            fileStream.on('end', () => {
                                console.log(Buffer.concat(fileBuffer));
                                fileBuffer = Buffer.concat(fileBuffer);
                                //check if user selected a file to upload
                                if (!fileBuffer.length) {
                                    render(400, 'upload', res, {
                                        error: 'Please select a file to upload!'
                                    });
                                    return;
                                }

                                //check file size
                                if (fileBuffer.length >= 16777216) {
                                    render(413, 'upload', res, {
                                        error: 'File size too large! Maximum file size is 16MB.'
                                    });
                                    return;
                                }

                                const data = saveFile(files.file, fileBuffer, decryptedBuffer);
                                data.then(result => {
                                    console.log('End file reading');
                                    const isImage = result.file.contentType.includes('image');
                                    render(303, 'upload', res, {
                                        file: {
                                            isImage: isImage,
                                            name: result.name,
                                            downloadURL: `http://${req.headers.host}/download/?id=${result._id}`,
                                            shareURL: `http://${req.headers.host}/file/?id=${result._id}`
                                        }
                                    }, result._id);
                                })
                                .catch(error => {
                                    console.log(error);
                                    render(400, 'upload', res, {
                                        error: 'Oops! Something went wrong!'
                                    });
                                });
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        render(400, 'upload', res, {
                            error: 'Oops! Something went wrong!'
                        });
                    });
            } catch (error) {
                console.log(error);
                render(400, 'upload', res, {
                    error: 'Oops! Something went wrong!'
                });
            }
        });
    } else if (req.url.startsWith('/file') && fileId) {
        getFile(res, fileId)
            .then(result => {
                const isImage = result.file.contentType.includes('image');

                render(200, 'file', res, {
                    file: {
                        isImage: isImage,
                        name: result.name,
                        url: `http://${req.headers.host}/download/?id=${result._id}`
                    }
                });
            });
    } else if (req.url.startsWith('/download') && fileId) {
        getFile(res, fileId)
            .then(result => {
                const decryptedBuffer = decrypt(result.file.data, result.file.iv);
                
                res.writeHead(200, {
                    'Content-type': result.file.contentType,
                    'Content-disposition': 'attachment; filename=' + result.name
                });
                res.write(decryptedBuffer);
                res.end();
            });
    } else {
        render(404, '404', res);
    }

});

app.listen(port, () => console.log(`Listening to port ${port}`));