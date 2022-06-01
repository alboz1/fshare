const ShortUrl = require('../models/shortUrlSchema');
const render = require('../lib/render');

function shortUrl_redirect(req, res) {
    const url = req.url.substring(1);
    
    ShortUrl.findOne({ shortUrl: url })
        .then(url => {
            res.writeHead(301, {
                'Location': url.fullUrl
            });
            res.end();
        })
        .catch(error => {
            render(404, '404', req, res);
        });
}

module.exports = shortUrl_redirect;