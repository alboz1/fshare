require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const render = require('./lib/render');
const static = require('./lib/static');
const parseForm = require('./lib/parseForm');
const { decrypt } = require('./lib/crypto');
const { getToken, checkToken } = require('./controllers/tokenController');
const { getFile, readAndSaveFile } = require('./controllers/fileController');
const File = require('./models/fileSchema');

const port = process.env.PORT || 4444;

//connect to database
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('connected to database'))
    .catch(error => console.log(error))

const app = http.createServer(async (req, res) => {
    const url = new URL('http://' + req.headers.host + req.url);
    const params = url.searchParams;
    const fileId = params.get('id');

    //get static files
    if (req.url.includes('assets')) {
        static(req, res);
    } else if (req.url === '/') {
        const encryptedHex = getToken();
        render(200, 'index', res, { token: encryptedHex });
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
        const body = await parseForm(req, res);
        const token = checkToken(body.token);

        if (!token) {
            render(400, 'upload', res, {
                error: 'Something went wrong!'
            });
            return;
        }

        File.findOne({ token: token })
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
                    readAndSaveFile(body.file, token, req, res);
                }
            })
            .catch(error => {
                console.log(error);
                render(500, 'upload', res, {
                    error: 'Oops! Something went wrong!'
                });
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