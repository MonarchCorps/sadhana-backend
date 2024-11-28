const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String, enum: ['text', 'image', 'video', 'voiceNote'],
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('Message', messageSchema)