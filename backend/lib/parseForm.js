const formidable = require('formidable');
const render = require('./render');

function parseForm(req, res) {
    const body = {};
    const form = formidable();

    return new Promise((resolve, reject) => {
        form.parse(req, (error, fields, files) => {
            if (error) {
                render(500, 'upload', req, res, {
                    error: 'Oops, something went wrong'
                });
                return;
            }
    
            body.token = fields.token;
            body.file = files.file;
            resolve(body);
        });
    });
}

module.exports = parseForm;