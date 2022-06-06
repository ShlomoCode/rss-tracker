const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkRequest = require('../middlewares/validations/users');

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

router.post('/signup', checkRequest.signup, signup);
router.post('/login', checkRequest.login, login);
router.post('/log-out', checkLogin, logout);
router.post('/verify', checkLogin, checkRequest.verifyEmail, verifyEmail);
router.post('/resendVerificationEmail', checkLogin, resendVerificationEmail);
router.post('/reset-password', checkRequest.resetPassword, resetPassword);
router.post('/reset-password-confirm', checkRequest.resetPasswordConfirm, resetPasswordConfirm);
router.post('/change-password', checkLogin, checkRequest.changePassword, changePassword);

module.exports = router;