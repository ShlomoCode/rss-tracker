const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
const config = require('../../../config.json');
const sendMail = require('../../emails');

function randomNumber() {
    const numberRandom = Math.floor((Math.random() * 5000), 0)
    return numberRandom.toString().padStart(5, Math.floor(Math.random() * 10 + 1))
}

module.exports = {
    signup: (req, res) => {
        const { email, password, name } = req.body;

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

            const emailParts = email.split('@');
            const processedEmail = emailParts[0].replace(/.*\+/, "").replaceAll('.', '') + '@' + emailParts[1];

            const users = await User.find({ email: processedEmail })
            if (users.length > 0) {
                return res.status(409).json({
                    message: "Email exists"
                })
            }

            const verifiEmailCode = randomNumber();

            const user = new User({
                _id: new mongoose.Types.ObjectId,
                password: hesh,
                email: processedEmail,
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
                await sendMail.verifi(verifiEmailCode, email);
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

        const users = await User.find({ email })
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
    }
}