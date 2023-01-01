const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkVerification = require('@middlewares/checkVerification');
const checkSchema = require('@middlewares/schema/feeds');

const {
    getAllFeeds,
    getFeed,
    createFeed
} = require('@controllers/feeds');

router.use(checkLogin);
router.use(checkVerification);

router.post('/', checkSchema.createFeed, createFeed);
router.get('/', getAllFeeds);
router.get('/:feedId', checkSchema.getFeed, getFeed);

module.exports = router;