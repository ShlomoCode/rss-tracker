const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');

const {
    signup,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    resetPasswordConfirm,
    changePassword
} = require('../controllers/users');

router.post('/signup', signup);
router.post('/login', login);
router.post('/log-out', checkLogin, logout);
router.post('/verify', checkLogin, verifyEmail);
router.post('/resendVerificationEmail', checkLogin, resendVerificationEmail);
router.post('/reset-password', resetPassword);
router.post('/reset-password-confirm', resetPasswordConfirm);
router.post('/change-password', checkLogin, changePassword);

module.exports = router;