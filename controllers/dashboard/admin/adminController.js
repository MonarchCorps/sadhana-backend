
const { handleGetAllUsers } = require('./manageUsers')

const { handlePendingInstructor } = require('./manageUsers')

const { handlePendingClass } = require('./manageClasses')

const { handleInstructorApproval } = require('./manageUsers')

const { handleClassesApproval } = require('./manageClasses')

const { handleDeleteUser } = require('./manageUsers')

const { handleDeleteClass } = require('./manageClasses')

const { handleEditUser } = require('./editUserController')

const { handleGetSpecificUserProfile } = require('./getSpecificUserProfile')


module.exports = { handlePendingInstructor, handleInstructorApproval, handlePendingClass, handleClassesApproval, handleGetAllUsers, handleDeleteUser, handleEditUser, handleDeleteClass, handleGetSpecificUserProfile };