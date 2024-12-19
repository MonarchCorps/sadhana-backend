const express = require('express');
const router = express.Router();
const closeModalController = require('../controllers/closeModalController')

router.post('/', closeModalController.handleCloseModal)

module.exports = router