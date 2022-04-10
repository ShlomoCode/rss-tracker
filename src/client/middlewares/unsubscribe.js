const mongoose = require('mongoose');
const User = require('../../api/models/user');

async function Unsubscribe (req, res, next) {
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({
            message: 'userID A required parameter'
        });
    }

    if (mongoose.Types.ObjectId.isValid(userID) !== true) {
        return res.status(400).json({
            message: `${userID} is not userID valid`
        });
    }

    let userUnsubscribe;
    try {
        userUnsubscribe = await User.findByIdAndUpdate(userID, { verifyEmailStatus: false });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

    if (!userUnsubscribe) {
        return res.status(404).json({
            message: `User ${userID} Not Found`
        });
    }

    if (userUnsubscribe.verifyEmailStatus === false) {
        return res.status(409).json({
            message: `The subscription of ${userUnsubscribe.emailFront} has already been canceled!`
        });
    }

    // res.status(200).json({
    //     message: `Unsubscribe from ${userUnsubscribe.emailFront} has been successfully completed`
    // });
    // const userID = req.originalUrl.replace('/', '');

    next();
};

module.exports = Unsubscribe;
