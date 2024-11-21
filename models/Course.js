const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classname: {
        type: String,
        required: true
    },
    thumbnailPhoto: {
        type: String,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    time: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'denied']
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

module.exports = mongoose.model('Course', courseSchema);