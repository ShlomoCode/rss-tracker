const mongoose = require('mongoose');
const Feed = require('../models/feed');

module.exports = {
    getAllFeeds: async (req, res) => {
        const { userID } = res.locals.user;

        let feedsRew;

        try {
            feedsRew = await Feed.find();
        } catch (error) {
            res.status(500).json({
                error
            });
        }

        if (!feedsRew) {
            return res.status(406).json({
                message: 'No feeds found'
            });
        }

        const feeds = feedsRew.map((feed) => {
            const feedObject = feed.toObject();
            feedObject.subscriberSelf = feed.Subscribers.includes(userID);
            feedObject.Subscribers = feed.Subscribers.length;
            return feedObject;
        });

        res.status(200).json({
            feeds
        });
    },
    getFeed: async (req, res) => {
        const feedID = req.params.feedID;
        const { userID } = res.locals.user;

        if (mongoose.Types.ObjectId.isValid(feedID) !== true) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        let feedRew;

        try {
            feedRew = await Feed.findById(feedID);
        } catch (error) {
            res.status(500).json({
                error
            });
        }

        if (!feedRew) {
            return res.status(404).json({
                message: 'Feed Not Found'
            });
        }

        const feed = feedRew.toObject();
        // האם המשתמש המחובר מנוי לפיד
        feed.subscriberSelf = feed.Subscribers.includes(userID);
        // המרה בפלט של רשימת המנויים לפיד למספר המנויים לפיד
        feed.Subscribers = feed.Subscribers.length;

        res.status(200).json({
            feed
        });
    },
    createFeed: async (req, res) => {
        let { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: 'Error: url A parameter required!'
            });
        }

        // הסרת לוכסן מיותר בסוף
        url = url.replace(/^(https?:\/\/[\w-]+\.\w{2,6}\/.*feed)\/$/, '$1');

        const feeds = await Feed.find({ url });
        if (feeds.length > 0) {
            return res.status(409).json({
                message: 'Feed exists'
            });
        }

        const parseRss = require('../../server/rss2json');

        let feedContent;
        try {
            feedContent = await parseRss(url);
        } catch (error) {
            return res.status(400).json({
                message: `${url} Not Normal feed`
            });
        }

        const { title } = feedContent;

        const feed = new Feed({
            _id: new mongoose.Types.ObjectId(),
            title,
            url
        });
        try {
            await feed.save();
            res.status(200).json({
                message: 'Feed Crated'
            });
        } catch (error) {
            res.status(500).json({
                error
            });
        }
    },
    SubscribeFeed: async (req, res) => {
        const feedID = req.params.feedID;
        const { userID } = res.locals.user;

        if (mongoose.Types.ObjectId.isValid(feedID) !== true) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        let feedSubscribe;
        try {
            feedSubscribe = await Feed.findByIdAndUpdate(feedID, { $addToSet: { Subscribers: userID } });
        } catch (error) {
            res.status(500).json({
                error
            });
        }

        if (!feedSubscribe) {
            return res.status(404).json({
                message: 'Feed Not Found'
            });
        }

        if (feedSubscribe.Subscribers.includes(userID) === true) {
            return res.status(409).json({
                message: 'You are already a subscriber'
            });
        }

        res.status(200).json({
            message: 'Subscribe to feed done!'
        });
    },
    UnSubscribeFeed: async (req, res) => {
        const feedID = req.params.feedID;
        const { userID } = res.locals.user;

        if (mongoose.Types.ObjectId.isValid(feedID) !== true) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        let feedUnSubscribe;
        try {
            feedUnSubscribe = await Feed.findByIdAndUpdate(feedID, { $pull: { Subscribers: userID } });
        } catch (error) {
            res.status(500).json({
                error
            });
        }

        if (!feedUnSubscribe) {
            return res.status(404).json({
                message: 'Feed Not Found'
            });
        }

        if (feedUnSubscribe.Subscribers.includes(userID) === false) {
            return res.status(409).json({
                message: 'No subscription found'
            });
        }

        res.status(200).json({
            message: 'UnSubscribe to feed done!'
        });
    },
    deleteFeed: async (req, res) => {
        const feedID = req.params.feedID;

        if (mongoose.Types.ObjectId.isValid(feedID) !== true) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        const feed = await Feed.findById(feedID);

        if (!feed) {
            return res.status(404).json({
                message: 'Not Found Feed'
            });
        }

        if (res.locals.user.Permissions !== 'admin') {
            return res.status(403).json({
                message: 'No permission'
            });
        }

        try {
            await Feed.deleteOne({ _id: feedID });
            res.status(200).json({
                message: `Feed id: ${feedID} deleted.`
            });
        } catch (error) {
            res.status(500).json({
                error
            });
        }
    }
};
