const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
const config = require('../../../config.json');
const sendMail = require('../../emails');
const normalizeEmail = require('normalize-email');

function randomNumber() {
    const numberRandom = Math.floor((Math.random() * 5000), 0)
    return numberRandom.toString().padStart(5, Math.floor(Math.random() * 10 + 1)).toString()
}

module.exports = {
    signup: async (req, res) => {
        const { email, password, name } = req.body;
        const emailProcessed = normalizeEmail(email);

        const weakness = zxcvbn(password)

        if (weakness.score <= 2) {
            return res.status(400).json({
                message: "Weak password",
                weakness: weakness.feedback
            })
        }

        let hash;
        try {
            hash = await bcrypt.hash(password, 10)
        } catch (error) {
            return res.status(500).json({
                error
            })
        }

        const users = await User.find({ emailProcessed })
        if (users.length > 0) {
            return res.status(409).json({
                message: "Email exists"
            })
        }

        const verifyEmailCode = randomNumber();

        const user = new User({
            _id: new mongoose.Types.ObjectId,
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
            })
        }

        try {
            const infoSend = await sendMail.verify(verifyEmailCode, email);
            console.log('Email sent: ' + infoSend.response)
            return res.status(200).json({
                message: 'User created and verifycation email sent'
            })
        } catch (error) {
            await User.findOneAndDelete({ emailProcessed });
            return res.status(500).json({
                "User removed - An error sending the email verifycation": error
            })
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        const emailProcessed = normalizeEmail(email);

        if (!email) {
            return res.status(400).json({
                message: 'Email parameter required'
            })
        }

        if (!password) {
            return res.status(400).json({
                message: 'Password parameter required'
            })
        }

        const users = await User.find({ emailProcessed })
        if (users.length === 0) {
            return res.status(401).json({
                message: "Auth faild"
            })
        }

        const [user] = users;

        bcrypt.compare(password, user.password, (error, result) => {
            if (error) {
                return res.status(401).json({
                    message: "Auth faild"
                })
            }

            if (result === true) {
                const token = jwt.sign(
                    { id: user._id, email: user.email },
                    config.JWT_KEY,
                    { expiresIn: "2H" })

                return res.status(200).json({
                    message: "Auth succeful",
                    token
                })
            } else {
                return res.status(401).json({
                    message: "Auth faild"
                })
            }
        })
    },
    verifyEmail: async (req, res) => {
        const { userID } = res.locals.user;
        let { verifyCode } = req.body;
        verifyCode = verifyCode.toString()

        if (!verifyCode) {
            return res.status(400).json({
                message: "Error: verifyCode A parameter required"
            })
        }

        if (verifyCode.length > 6 || /[0-9]{5,6}/.test(verifyCode) === false) {
            return res.status(400).json({
                message: `${verifyCode} is not verifycation code valid`
            })
        }

        let user;
        try {
            user = await User.findById(userID);
        } catch (error) {
            return res.status(500).json({
                error
            })
        }

        if (!user) {
            return res.status(406).json({
                message: 'Please login again'
            })
        }

        if (verifyCode !== user.verifyEmailCode) {
            return res.status(401).json({
                message: "verify faild - Wrong verifycation code"
            })
        }

        if (user.verifyEmailStatus === true) {
            return res.status(409).json({
                message: 'User has already been verifyed'
            })
        }

        if (verifyCode === user.verifyEmailCode) {
            try {
                await User.findByIdAndUpdate(userID, { verifyEmailStatus: true })
                res.status(200).json({
                    message: 'Email verifycation completed'
                })
            } catch (error) {
                res.status(500).json({
                    error
                })
            }
        }
    },
    deleteUser: async (req, res) => {
        const userID = req.params.userID

        if (!userID) {
            return res.status(400).json({
                message: "userID A required parameter"
            })
        }


        if (mongoose.Types.ObjectId.isValid(userID) !== true) {
            return res.status(400).json({
                message: `${userID} no ObjectId Valid!`
            })
        }

        if (res.locals.user.Permissions !== 'admin') {
            return res.status(403).json({
                message: 'No permission'
            })
        }

        let userDeleted;

        try {
            userDeleted = await User.findByIdAndDelete(userID);
        } catch (error) {
            return res.status(500).json({
                error
            })
        }

        if (!userDeleted) {
            return res.status(404).json({
                message: `User ${userID} Not Found`
            })
        }

        // הסרת הסיסמה (ההאש שלה) מהפלט
        userDeleted.password = undefined;

        res.status(200).json({
            message: `userId ${userID} Deleted`,
            info: userDeleted
        })
    },
    getUsers: async (req, res) => {
        if (res.locals.user.Permissions !== 'admin') {
            return res.status(403).json({
                message: 'No permission'
            })
        }

        let usersRew;
        try {
            usersRew = await User.find()
        } catch (error) {
            return res.status(500).json({
                error
            })
        }

        const users = usersRew.map((user) => {
            user.password = undefined;
            return user;
        })

        res.status(200).json({
            users
        })
    },
    unsubscribe: async (req, res) => {
        const userID = req.params.userID;

        if (!userID) {
            return res.status(400).json({
                message: "userID A required parameter"
            })
        }

        if (mongoose.Types.ObjectId.isValid(userID) !== true) {
            return res.status(400).json({
                message: `${userID} is not userID valid`
            })
        }

        let userUnsubscribe;
        try {
            userUnsubscribe = await User.findByIdAndUpdate(userID, { verifyEmailStatus: false })
        } catch (error) {
            return res.status(500).json({
                error
            })
        }

        if (!userUnsubscribe) {
            return res.status(404).json({
                message: `User ${userID} Not Found`
            })
        }

        if (userUnsubscribe.verifyEmailStatus === false){
            return res.status(409).json({
                message: `The subscription of ${userUnsubscribe.emailFront} has already been canceled!`
            })
        }

        res.status(200).json({
            message: `Unsubscribe from ${userUnsubscribe.emailFront} has been successfully completed`
        })
    }
}