const mongoose = require('mongoose');
const Feed = require('../models/feed');
const parseRss = require('../../server/rss2json');
const { decode: decodeHtml } = require('html-entities');

module.exports = {
    getAllFeeds: async (req, res) => {
        const { id: userID } = res.locals.user;

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
        const { id: userID } = res.locals.user;

        if (!mongoose.Types.ObjectId.isValid(feedID)) {
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
                message: 'url is required'
            });
        }

        const listFull = process.env.White_list_including_images?.replaceAll('.', '\.') || '.';
        const listPartial = process.env.White_list_does_not_include_images?.replaceAll('.', '\.') || '.';

        const regexWhiteList = new RegExp(`^https?:\/\/(www\.)?(${listFull}|${listPartial})`);

        if (!regexWhiteList.test(url)) {
            return res.status(400).json({
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

        if (/תגובות לפוסט:/.test(feedTitle)) {
            return res.status(400).json({ message: 'This is a comment feed, not feed...' });
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

        feedCreated.Subscribers = 0;

        res.status(200).json({
            message: 'Feed Crated',
            feed: feedCreated
        });
    },
    deleteFeed: async (req, res) => {
        const feedID = req.params.feedID;

        if (!mongoose.Types.ObjectId.isValid(feedID)) {
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
