const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/payment/paymentController')

router.post('/:userId/initialize', paymentController.handlePayment)
router.post('/:userId/verify', paymentController.handleVerification)

module.exports = router