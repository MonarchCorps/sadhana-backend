const mongoose = require('mongoose');
const { Schema } = mongoose;

const instructorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    experience: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'denied']
    },
    bgImage: {
        type: String,
        required: false
    },
    account: {
        accountId: { type: String, required: false },
        subaccountCode: { type: String, required: false }
    },
    dateApplied: {
        type: Date,
        default: Date.now
    },
    dateApproved: {
        type: Date
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Instructor', instructorSchema);