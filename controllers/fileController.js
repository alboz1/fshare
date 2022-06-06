const File = require('../models/fileSchema');
const ShortUrl = require('../models/shortUrlSchema');
const { checkToken } = require('../lib/token');
const { decrypt } = require('../lib/crypto');
const render = require('../lib/render');
const parseForm = require('../lib/parseForm');
const readAndSaveFile = require('../lib/readAndSaveFile');
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

function file_upload_get(req, res, id) {
    const file = File.findOne({ _id: id });
    const shareURL = ShortUrl.findOne({ fileId: id });
    const result = Promise.all([file, shareURL]);

    result.then(data => {
        const [file, shareURL] = data;

        if (!file || !shareURL) {
            throw new Error('Not found!');
        }

        render(200, 'upload', req, res, {
            file: {
                isImage: file.file.contentType.includes('image'),
                name: file.name,
                downloadURL: `${protocol}://${req.headers.host}/download/?id=${file._id}`,
                shareURL: `${protocol}://${req.headers.host}/${shareURL.shortUrl}`
            }
        });
    })
    .catch(error => {
        render(404, '404', req, res);
    });
}

function file_upload_post(req, res) {
    parseForm(req, res)
        .then(body => {
            const token = checkToken(body.token);

            if (!token) {
                render(401, 'upload', req, res, {
                    error: 'Unauthorized'
                });
                return;
            }

            File.findOne({ token: token })
                .then(result => {
                    if (result) {
                        res.writeHead(303, {
                            'Location': '/upload/?id=' + result._id,
                            'Content-Type': 'text/html'
                        });
                        res.end();
                    } else {
                        readAndSaveFile(body.file, token, req, res);
                    }
                })
                .catch(error => {
                    render(500, 'upload', req, res, {
                        error: 'Oops! Something went wrong!'
                    });
                });
        });
}

function file_download_get(req, res, id) {
    File.findOne({ _id: id })
        .then(result => {
            if (!result) {
                throw new Error('Not found');
            }

            render(200, 'file', req, res, {
                file: {
                    isImage: result.file.contentType.includes('image'),
                    name: result.name,
                    url: `${protocol}://${req.headers.host}/download/?id=${result._id}`
                }
            });
        })
        .catch(error => {
            render(404, '404', req, res);
        });
}

function file_download(req, res, id) {
    File.findOne({ _id: id })
        .then(result => {
            if (!result) {
                throw new Error('Not found');
            }

            const decryptedBuffer = decrypt(result.file.data, result.file.iv);
                
            res.writeHead(200, {
                'Content-type': result.file.contentType,
                'Content-disposition': 'attachment; filename=' + result.name
            });
            res.write(decryptedBuffer);
            res.end();
        })
        .catch(error => {
            render(404, '404', req, res);
        });
}

module.exports = {
    file_upload_get,
    file_upload_post,
    file_download_get,
    file_download
};