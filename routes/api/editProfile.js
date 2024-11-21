const express = require('express')
const router = express.Router()
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleWare/verifyRoles')

const editProfileController = require('../../controllers/editProfileController')

router.use(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Instructor, ROLES_LIST.User))
router.patch('/:id', editProfileController.handleEditProfile);

module.exports = router;