const express = require('express')
const router = express.Router()
const checkAuth = require('../middelwares/checkAuth');

const {
    getAllFeeds,
    getFeed,
    createFeed,
    updateFeed,
    deleteFeed
} = require('../controllers/feeds')

router.get("/", getAllFeeds);
router.get("/:FeedID", getFeed)

router.post("/", checkAuth, createFeed);
router.patch("/:FeedID", checkAuth, updateFeed);
router.delete("/:FeedID", checkAuth, deleteFeed);

module.exports = router;