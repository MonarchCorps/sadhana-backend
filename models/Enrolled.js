const mongoose = require('mongoose')
const { Schema } = mongoose
const { v4: uuidv4 } = require('uuid');

const enrolledSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This creates a reference to the User model
        required: true
    },
    email: {
        type: String,
        required: true
    },
    courseDetails: [
        {
            _id: String,
            classname: String,
            thumbnailPhoto: String,
            videoUrl: String,
            description: String,
            day: String,
            time: Object,
            instructorId: String,
            paidPrice: Number,
            referenceNumber: {
                type: String,
                unique: true,
                default: uuidv4,
            }
        },
    ],
    paymentDetails: {
        paymentId: {
            type: String,
            default: ''
        },
        payment_method_type: [],
        payment_status: {
            type: String,
            default: ''
        }
    },
    shipping_options: [],
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Enrolled', enrolledSchema);