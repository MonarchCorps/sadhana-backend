const { handleCreateAccount } = require('./createInstructorAccController')

const { handleEditInstructorProfile } = require('./editInstructorProfileController')

const { getAllInstructor } = require('./getAllInstructorController')

module.exports = { handleCreateAccount, handleEditInstructorProfile, getAllInstructor }