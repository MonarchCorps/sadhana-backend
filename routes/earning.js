const express = require('express')
const router = express.Router()
const instructorEarningController = require('../controllers/payment/instructorEarningController')

router.get('/:id', instructorEarningController.handleFetchEarnings)

module.exports = router