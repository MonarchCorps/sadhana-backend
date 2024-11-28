const express = require('express')
const router = express.Router()
const conversationController = require('../../controllers/chat/conversationController')

router.route('/:id')
    .get(conversationController.handleGetMyConversations)
    .post(conversationController.handleCreateConversation);

router.get('/group-members/:conversationId', conversationController.handleGetGroupMembers)

module.exports = router