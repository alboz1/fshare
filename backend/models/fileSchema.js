const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: true
    },
    name: String,
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
File.collection.drop();
module.exports = File;