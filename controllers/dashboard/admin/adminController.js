
const { handleGetAllUsers } = require('./manageUsersController')

const { handlePendingInstructor } = require('./manageUsersController')

const { handlePendingClass } = require('./manageClassesController')

const { handleInstructorApproval } = require('./manageUsersController')

const { handleClassesApproval } = require('./manageClassesController')

const { handleDeleteUser } = require('./manageUsersController')

const { handleDeleteClass } = require('./manageClassesController')

const { handleEditUser } = require('./editUserController')

const { handleGetSpecificUserProfile } = require('./getSpecificUserProfileController')


module.exports = { handlePendingInstructor, handleInstructorApproval, handlePendingClass, handleClassesApproval, handleGetAllUsers, handleDeleteUser, handleEditUser, handleDeleteClass, handleGetSpecificUserProfile };