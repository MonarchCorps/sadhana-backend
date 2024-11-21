const express = require('express');
const router = express.Router();

const userController = require('../../controllers/dashboard/user/userController')
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleWare/verifyRoles');

router.use(verifyRoles(ROLES_LIST.User))
router.post('/:userId/apply-instructor', userController.handleInstructorApplication);

module.exports = router;