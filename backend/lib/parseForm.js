const formidable = require('formidable');

function parseForm(req) {
    const form = formidable();
    form.parse(req);

    const file = new Promise((resolve, reject) => {
        form.onPart = part => {
            const chunks = [];
            part.on('data', buffer => {
                chunks.push(buffer);
            });
            part.on('end', () => {
                resolve({fileBuffer: Buffer.concat(chunks), part});
            });
        }
    });

    return file;
}

module.exports = parseForm;