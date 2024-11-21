const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/dashboard/admin/adminController')
const ROLES_LIST = require('../../config/roles_list')
const verifyRoles = require('../../middleWare/verifyRoles')

router.use(verifyRoles(ROLES_LIST.Admin));

router.get('/pending-instructor', adminController.handlePendingInstructor);
router.get('/pending-class', adminController.handlePendingClass);

router.patch('/:id/approve-instructor', adminController.handleInstructorApproval);
router.patch('/:id/approve-class', adminController.handleClassesApproval)

router.get('/all-users', adminController.handleGetAllUsers)

router.delete('/delete-users/:id', adminController.handleDeleteUser)
router.delete('/delete-class', adminController.handleDeleteClass)

router.patch('/edit-user/:id', adminController.handleEditUser)

router.get('/user/profile/:id', adminController.handleGetSpecificUserProfile)

module.exports = router;