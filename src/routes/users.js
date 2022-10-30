const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkSchema = require('@middlewares/schema/users');

const {
    signup,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    resetPasswordConfirm,
    changePassword
} = require('@controllers/users');

router.post('/signup', checkSchema.signup, signup);
router.post('/login', checkSchema.login, login);
router.post('/logout', checkLogin, logout);
router.post('/verify', checkLogin, checkSchema.verifyEmail, verifyEmail);
router.post('/resendVerificationEmail', checkLogin, resendVerificationEmail);
router.post('/reset-password', checkSchema.resetPassword, resetPassword);
router.post('/reset-password-confirm', checkSchema.resetPasswordConfirm, resetPasswordConfirm);
router.post('/change-password', checkLogin, checkSchema.changePassword, changePassword);

module.exports = router;