const express = require('express')
const router = express.Router()
const instructorEarningsController = require('../../controllers/payment/instructorEarningsController')

router.get('/:id', instructorEarningsController.handleGetEarnings)

module.exports = router