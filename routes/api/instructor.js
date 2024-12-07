const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleWare/verifyRoles');

const instructorController = require('../../controllers/dashboard/instructor/instructorController')

router.use(verifyRoles(ROLES_LIST.Instructor))

router.patch('/:id', instructorController.handleEditInstructorProfile)

module.exports = router;