const express = require('express')
const router = express.Router()
const getBanksController = require('../controllers/payment/getBanksController.js')

router.get('/', getBanksController.handleGetBanks)

module.exports = router