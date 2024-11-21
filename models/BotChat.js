const mongoose = require('mongoose');
const { Schema } = mongoose;

const botChatSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    }
                }
            ],
            img: {
                type: String,
                required: false
            }
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('BotChat', botChatSchema)