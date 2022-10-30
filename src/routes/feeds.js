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

// login and verification users only
router.post('/', checkLogin, checkVerification, checkSchema.createFeed, createFeed);
router.get('/', checkLogin, checkVerification, getAllFeeds);
router.get('/:feedID', checkLogin, checkVerification, checkSchema.getFeed, getFeed);

module.exports = router;