const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    signup,
    login,
    verifyEmail,
    deleteUser,
    getUsers,
    resendVerificationEmail
} = require('../controllers/users');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', checkLogin, verifyEmail);
router.post('/resendVerificationEmail', checkLogin, resendVerificationEmail);
router.get('/', checkLogin, checkPermissions, getUsers);
router.post('/delete/:userID', checkLogin, checkPermissions, deleteUser);

module.exports = router;