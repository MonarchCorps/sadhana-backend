const express = require('express')
const router = express.Router()
const coursesController = require('../../controllers/courses/coursesController')
const instructorController = require('../../controllers/dashboard/instructor/instructorController')

router.get('/class', coursesController.handleGetAllClass)
router.get('/instructor/:userId/all-classes', coursesController.handleMyClass)
router.get('/instructor', instructorController.getAllInstructor)

module.exports = router;