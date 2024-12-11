const express = require('express')
const router = express.Router()

const payoutController = require('../controllers/payoutController')

router.post('/', payoutController.handlePayout)

module.exports = router