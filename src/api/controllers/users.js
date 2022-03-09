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

        const verifiEmailCode = randomNumber();

        const user = new User({
            _id: new mongoose.Types.ObjectId,
            password: hash,
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
            const infoSend = await sendMail.verifi(verifiEmailCode, email);
            console.log('Email sent: ' + infoSend.response)
            return res.status(200).json({
                message: 'User created and verification email sent'
            })
        } catch (error) {
            await User.findOneAndDelete({ emailProcessed });
            return res.status(500).json({
                "User removed - An error sending the email Verification": error
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
    verifiEmail: async (req, res) => {
        const { userID } = res.locals.user;
        const { verifiCode } = req.body;

        if (!verifiCode) {
            return res.status(400).json({
                message: "Error: verifiCode A parameter required"
            })
        }

        if (verifiCode.length > 6 || /[0-9]{5,6}/.test(verifiCode) === false) {
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

        if (!user) {
            return res.status(406).json({
                message: 'Please login again'
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