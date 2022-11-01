const User = require('@models/user');
const Feed = require('@models/feed');
const mongoose = require('mongoose');
const { makePublicFeedFromMongoObject } = require('@utils/dataUtils');

async function unsubscribeAll (req, res) {
    const { _id: userId } = res.locals.user;
    const userUnsubscribe = await User.findById(userId);
    if (!userUnsubscribe) {
        return res.status(404).send({
            success: false,
            message: 'User not found'
        });
    }

    const feedsUnsubscribedCount = (await Feed.updateMany({ subscribers: userId }, { $pull: { subscribers: userId } })).modifiedCount;

    res.status(200).json({
        message: `${feedsUnsubscribedCount} feeds were unsubscribed`,
        feedsUnsubscribedCount
    });
}
async function subscribeFeed (req, res) {
    const feedID = req.params.subscriptionId;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedID)) {
        return res.status(400).json({
            message: `${feedID} is not a valid feedID`
        });
    }

    const userSubscribedFeedsCount = await Feed.count({ subscribers: userId });
    if (userSubscribedFeedsCount >= (process.env.MAX_FEEDS_PER_USER)) {
        return res.status(429).json({
            message: `You have reached the maximum number of feeds for you account (limit currently set to ${process.env.MAX_FEEDS_PER_USER})`
        });
    }

    const feedSubscribe = await Feed.findByIdAndUpdate(feedID, { $addToSet: { subscribers: userId } });
    if (!feedSubscribe) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    if (feedSubscribe.subscribers.includes(userId)) {
        return res.status(409).json({
            message: 'You are already a subscriber'
        });
    }

    res.status(200).json({
        message: 'Subscribe to feed done!',
        feed: makePublicFeedFromMongoObject(feedSubscribe, userId)
    });
}
async function unsubscribeFeed (req, res) {
    const feedID = req.params.subscriptionId;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedID)) {
        return res.status(400).json({
            message: `${feedID} is not a valid feedID`
        });
    }

    const feedUnSubscribe = await Feed.findByIdAndUpdate(feedID, { $pull: { subscribers: userId } });
    if (!feedUnSubscribe) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    if (!feedUnSubscribe.subscribers.includes(userId)) {
        return res.status(409).json({
            message: 'You are not a subscriber'
        });
    }

    res.status(200).json({
        message: 'Unsubscribe done successfully!',
        feed: makePublicFeedFromMongoObject(feedUnSubscribe, userId)
    });
}

module.exports = {
    subscribeFeed,
    unsubscribeFeed,
    unsubscribeAll
};