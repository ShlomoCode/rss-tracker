const Feed = require('@models/feed');
const User = require('@models/user');

async function getStatistics (req, res) {
    const feedsCount = await Feed.countDocuments();
    const usersCount = await User.countDocuments();
    const feedsWithSubscribers = await Feed.find({ subscribers: { $exists: true, $not: { $size: 0 } } });
    const feedsSubscribersCount = feedsWithSubscribers.reduce((count, feed) => {
        return count + feed.subscribers.length;
    }, 0);

    res.status(200).json({
        usersCount,
        feedsCount,
        feedsSubscribersCount
    });
}

module.exports = {
    getStatistics
};