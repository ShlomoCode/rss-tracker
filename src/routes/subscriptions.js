const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkVerification = require('@middlewares/checkVerification');
const checkSchema = require('@middlewares/schema/subscriptions');

const {
    unsubscribeFeed,
    subscribeFeed,
    unsubscribeAll
} = require('@controllers/subscriptions');

router.post('/unsubscribe-all', checkLogin, checkVerification, unsubscribeAll);
router.post('/:subscriptionId', checkLogin, checkVerification, checkSchema, subscribeFeed);
router.delete('/:subscriptionId', checkLogin, checkVerification, checkSchema, unsubscribeFeed);

module.exports = router;