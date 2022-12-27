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
    forgotPassword,
    changePassword,
    getSettings,
    updateSettings
} = require('@controllers/users');

router.post('/signup', checkSchema.signup, signup);
router.post('/login', checkSchema.login, login);
router.post('/logout', checkLogin, logout);
router.post('/verify', checkLogin, checkSchema.verifyEmail, verifyEmail);
router.post('/send-verification-email', checkLogin, resendVerificationEmail);
router.post('/forgot-password', checkSchema.forgotPassword, forgotPassword);
router.post('/change-password', checkSchema.changePassword, changePassword);
router.get('/settings', checkLogin, getSettings);
router.put('/settings', checkLogin, updateSettings);

module.exports = router;