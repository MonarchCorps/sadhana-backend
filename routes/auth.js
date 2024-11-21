const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController')
const loginLimiter = require('../middleWare/loginLimiter')

router.route('/')
    .post(loginLimiter, authController.handleLogin);

router.route('/refresh')
    .get(authController.handleRefreshToken)

router.route('/logout')
    .get(authController.handleLogout)

module.exports = router;