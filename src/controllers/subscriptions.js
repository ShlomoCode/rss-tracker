const Feed = require('@models/feed');
const mongoose = require('mongoose');
const { exposeFeed } = require('@/utils/exposes');

async function subscribeFeed (req, res) {
    const feedId = req.params.feedId;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        return res.status(400).json({
            message: `${feedId} is not a valid feedId`
        });
    }

    const userSubscribedFeedsCount = await Feed.count({ subscribers: userId });
    if (userSubscribedFeedsCount > (process.env.MAX_FEEDS_PER_USER)) {
        return res.status(429).json({
            message: `You have reached the maximum number of feeds for you account (limit currently set to ${process.env.MAX_FEEDS_PER_USER})`
        });
    }

    const feedSubscribe = await Feed.findByIdAndUpdate(feedId, { $addToSet: { subscribers: userId } });
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
        feed: exposeFeed(feedSubscribe, userId)
    });
}
async function unsubscribeFeed (req, res) {
    const feedId = req.params.feedId;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        return res.status(400).json({
            message: `${feedId} is not a valid feedId`
        });
    }

    const feedUnSubscribe = await Feed.findByIdAndUpdate(feedId, { $pull: { subscribers: userId } });
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
        feed: exposeFeed(feedUnSubscribe, userId)
    });
}

module.exports = {
    subscribeFeed,
    unsubscribeFeed
};