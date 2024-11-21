const mongoose = require('mongoose');
const { Schema } = mongoose;

const customPhotoSchema = new Schema({
    customPhoto: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('CustomPhoto', customPhotoSchema)