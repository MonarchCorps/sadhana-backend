const express = require('express')
const router = express.Router()
const messageController = require('../../controllers/chat/messageController')

router.route('/:id')
    .get(messageController.handleGetMessages)
    .post(messageController.handleSendMessage);

module.exports = router