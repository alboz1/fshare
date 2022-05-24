const ejs = require('ejs');

function render(status, route, req, res, data={}) {
    const theme = req.headers.cookie && req.headers.cookie.split('=')[1];
    const title = route === 'index' ? '' : route.charAt(0).toUpperCase() + route.slice(1);
    
    data.theme = theme === 'dark' ? 'dark-mode' : '';
    data.page = route;
    data.error = !data.error ? '' : data.error;
    data.title = title;
    
    ejs.renderFile(`${__dirname}/../../client/views/${route}.ejs`, data, (err, str) => {
        if (err) {
            throw err;
        }

        res.writeHead(status, {
            'Content-Type': 'text/html'
        });
        res.write(str);
        res.end();
    });
}

module.exports = render;