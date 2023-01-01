const mongoose = require('mongoose');
const Feed = require('@models/feed');
const parseRss = require('@/services/parseRss');
const { decode: decodeHtml } = require('html-entities');
const { exposeFeed } = require('@/utils/exposes');

async function getAllFeeds (req, res) {
    const { _id: userId } = res.locals.user;

    const feeds = await Feed.find();

    return res.status(200).json({
        feeds: feeds.map((feed) => exposeFeed(feed, userId))
    });
}
async function getFeed (req, res) {
    const feedId = req.params.feedId;
    const { _id: userId } = res.locals.user;

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
        return res.status(400).json({
            message: `${feedId} is not a valid feedId`
        });
    }

    const feed = await Feed.findById(feedId);
    if (!feed) {
        return res.status(404).json({
            message: 'Feed Not Found'
        });
    }

    res.status(200).json({
        feed: exposeFeed(feed, userId)
    });
}
async function createFeed (req, res) {
    let { url } = req.body;
    const { _id: userId } = res.locals.user;

    const domainsAllowed = (process.env.ALLOWED_DOMAINS || []);
    const feedDomain = new URL(url).host;

    if (domainsAllowed.length && !domainsAllowed.includes(feedDomain)) {
        return res.status(400).json({
            message: `Domain ${feedDomain} is not allowed`
        });
    }

    // הסרת לוכסן מיותר בסוף
    url = url.replace(/\/$/, '');

    const feeds = await Feed.find({ url });
    if (feeds.length) {
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
        title: feedTitle,
        url
    });

    res.status(200).json({
        message: 'Feed created successfully',
        feed: exposeFeed(feedCreated, userId)
    });
}

module.exports = {
    getAllFeeds,
    getFeed,
    createFeed
};