const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
    fullUrl: {
        type: String,
        unique: true,
        required: true
    },
    shortUrl: {
        type: String,
        unique: true,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now(),
        index: {
            expires: 300
        }
    }
});

const ShortUrl = new mongoose.model('ShortUrl', shortUrlSchema);

module.exports = ShortUrl;