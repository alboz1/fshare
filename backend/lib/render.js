const fs = require('fs');
const ejs = require('ejs');

function render(status, route, res, data) {
    if (data) {
        ejs.renderFile(`${__dirname}/../../client/views/${route}.ejs`, data, (err, str) => {
            if (err) {
                throw err;
            }
            res.writeHead(status, { 'Content-Type': 'text/html' });
            res.write(str);
            res.end();
        });
        return;
    }

    res.writeHead(status, {'Content-Type': 'text/html'});
    fs.createReadStream(`${__dirname}/../../client/${route}.html`).pipe(res);
}

module.exports = render;