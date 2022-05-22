const fs = require('fs');
const path = require('path');

function static(req, res) {
    const filePath = `.${req.url}`;
    const extName = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[extName];

    fs.readFile(`${__dirname}/../../client/${req.url}`, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType
        });
        res.end(data, 'utf-8');
    });
}

module.exports = static;