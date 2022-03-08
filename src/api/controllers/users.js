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
    return numberRandom.toString().padStart(5, Math.floor(Math.random() * 10 + 1))
}

module.exports = {
    signup: (req, res) => {
        const { email, password, name } = req.body;
        const emailProcessed = normalizeEmail(email);

        const weakness = zxcvbn(password)

        if (weakness.score <= 2) {
            return res.status(400).json({
                message: "Weak password",
                weakness: weakness.feedback
            })
        }

        bcrypt.hash(password, 10, async (error, hesh) => {
            if (error) {
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

            const verifiEmailCode = randomNumber();

            const user = new User({
                _id: new mongoose.Types.ObjectId,
                password: hesh,
                emailProcessed,
                emailFront: email,
                name,
                verifiEmailCode
            });

            try {
                await user.save();
            } catch (error) {
                return res.status(500).json({
                    error
                })
            }

            try {
                await sendMail.verifi(verifiEmailCode, emailFront);
                return res.status(200).json({
                    user: "User created",
                    verifiEmail: "sent verification email"
                })
            } catch (error) {
                return res.status(500).json({
                    user: "User created",
                    verifiEmail: `Error sending verification email: ${error}`
                })
            }
        })
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
    verifiEmail: async (req, res) => {
        const { userID } = res.locals.user;
        let { verifiCode } = req.body;

        if (!verifiCode) {
            return res.status(400).json({
                message: "Error: verifiCode A parameter required"
            })
        }

        verifiCode = parseInt(verifiCode);

        if (verifiCode.toString().length !== 6 || /[0-9]{6}/.test(verifiCode) === false) {
            return res.status(400).json({
                message: `${verifiCode} is not verification code valid`
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

        if (verifiCode !== user.verifiEmailCode) {
            return res.status(401).json({
                message: "Verifi faild - Wrong verification code"
            })
        }

        if (user.verifiEmailStatus === true) {
            return res.status(409).json({
                message: 'User has already been verified'
            })
        }

        if (verifiCode === user.verifiEmailCode) {
            try {
                await User.findByIdAndUpdate(userID, { verifiEmailStatus: true })
                res.status(200).json({
                    message: 'Email verification completed'
                })
            } catch (error) {
                res.status(500).json({
                    error
                })
            }
        }
    }
}