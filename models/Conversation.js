const mongoose = require('mongoose')
const { Schema } = mongoose

const conversationSchema = new Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        required: false
    },
    groupImage: {
        type: String, required: false
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Conversation', conversationSchema)