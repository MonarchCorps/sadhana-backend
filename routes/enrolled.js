const express = require('express');
const router = express.Router();
const enrolledController = require('../controllers/enrolledController')

router.get('/:userId', enrolledController.handleGetEnrolled)

module.exports = router