require('dotenv').config();

const http = require('http');
const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');
const mongoose = require('mongoose');
const crypto = require('crypto');

const render = require('./lib/render');
const static = require('./lib/static');
const File = require('./models/fileSchema');

const port = process.env.PORT || 4444;

//connect to database
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('connected to database'))
    .catch(error => console.log(error))

const app = http.createServer((req, res) => {
    //get static files
    if (req.url.includes('assets')) {
        static(req, res);
    } else if (req.url === '/') {
        render(200, 'index', res);
    } else if (req.url === '/file' && req.method === 'POST') {
        const form = formidable();
        
        form.parse(req);
        form.onPart = (part) => {
            console.log(part);
            const chunks = [];
            part.on('data', buffer => {
                chunks.push(buffer);
            });
            part.on('end', () => {
                const fileBuffer = Buffer.concat(chunks);
                if (fileBuffer.length >= 16777216) {
                    console.log(fileBuffer.length);
                    render(413, 'error', res, {
                        data: { error: 'File size too large! Maximum file size is 16MB.' }
                    });
                } else {
                    const algorithm = 'aes-256-cbc';
                    const initVector = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv(algorithm, process.env.KEY, initVector);
                    const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
                    console.log(encryptedFile);
                    const file = new File({
                        name: part.originalFilename,
                        file: {
                            contentType: part.mimetype,
                            data: encryptedFile,
                            iv: initVector
                        }
                    });
                    file.save()
                        .then(result => {
                            console.log(result);
                            const isImage = part.mimetype.includes('image');
                            render(200, 'file', res, {
                                data: {
                                    isImage: isImage,
                                    fileURL: `http://${req.headers.host}/download/?id=${result._id}`
                                }
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            render(400, 'error', res, {
                                data: { error: 'Oops! Something went wrong!' }
                            });
                        });
                }
            });
        }
    } else if (req.url.startsWith('/download')) {
        const url = new URL('http://' + req.headers.host + req.url);
        const params = url.searchParams;
        const fileId = params.get('id');

        File.find({_id: fileId})
            .then(result => {
                const [ fileObj ] = result;
                const fileData = Buffer.from(fileObj.file.data);
                const initVector = Buffer.from(fileObj.file.iv);

                const algorithm = 'aes-256-cbc';
                const decipher = crypto.createDecipheriv(algorithm, process.env.KEY, initVector);
                const decryptedFile = Buffer.concat([decipher.update(fileData), decipher.final()]);

                res.writeHead(200, {
                    'Content-type': fileObj.file.contentType,
                    'Content-disposition': 'attachment; filename=' + fileObj.name
                });
                res.write(decryptedFile);
                res.end();
            })
            .catch(err => {
                console.log(err);
                render(404, '404', res);
            });
    } else {
        render(404, '404', res);
    }

});

app.listen(port, () => console.log(`Listening to port ${port}`));