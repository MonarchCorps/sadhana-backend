const express = require('express')
const router = express.Router()
const customPhotoController = require('../controllers/customPhotoController')
const ROLES_LIST = require('../config/roles_list')
const verifyRoles = require('../middleWare/verifyRoles')

router.route('/')
    .post(verifyRoles(ROLES_LIST.Admin), customPhotoController.handleUploadCustomPhoto)
    .delete(verifyRoles(ROLES_LIST.Admin), customPhotoController.handleDeleteCustomPhoto);

router.get('/:limit', verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Instructor, ROLES_LIST.User), customPhotoController.handleGetCustomPhotos);
router.get('/single/:id', verifyRoles(ROLES_LIST.Instructor, ROLES_LIST.User), customPhotoController.handleGetSingleCustomPhoto)

module.exports = router