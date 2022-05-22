const fs = require('fs');
const ejs = require('ejs');

function render(status, route, res, data) {
    if (data) {
        const title = route === 'index' ? '' : route.charAt(0).toUpperCase() + route.slice(1);
        data.page = route;
        data.error = !data.error ? '' : data.error;
        data.title = title;
        
        ejs.renderFile(`${__dirname}/../../client/views/${route}.ejs`, data, (err, str) => {
            if (err) {
                throw err;
            }

            res.writeHead(status, {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store',
                'Vary': '*'
            });
            res.write(str);
            res.end();
        });
        return;
    }

    res.writeHead(status, {'Content-Type': 'text/html'});
    fs.createReadStream(`${__dirname}/../../client/${route}.html`).pipe(res);
}

module.exports = render;