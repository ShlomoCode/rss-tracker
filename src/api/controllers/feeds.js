const mongoose = require('mongoose');
const Feed = require('@/models/feed');
const parseRss = require('@services/rss2json');
const { decode: decodeHtml } = require('html-entities');

module.exports = {
    getAllFeeds: async (req, res) => {
        const { _id: userID } = res.locals.user;

        const feedsRew = await Feed.find();
        if (!feedsRew) {
            return res.status(404).json({
                message: 'Feeds not found'
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
        const { _id: userID } = res.locals.user;

        if (!mongoose.Types.ObjectId.isValid(feedID)) {
            return res.status(400).json({
                message: `${feedID} is not a valid feedID`
            });
        }

        const feedRew = await Feed.findById(feedID);
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

        const listFull = process.env.ALLOWED_DOMAINS_WITH_IMAGES?.replaceAll('.', '.') || '.';
        const listPartial = process.env.ALLOWED_DOMAINS_NO_IMAGES?.replaceAll('.', '.') || '.';

        const regexWhiteList = new RegExp(`^https?://(www.)?(${listFull}|${listPartial})`);

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
                message: 'This feed already exists'
            });
        }

        let feedTitle;
        try {
            const feedContent = await parseRss(url);
            feedTitle = decodeHtml(feedContent.title);
        } catch (error) {
            return res.status(400).json({
                message: 'Valid RSS feed not found'
            });
        }

        if (/תגובות לפוסט:/.test(feedTitle)) {
            return res.status(400).json({ message: 'This url is a comment feed' });
        }

        const feedCreated = await Feed.create({
            _id: new mongoose.Types.ObjectId(),
            title: feedTitle,
            url
        });

        feedCreated.Subscribers = 0;
        res.status(200).json({
            message: 'Feed created successfully',
            feedCreated
        });
    }
};
