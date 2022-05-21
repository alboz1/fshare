const formidable = require('formidable');

function parseForm(req) {
    const form = formidable();
    form.parse(req);

    const file = new Promise((resolve, reject) => {
        form.on('data', ({name, key, value, buffer}) => {
            if (name === 'field') {
                resolve(value);
            }
            if (name === 'file') {
                console.log(value);
                resolve(value);
            }
        });
        // form.onPart = part => {
        //     const chunks = [];
        //     const fieldToken = [];
        //     part.on('data', buffer => {
        //         if (!part.originalFilename && !part.mimetype) {
        //             fieldToken.push(buffer);
        //         } else {
        //             chunks.push(buffer);
        //         }
        //     });
        //     part.on('end', () => {
        //         // console.log(fieldToken);
        //         resolve({fileBuffer: Buffer.concat(chunks), part, fieldToken: Buffer.concat(fieldToken)});
        //     });
        // }
    });

    return file;
}

module.exports = parseForm;