const mongoose = require('mongoose')
const { Schema } = mongoose

const payoutSchema = new Schema({
    instructorId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Payout', payoutSchema)