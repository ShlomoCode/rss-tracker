const express = require('express');
const router = express.Router();
const checkLogin = require('../middelwares/checkLogin');
const checkPermissions = require('../middelwares/checkPermissions');

const {
    signup,
    login,
    verifiEmail,
    deleteUser,
    unsubscribe,
    getUsers
} = require('../controllers/users');

router.get("/", checkPermissions, getUsers)
router.post("/signup", signup);
router.post("/login", login);
router.post("/delete/:userID", checkPermissions, deleteUser);
router.patch("/Unsubscribe/:userID", unsubscribe);
router.post("/verifi", checkLogin, verifiEmail);

module.exports = router;