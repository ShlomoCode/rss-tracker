const express = require('express');
const router = express.Router();
const checkLogin = require('@middlewares/checkLogin');
const checkVerification = require('@middlewares/checkVerification');
const checkSchema = require('@middlewares/schema/subscriptions');

const {
    unsubscribeFeed,
    subscribeFeed
} = require('@controllers/subscriptions');

router.use(checkLogin);
router.use(checkVerification);
router.use(checkSchema);

router.post('/:feedId', subscribeFeed);
router.delete('/:feedId', unsubscribeFeed);

module.exports = router;