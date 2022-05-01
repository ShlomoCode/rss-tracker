const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');

const {
    unsubscribeFeed,
    subscribeFeed,
    unsubscribeAll
} = require('../controllers/subscriptions');

router.post('/unsubscribe-all', checkLogin, unsubscribeAll);
router.post('/:subscriptionId', checkLogin, subscribeFeed);
router.delete('/:subscriptionId', checkLogin, unsubscribeFeed);

module.exports = router;