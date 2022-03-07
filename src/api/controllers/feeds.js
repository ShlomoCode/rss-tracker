const mongoose = require('mongoose');
const Feed = require('../models/feed');

module.exports = {
    getAllFeeds: async (req, res) => {
        try {
            let Feeds = await Feed.find()
            res.status(200).json({
                Feeds
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    getFeed: async (req, res) => {
        const FeedID = req.params.FeedID
        try {
            const Feed = await Feed.findById(FeedID)
            res.status(200).json({
                Feed
            })
        } catch (error) {
            res.status(500).json({
                error
            })
        }
    },
    createFeed: async (req, res) => {
        const { url } = req.body;

        if (!url){
            return res.status(500).json({
                message: "Error: url A parameter required!"
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

        // if (typeof title !== 'string') {
        //     return res.status(500).json({
        //         message: `${url} Not Normal feed`
        //     })
        // }

        const feed = new Feed({
            _id: new mongoose.Types.ObjectId(),
            title
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
    // updateFeed: async (req, res) => {
    //     const FeedID = req.params.FeedID
    //     const { categoryID } = req.body;

    //     const Feed = await Feed.findById(FeedID)
    //     if (!Feed) {
    //         return res.status(404).json({
    //             message: "Not Found Feed"
    //         })
    //     }

    //     if (categoryID) {
    //         const category = await Category.findById(categoryID)

    //         if (!category) {
    //             return res.status(404).json({
    //                 message: "Not Found Category"
    //             })
    //         }
    //     }
    //     try {
    //         await Feed.updateOne({ _id: FeedID }, req.body)
    //         res.status(200).json({
    //             message: "Feed updated"
    //         })
    //     } catch (error) {
    //         res.status(500).json({
    //             error
    //         })
    //     }
    // },
    // deleteFeed: async (req, res) => {
    //     const FeedID = req.params.FeedID
    //     const Feed = await Feed.findById(FeedID)
    //     if (!Feed) {
    //         return res.status(404).json({
    //             message: "Not Found Feed"
    //         })
    //     }
    //     try {
    //         await Feed.remove({ _id: FeedID })
    //         res.status(200).json({
    //             message: `Feed id: ${FeedID} deleted.`
    //         })
    //     } catch (error) {
    //         res.status(500).json({
    //             error
    //         })
    //     }
    // }
}