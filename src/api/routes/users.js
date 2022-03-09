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
    getUsers
} = require('../controllers/users');

router.get("/", checkPermissions, getUsers)
router.post("/signup", signup);
router.post("/login", login);
router.post("/delete/:userID", checkPermissions, deleteUser);
router.patch("/Unsubscribe/:userID", unsubscribe);
router.post("/verify", checkLogin, verifyEmail);

module.exports = router;