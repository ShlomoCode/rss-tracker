const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkVerification = require('../middlewares/checkVerification');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    getAllFeeds,
    getFeed,
    createFeed,
    deleteFeed
} = require('../controllers/feeds');

// for registers and login only:
router.post('/', checkLogin, checkVerification, createFeed);
router.get('/', checkLogin, checkVerification, getAllFeeds);
router.get('/:feedID', checkLogin, checkVerification, getFeed);
// for admin only:
router.delete('/:feedID', checkLogin, checkVerification, checkPermissions, deleteFeed);

module.exports = router;