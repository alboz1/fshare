const render = require('./render');
const static = require('./static');
const { getToken } = require('./token');
const { file_upload_get, file_upload_post, file_download_get, file_download } = require('../controllers/fileController');
const shortUrl_redirect = require('../controllers/shortUrlController');

function requestListener(req, res) {
    const url = new URL('http://' + req.headers.host + req.url);
    const params = url.searchParams;
    const fileId = params.get('id');
    
    if (req.url.match(/\/public\/(.*)/)) {
        //serve static files
        static(req, res);

    } else if (req.url === '/') {
        const encryptedHex = getToken();

        render(200, 'index', req, res, { token: encryptedHex });
    } else if (req.url.match(/\/upload\/\?id=.*/) && fileId && req.method === 'GET') {

        file_upload_get(req, res, fileId);

    } else if (req.url === '/upload' && req.method === 'POST') {

        file_upload_post(req, res);

    } else if (req.url.match(/\/file\/\?id=.*/) && fileId) {

        file_download_get(req, res, fileId);

    } else if (req.url.match(/\/download\/\?id=.*/) && fileId) {

        file_download(req, res, fileId);

    } else if (req.url.match(/\/.*/)) {

        shortUrl_redirect(req, res);

    } else {
        render(404, '404', req, res);
    }
}

module.exports = requestListener;