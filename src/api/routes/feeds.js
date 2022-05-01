const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    getAllFeeds,
    getFeed,
    createFeed,
    deleteFeed
} = require('../controllers/feeds');

// for registers and login only:
router.post('/', checkLogin, createFeed);
router.get('/', checkLogin, getAllFeeds);
router.get('/:feedID', checkLogin, getFeed);
// for admin only:
router.delete('/:feedID', checkLogin, checkPermissions, deleteFeed);

module.exports = router;