const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructorId: String,
    amountPaid: Number
})

module.exports = mongoose.model('Payments', paymentSchema);