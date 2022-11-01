const mongoose = require('mongoose');
const Feed = require('@models/feed');
const parseRss = require('@services/rss2json');
const { decode: decodeHtml } = require('html-entities');
const { makePublicFeedFromMongoObject } = require('@utils/dataUtils');

async function getAllFeeds (req, res) {
    const { _id: userId } = res.locals.user;

    const feeds = await Feed.find();
    if (!feeds.length) {
        return res.status(404).json({
            message: 'Feeds not found'
        });
    }

    const feedsFiltered = feeds.map((feed) => {
        return makePublicFeedFromMongoObject(feed, userId);
    });

    return res.status(200).json({
        feeds: feedsFiltered
    });
}
async function getFeed (req, res) {
    const feedID = req.params.feedID;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedID)) {
        return res.status(400).json({
            message: `${feedID} is not a valid feedID`
        });
    }

    const feed = await Feed.findById(feedID);
    if (!feed) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    res.status(200).json({
        feed: makePublicFeedFromMongoObject(feed, userId)
    });
}
async function createFeed (req, res) {
    let { url } = req.body;
    const { _id: userId } = res.locals.user;

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

    res.status(200).json({
        message: 'Feed created successfully',
        feed: makePublicFeedFromMongoObject(feedCreated, userId)
    });
}

module.exports = {
    getAllFeeds,
    getFeed,
    createFeed
};