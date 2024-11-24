const express = require('express')
const router = express.Router()
const webhookController = require('../controllers/payment/webhookController')

router.post('/', webhookController.handleWebhooks)

module.exports = router