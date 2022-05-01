const User = require('../models/user');
const Feed = require('../models/feed');
const mongoose = require('mongoose');

module.exports = {
    unsubscribeAll: async (req, res) => {
        const { id: userID } = res.locals.user;
        try {
            const userUnsubscribe = await User.findById(userID);
            if (!userUnsubscribe) {
                return res.status(404).send({
                    success: false,
                    message: 'User not found.'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        let feedsUnsubscribedCount;
        try {
            feedsUnsubscribedCount = (await Feed.updateMany({ Subscribers: userID }, { $pull: { Subscribers: userID } })).modifiedCount;
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        res.status(200).json({
            message: `${feedsUnsubscribedCount} feeds were unsubscribed.`,
            feedsUnsubscribedCount
        });
    },
    subscribeFeed: async (req, res) => {
        const feedID = req.params.subscriptionId;
        const { id: userID } = res.locals.user;

        // אם המזהה פיד לא חוקי
        if (!mongoose.Types.ObjectId.isValid(feedID)) {
            return res.status(400).json({
                message: `${feedID} no feedID Valid!`
            });
        }

        /**
         * ודא שהמייל של המשתמש מאומת
         */
        let user;
        try {
            user = await User.findById(userID);
        } catch (error) {
            return res.status(500).json({
                error
            });
        }
        // אם היוזר לא נמצא
        if (!user) {
            return res.status(404).json({
                message: `userID ${userID} Not Found`
            });
        }
        // אם המייל לא מאומת
        if (!user.verifyEmailStatus) {
            return res.status(403).json({
                message: 'Email not verified'
            });
        }

        // בדוק מגבלת פידים פר יוזר
        let userSubscribedFeedsCount;
        try {
            userSubscribedFeedsCount = await Feed.count({ Subscribers: userID });
        } catch (error) {
            return res.status(500).json({
                error
            });
        }
        if (userSubscribedFeedsCount >= (process.env.countMaxFeedsForUser || 10)) {
            return res.status(429).json({
                message: `Each user is allowed to register for up to ${process.env.countMaxFeedsForUser || 10} feeds`
            });
        }

        // ההרשמה בפועל
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
    unsubscribeFeed: async (req, res) => {
        const feedID = req.params.subscriptionId;
        const { id: userID } = res.locals.user;

        if (!mongoose.Types.ObjectId.isValid(feedID)) {
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

        if (!feedUnSubscribe.Subscribers.includes(userID)) {
            return res.status(409).json({
                message: 'No subscription found'
            });
        }

        res.status(200).json({
            message: 'UnSubscribe to feed done!'
        });
    }
};