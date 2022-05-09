const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const checkVerification = require('../middlewares/checkVerification');

const {
    unsubscribeFeed,
    subscribeFeed,
    unsubscribeAll
} = require('../controllers/subscriptions');

router.post('/unsubscribe-all', checkLogin, checkVerification, unsubscribeAll);
router.post('/:subscriptionId', checkLogin, checkVerification, subscribeFeed);
router.delete('/:subscriptionId', checkLogin, checkVerification, unsubscribeFeed);

module.exports = router;