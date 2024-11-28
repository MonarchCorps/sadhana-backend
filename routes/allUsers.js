const express = require('express')
const router = express.Router()
const allUsersController = require('../controllers/allUsersController')

router.get('/', allUsersController.handleGetAllUsers)

module.exports = router