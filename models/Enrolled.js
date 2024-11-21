const mongoose = require('mongoose')
const { Schema } = mongoose

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
    courseDetails: {
        type: Array,
        default: [],
        required: true
    },
    paymentDetails: {
        paymentId: {
            type: String,
            required: true
        },
        payment_method_type: {
            type: String,
            required: true
        },
        payment_status: {
            type: String,
            required: true

        }
    },
    referenceNumber: {
        type: String,
        required: true,
        unique: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    cardType: {
        type: String,
        required: true
    },
    fees: {
        type: Number,
        require: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Enrolled', enrolledSchema);