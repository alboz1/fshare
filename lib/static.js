const fs = require('fs');
const path = require('path');
const render = require('./render');

function static(req, res) {
    const filePath = `.${req.url}`;
    const extName = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    const contentType = mimeTypes[extName];

    fs.readFile(`${__dirname}/../${req.url}`, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                render(404, '404', req, res);
            } else {
                res.writeHead(500, {
                    'Content-Type': 'text/html'
                });
                res.end(err.code);
            }
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType
        });
        res.end(data, 'utf-8');
    });
}

module.exports = static;