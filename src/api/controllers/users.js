const mongoose = require('mongoose');
const User = require('../models/user');
const Session = require('../models/session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
const ms = require('ms');
const { validate: emailValidator } = require('deep-email-validator');
const sendMail = require('../../server/emails/send');

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

        const validateEmail = await emailValidator({
            email: emailProcessed,
            validateRegex: true,
            validateMx: true,
            validateTypo: false,
            validateDisposable: true,
            validateSMTP: false
        });

        if (!validateEmail.valid) {
            if (validateEmail.reason === 'disposable') {
                return res.status(400).json({
                    message: 'disposable email not allowed'
                });
            } else {
                return res.status(400).json({
                    message: 'email is not valid'
                });
            }
        }

        const weakness = zxcvbn(password);

        if (weakness.score < 1) {
            return res.status(400).json({
                message: 'Weak password',
                weakness: weakness.feedback
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const users = await User.find({ emailProcessed });
        if (users.length) {
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

        const infoSend = await sendMail.verify(verifyEmailCode, email, name);
        console.log('Email sent: ' + infoSend.response);

        await user.save();

        res.status(200).json({
            message: 'User created and verification email sent'
        });
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
        if (!users.length) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }

        const [user] = users;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }

        const sessionId = new mongoose.Types.ObjectId();
        await Session.create({
            _id: sessionId,
            userId: user._id
        });

        const token = jwt.sign({ sessionId }, process.env.JWT_SECRET);
        res.status(200).cookie('jwt', token, { path: '/', secure: true, httpOnly: true, maxAge: ms('30d') }).json({
            message: 'Auth successful',
            jwt: token
        });
    },
    logout: async (req, res) => {
        const { sessionId } = res.locals;

        const sessionDelete = await Session.findByIdAndDelete(sessionId);
        if (!sessionDelete) {
            return res.status(409).json({
                message: 'Session not found'
            });
        }

        res.status(200).clearCookie('jwt').json({
            message: 'Logout successful',
            clearCookie: true
        });
    },
    verifyEmail: async (req, res) => {
        const { verifyCode } = req.query;
        const { _id: userID } = res.locals.user;

        if (!verifyCode) {
            return res.status(400).json({
                message: 'verifyCode parameter required'
            });
        }

        if (verifyCode.length > 5 || !/[0-9]{5}/.test(verifyCode)) {
            return res.status(400).json({
                message: `${verifyCode} is not a valid verifyCode`
            });
        }

        const user = await User.findById(userID);
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

        if (user.verified) {
            return res.status(409).json({
                message: 'verify failed - User already verified'
            });
        }

        if (verifyCode === user.verifyEmailCode) {
            await User.findByIdAndUpdate(userID, { verified: true });
        }

        res.status(200).json({
            message: 'verify successful'
        });
    },
    resendVerificationEmail: async (req, res) => {
        const { _id: userID } = res.locals.user;

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({
                message: `User ${userID} is not found`
            });
        }

        if (user.verified) {
            return res.status(409).json({
                message: 'verify failed - User already verified'
            });
        }

        const limit = '1d';
        if (user.lastVerifyEmailSentAt && (Date.now() - user.lastVerifyEmailSentAt) < ms(limit)) {
            return res.status(429).json({
                message: `verify failed - Too many requests. Try again in ${ms(ms(limit) - (Date.now() - user.lastVerifyEmailSentAt), { long: true })}`,
                tryAgainAfter: ms(ms(limit) - (Date.now() - user.lastVerifyEmailSentAt), { long: true })
            });
        }

        const infoSend = await sendMail.verify(user.verifyEmailCode, user.emailFront, user.name);
        console.log('Email sent: ' + infoSend.response);
        await User.findByIdAndUpdate(userID, { lastVerifyEmailSentAt: Date.now() });

        res.status(200).json({
            message: `verify email sent again to ${user.emailFront}`
        });
    },
            });
        }

        res.status(200).json({
            message: `verify email sent again to ${user.emailFront}`
        });
    }
};
