const express = require('express');
const router = express.Router();
const checkLogin = require('../middelwares/checkLogin');

const {
    signup,
    login,
    verifiEmail
} = require('../controllers/users');

router.post("/signup", signup);
router.post("/login", login);
router.post("/verifi", checkLogin, verifiEmail);

module.exports = router;