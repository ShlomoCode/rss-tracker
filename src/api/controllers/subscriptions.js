const User = require('@/models/user');
const Feed = require('@/models/feed');
const mongoose = require('mongoose');

async function unsubscribeAll (req, res) {
    const { _id: userID } = res.locals.user;
    const userUnsubscribe = await User.findById(userID);
    if (!userUnsubscribe) {
        return res.status(404).send({
            success: false,
            message: 'User not found'
        });
    }

    const feedsUnsubscribedCount = (await Feed.updateMany({ Subscribers: userID }, { $pull: { Subscribers: userID } })).modifiedCount;

    res.status(200).json({
        message: `${feedsUnsubscribedCount} feeds were unsubscribed`,
        feedsUnsubscribedCount
    });
}
async function subscribeFeed (req, res) {
    const feedID = req.params.subscriptionId;
    const { _id: userID } = res.locals.user;

    // אם המזהה פיד לא חוקי
    if (!mongoose.Types.ObjectId.isValid(feedID)) {
        return res.status(400).json({
            message: `${feedID} is not a valid feedID`
        });
    }

    /**
         * ודא שהמייל של המשתמש מאומת
         */
    const user = await User.findById(userID);
    // אם היוזר לא נמצא
    if (!user) {
        return res.status(404).json({
            message: `userID ${userID} Not Found`
        });
    }
    // אם המייל לא מאומת
    if (!user.verified) {
        return res.status(403).json({
            message: 'Email not verified'
        });
    }

    // בדוק מגבלת פידים פר יוזר
    const userSubscribedFeedsCount = await Feed.count({ Subscribers: userID });
    if (userSubscribedFeedsCount >= (process.env.MAX_FEEDS_PER_USER)) {
        return res.status(429).json({
            message: `You have reached the maximum number of feeds for you account (limit currently set to ${process.env.MAX_FEEDS_PER_USER})`
        });
    }

    // ההרשמה בפועל
    const feedSubscribe = await Feed.findByIdAndUpdate(feedID, { $addToSet: { Subscribers: userID } });
    if (!feedSubscribe) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    if (feedSubscribe.Subscribers.includes(userID)) {
        return res.status(409).json({
            message: 'You are already a subscriber'
        });
    }

    res.status(200).json({
        message: 'Subscribe to feed done!'
    });
}
async function unsubscribeFeed (req, res) {
    const feedID = req.params.subscriptionId;
    const { _id: userID } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedID)) {
        return res.status(400).json({
            message: `${feedID} is not a valid feedID`
        });
    }

    const feedUnSubscribe = await Feed.findByIdAndUpdate(feedID, { $pull: { Subscribers: userID } });
    if (!feedUnSubscribe) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    if (!feedUnSubscribe.Subscribers.includes(userID)) {
        return res.status(409).json({
            message: 'You are not a subscriber'
        });
    }

    res.status(200).json({
        message: 'Unsubscribe done successfully!'
    });
}

module.exports = {
    subscribeFeed,
    unsubscribeFeed,
    unsubscribeAll
};