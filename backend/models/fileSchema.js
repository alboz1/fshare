const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    securityKey: String,
    file: {
        contentType: String,
        data: Buffer,
        iv: Buffer
    },
    expireAt: {
        type: Date,
        default: Date.now(),
        index: {
            expires: 300
        }
    }
});

const File = new mongoose.model('File', fileSchema);

module.exports = File;