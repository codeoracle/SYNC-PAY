const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Route to request a password reset
router.post('/forgot-password', passwordResetController.forgotPassword);

// Route to handle password reset
router.post('/reset-password/:token', passwordResetController.resetPassword);

module.exports = router;
