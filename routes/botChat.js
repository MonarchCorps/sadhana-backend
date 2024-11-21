const express = require('express');
const router = express.Router();
const botChatController = require('../controllers/botChatController')
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middleWare/verifyRoles')

router.use(verifyRoles(ROLES_LIST.Instructor, ROLES_LIST.User))
router.route('/:userId')
    .get(botChatController.handleGetBotChat)
    .put(botChatController.handleNewBotChat)
    .delete(botChatController.handleDeleteBotChat);

module.exports = router