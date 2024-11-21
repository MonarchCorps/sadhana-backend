const express = require('express');
const router = express.Router();
const lastActiveController = require('../controllers/lastActiveController')
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middleWare/verifyRoles')

router.use(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Instructor, ROLES_LIST.User))

router.post('/', lastActiveController.handleLastActive);

module.exports = router;