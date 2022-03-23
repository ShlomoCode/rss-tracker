const mongoose = require('mongoose');
const Feed = require('../models/feed');
const parseRss = require('../../server/rss2json');
const { decode: decodeHtml } = require('html-entities');

module.exports = {
    getAllFeeds: async(req, res) => {
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
    getFeed: async(req, res) => {
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
    createFeed: async(req, res) => {
        let { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: 'Error: url A parameter required!'
            });
        }

        const listFull = process.env.White_list_including_images?.replaceAll('.', '\.') || '.';
        const listPartial = process.env.White_list_does_not_include_images?.replaceAll('.', '\.') || '.';

        const regexWhiteList = new RegExp(`^https?:\/\/(www\.)?(${listFull}|${listPartial})`);

        if (!regexWhiteList.test(url)) {
            return res.status(500).json({
                message: 'This site is not whitelisted'
            });
        }

        // הסרת לוכסן מיותר בסוף
        url = url.replace(/\/$/, '');

        const feeds = await Feed.find({ url });

        if (feeds.length !== 0) {
            return res.status(409).json({
                message: 'Feed exists'
            });
        }

        let feedTitle;
        try {
            const feedContent = await parseRss(url);
            feedTitle = decodeHtml(feedContent.title);
        } catch (error) {
            return res.status(400).json({
                message: `${url} Not Normal feed`
            });
        }

        const feed = new Feed({
            _id: new mongoose.Types.ObjectId(),
            title: feedTitle,
            url
        });

        let feedCreated;
        try {
            feedCreated = await feed.save();
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        res.status(200).json({
            message: 'Feed Crated',
            feed: feedCreated
        });
    },
    SubscribeFeed: async(req, res) => {
        const feedID = req.params.feedID;
        const { userID } = res.locals.user;

        if (mongoose.Types.ObjectId.isValid(feedID) !== true) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        const userSubscribedFeedsCount = await Feed.count({ Subscribers: userID });

        if (userSubscribedFeedsCount >= (process.env.countMaxFeedsForUser || 10)) {
            return res.status(429).json({
                message: `Each user is allowed to register for up to ${process.env.countMaxFeedsForUser || 10} feeds`
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
    UnSubscribeFeed: async(req, res) => {
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
            return res.status(500).json({
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
    deleteFeed: async(req, res) => {
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
