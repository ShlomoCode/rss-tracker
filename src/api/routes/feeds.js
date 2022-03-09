const express = require('express')
const router = express.Router()
const checkLogin = require('../middelwares/checkLogin');
const checkPermissions = require('../middelwares/checkPermissions');

const {
    getAllFeeds,
    getFeed,
    createFeed,
    updateFeed,
    deleteFeed
} = require('../controllers/feeds');

// for registerd login only:
router.get("/", checkLogin, getAllFeeds);
router.get("/:feedID", checkLogin, getFeed)
router.post("/", checkLogin, createFeed);
router.patch("/:feedID", checkLogin, updateFeed);
// for admin only:
router.delete("/:feedID", checkPermissions, deleteFeed);

module.exports = router;