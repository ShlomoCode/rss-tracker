const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkVerification = require('../middlewares/checkVerification');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    signup,
    login,
    logout,
    verifyEmail,
    deleteUser,
    getUsers,
    resendVerificationEmail
} = require('../controllers/users');

router.post('/signup', signup);
router.post('/login', login);
router.post('/log-out', checkLogin, logout);
router.post('/verify', checkLogin, verifyEmail);
router.post('/resendVerificationEmail', checkLogin, resendVerificationEmail);
router.get('/', checkLogin, checkVerification, checkPermissions, getUsers);
router.post('/delete/:userID', checkLogin, checkVerification, checkPermissions, deleteUser);

module.exports = router;