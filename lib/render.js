const ejs = require('ejs');

function render(status, route, req, res, data={}) {
    const theme = req.headers.cookie && req.headers.cookie.split('=')[1];
    const title = route === 'index' ? '' : route.charAt(0).toUpperCase() + route.slice(1);
    
    data.theme = theme === 'dark' ? 'dark-mode' : '';
    data.page = route;
    data.error = !data.error ? '' : data.error;
    data.title = title;
    
    ejs.renderFile(`${__dirname}/../views/${route}.ejs`, data, (err, str) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store'
            });
            res.write(err.message);
            res.end();
            return;
        }

        res.writeHead(status, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store'
        });
        res.write(str);
        res.end();
    });
}

module.exports = render;