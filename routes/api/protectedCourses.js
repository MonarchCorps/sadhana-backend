const express = require('express')
const router = express.Router()
const coursesController = require('../../controllers/courses/coursesController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleWare/verifyRoles')

router.post('/:userId/add-new-class', verifyRoles(ROLES_LIST.Instructor), coursesController.handleAddNewClass);
router.get('/:userId/my-classes', verifyRoles(ROLES_LIST.Instructor), coursesController.handleMyClass);

router.route('/:id')
    .patch(verifyRoles(ROLES_LIST.Instructor, ROLES_LIST.User), coursesController.handleBookClass)
    .delete(verifyRoles(ROLES_LIST.Instructor), coursesController.handleDeleteClass)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Instructor), coursesController.handleUpdateClass)


router.patch('/unbook-class/:id', coursesController.handleUnBookClass)


module.exports = router;