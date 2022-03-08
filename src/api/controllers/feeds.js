const mongoose = require('mongoose');
const Feed = require('../models/feed');
const jwt = require('jsonwebtoken');
const config = require('../../../config.json');
const User = require('../models/user');

module.exports = {
    getAllFeeds: async (req, res) => {
        try {
            let feedsRew = await Feed.find()
            const feeds = feedsRew.map((feed) => {
                feed.Subscribers = feed.Subscribers.length;
                return feed;
            })
            res.status(200).json({
                feeds
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    getFeed: async (req, res) => {
        const feedID = req.params.feedID
        try {
            let feed = await Feed.findById(feedID)
            feed.Subscribers = feed.Subscribers.length;
            res.status(200).json({
                feed
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    createFeed: async (req, res) => {
        const token = req.headers.authorization.replace("Bearer ", "")
        const infoLogin = jwt.verify(token, config.JWT_KEY, { complete: true })
        const { email, id } = infoLogin.payload
        let { url } = req.body;
        // הסרת לוכסן מיותר בסוף
        url = url.replace(/^(https?:\/\/[\w-]+\.\w{2,6}\/.*feed)\/$/, "$1")

        if (!url) {
            return res.status(400).json({
                message: "Error: url A parameter required!"
            })
        }

        const feeds = await Feed.find({ url })
        if (feeds.length > 0) {
            return res.status(409).json({
                message: "Feed exists"
            })
        }

        const parse = require('../../rss2json');

        try {
            await parse(url)
        } catch (error) {
            return res.status(500).json({
                message: `${url} Not Normal feed`
            })
        }

        const feed = new Feed({
            _id: new mongoose.Types.ObjectId(),
            title,
            url,
            Subscribers: [email]
        })
        try {
            await feed.save()
            res.status(200).json({
                message: "Crated Feed"
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    updateFeed: async (req, res) => {
        const feedID = req.params.feedID;
        const token = req.headers.authorization.replace("Bearer ", "")
        const infoLogin = jwt.verify(token, config.JWT_KEY, { complete: true })
        const { id: userID } = infoLogin.payload

        const feed = await Feed.findById(feedID)
        if (!feed) {
            return res.status(404).json({
                message: "Feed Not Found"
            })
        }
        try {
            await Feed.findByIdAndUpdate(feedID, { $addToSet: { Subscribers: userID } })
            res.status(200).json({
                message: "Subscribe to feed done!",
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    // deleteFeed: async (req, res) => {
    //     const feedID = req.params.feedID
    //     const Feed = await Feed.findById(feedID)
    //     if (!Feed) {
    //         return res.status(404).json({
    //             message: "Not Found Feed"
    //         })
    //     }
    //     try {
    //         await Feed.remove({ _id: feedID })
    //         res.status(200).json({
    //             message: `Feed id: ${feedID} deleted.`
    //         })
    //     } catch (error) {
    //         res.status(500).json({
    //             error
    //         })
    //     }
    // }
}