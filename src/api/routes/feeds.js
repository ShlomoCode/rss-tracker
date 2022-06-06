const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkVerification = require('../middlewares/checkVerification');
const checkRequest = require('../middlewares/validations/feeds');

const {
    getAllFeeds,
    getFeed,
    createFeed
} = require('../controllers/feeds');

// for registers and login only:
router.post('/', checkLogin, checkVerification, checkRequest.createFeed, createFeed);
router.get('/', checkLogin, checkVerification, getAllFeeds);
router.get('/:feedID', checkLogin, checkVerification, checkRequest.getFeed, getFeed);

module.exports = router;