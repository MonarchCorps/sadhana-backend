const express = require('express')
const router = express.Router()
const getTokenController = require('../controllers/zegocloud/getTokenController')

router.get('/:userId', getTokenController.handleGetToken)

module.exports = router