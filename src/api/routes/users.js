const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    signup,
    login,
    verifyEmail,
    deleteUser,
    unsubscribe,
    getUsers,
    getMyStatus
} = require('../controllers/users');

router.get('/', checkLogin, checkPermissions, getUsers);
router.post('/signup', signup);
router.post('/login', login);
router.post('/delete/:userID', checkLogin, checkPermissions, deleteUser);
router.patch('/unsubscribe/:userID', unsubscribe);
router.post('/verify', checkLogin, verifyEmail);
router.get('/My-status', checkLogin, getMyStatus);

module.exports = router;
