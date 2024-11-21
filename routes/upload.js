const express = require('express');
const router = express.Router();
const imageKitController = require('../controllers/imageKitController')

router.get('/', imageKitController.handleUpload)

module.exports = router