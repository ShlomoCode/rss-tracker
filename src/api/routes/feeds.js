const express = require('express')
const router = express.Router()
const checkLogin = require('../middlewares/checkLogin');
const checkPermissions = require('../middlewares/checkPermissions');

const {
    getAllFeeds,
    getFeed,
    createFeed,
    UnSubscribeFeed,
    SubscribeFeed,
    deleteFeed
} = require('../controllers/feeds');

// for registers and login only:
router.get("/", checkLogin, getAllFeeds);
router.get("/:feedID", checkLogin, getFeed)
router.post("/", checkLogin, createFeed);
router.post("/Subscribe/:feedID", checkLogin, SubscribeFeed);
router.delete("/Subscribe/:feedID", checkLogin, UnSubscribeFeed);
// for admin only:
router.delete("/:feedID", checkPermissions, deleteFeed);

module.exports = router;