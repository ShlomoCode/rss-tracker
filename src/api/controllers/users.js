const mongoose = require('mongoose');
const User = require('../models/user');
const Feed = require('../models/feed');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
const sendMail = require('../../server/emails');

/**
 * @returns number random in 5 digit in string format
 */
function randomNumber () {
    const numberRandom = Math.floor((Math.random() * 5000), 0);
    return numberRandom.toString().padStart(5, Math.floor(Math.random() * 10 + 1)).toString();
}

/**
 * נרמול כתובת מייל - הסרת נקודות מיותרות, מה שאחרי הפלוס, וכדומה
 * לצורך וידוא שהמייל לא רשום כבר
 * @param {String} email כתובת המייל שהתקבלה מהמשתמש
 * @returns
 */
function normalizeEmail (email) {
    if (/g(oogle)?mail\.com|hotmail\.com|outlook\.com/.test(email)) {
        const emailRew = email.replace('googlemail', 'gmail');
        const emailParts = emailRew.split('@');
        let part1 = emailParts[0].replace(/.*\+/, '');
        if (/gmail\.com/.test(part1)) {
            part1 = part1.replaceAll('.', '');
        }
        return part1 + '@' + emailParts[1];
    } else {
        return email;
    }
}

module.exports = {
    signup: async (req, res) => {
        const { email, password, name } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'email parameter required'
            });
        }

        if (!password) {
            return res.status(400).json({
                message: 'password parameter required'
            });
        }

        if (!name) {
            return res.status(400).json({
                message: 'name parameter required'
            });
        }

        /**
         * normalize-email by regex
         */
        const emailProcessed = normalizeEmail(email);

        const weakness = zxcvbn(password);

        if (weakness.score < 1) {
            return res.status(400).json({
                message: 'Weak password',
                weakness: weakness.feedback
            });
        }

        let hash;
        try {
            hash = await bcrypt.hash(password, 10);
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        const users = await User.find({ emailProcessed });
        if (users.length > 0) {
            return res.status(409).json({
                message: 'Email exists'
            });
        }

        const verifyEmailCode = randomNumber();
        const userID = new mongoose.Types.ObjectId();

        const user = new User({
            _id: userID,
            password: hash,
            emailProcessed,
            emailFront: email,
            name,
            verifyEmailCode
        });

        try {
            await user.save();
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        try {
            const infoSend = await sendMail.verify(verifyEmailCode, email, name);
            console.log('Email sent: ' + infoSend.response);
            return res.status(200).json({
                message: 'User created and verification email sent'
            });
        } catch (error) {
            await User.findOneAndDelete({ emailProcessed });
            return res.status(500).json({
                message: 'User removed - An error sending the email verification',
                error
            });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'email parameter required'
            });
        }

        const emailProcessed = normalizeEmail(email);

        if (!password) {
            return res.status(400).json({
                message: 'password parameter required'
            });
        }
        const users = await User.find({ emailProcessed });
        if (users.length === 0) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }

        const [user] = users;

        bcrypt.compare(password, user.password, (error, result) => {
            if (error) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }

            if (result === true) {
                const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY, { expiresIn: '25 days' });
                return res.status(200).json({
                    message: 'Auth successful',
                    token
                });
            } else {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
        });
    },
    verifyEmail: async (req, res) => {
        let { verifyCode } = req.query;
        const { id: userID } = res.locals.user;

        if (!verifyCode) {
            return res.status(400).json({
                message: 'verifyCode parameter required'
            });
        }

        verifyCode = verifyCode.toString();

        if (verifyCode.length > 6 || /[0-9]{5,6}/.test(verifyCode) === false) {
            return res.status(400).json({
                message: `${verifyCode} is not a valid verifyCode`
            });
        }

        let user;
        try {
            user = await User.findById(userID);
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        if (!user) {
            return res.status(404).json({
                message: `User ${userID} is not found`
            });
        }

        if (verifyCode !== user.verifyEmailCode) {
            return res.status(401).json({
                message: 'verify failed - Wrong verification code'
            });
        }

        if (user.verifyEmailStatus === true) {
            return res.status(409).json({
                message: 'verify failed - Email already verified'
            });
        }

        if (verifyCode === user.verifyEmailCode) {
            try {
                await User.findByIdAndUpdate(userID, { verifyEmailStatus: true });
            } catch (error) {
                res.status(500).json({
                    error
                });
            }
        }

        return res.status(200).json({
            message: 'verify successful'
        });
    },
    unsubscribe: async (req, res) => {
        const { id: userID } = res.locals.user;
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
                message: `User ${userID} is not found`
            });
        }

        if (userUnsubscribe.verifyEmailStatus === false) {
            return res.status(409).json({
                message: `unsubscribe failed - Email ${userUnsubscribe.emailFront} already unsubscribed`
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
            message: `unsubscribe successful for Email ${userUnsubscribe.emailFront}`,
            feedsUnsubscribedCount
        });
    },
    deleteUser: async (req, res) => {
        const userID = req.params.userID;

        if (!userID) {
            return res.status(400).json({
                message: 'userID parameter required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({
                message: `userID ${userID} is not valid`
            });
        }

        let userDeleted;
        try {
            userDeleted = await User.findByIdAndDelete(userID);
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        if (!userDeleted) {
            return res.status(404).json({
                message: `User ${userID} is not found`
            });
        }

        // הסרת הסיסמה (ההאש שלה) מהפלט
        userDeleted.password = undefined;

        let unsubscribeFeedsCount;
        try {
            unsubscribeFeedsCount = (await Feed.updateMany({ Subscribers: userID }, { $pull: { Subscribers: userID } })).modifiedCount;
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        res.status(200).json({
            message: `userId ${userID} Deleted; Unsubscribed for ${unsubscribeFeedsCount} feeds.`,
            userDeleted,
            unsubscribeFeedsCount
        });
    },
    getUsers: async (req, res) => {
        let usersRew;
        try {
            usersRew = await User.find();
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        const users = usersRew.map((user) => {
            user.password = undefined;
            return user;
        });

        res.status(200).json({
            users
        });
    }
};
