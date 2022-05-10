const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkVerification = require('../middlewares/checkVerification');

const {
    getAllFeeds,
    getFeed,
    createFeed
} = require('../controllers/feeds');

// for registers and login only:
router.post('/', checkLogin, checkVerification, createFeed);
router.get('/', checkLogin, checkVerification, getAllFeeds);
router.get('/:feedID', checkLogin, checkVerification, getFeed);

module.exports = router;