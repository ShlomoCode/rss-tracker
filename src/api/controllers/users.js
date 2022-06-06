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

        /**
         * validate email
        */
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

        const limit = '1h';
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
    resetPassword: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'email parameter required'
            });
        }

        /**
         * normalize-email by regex
         */
        const emailProcessed = normalizeEmail(email);

        /**
                 * validate email
                */
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

        const user = await User.findOne({ emailProcessed });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const limit = '1h';
        if (user.passwordResetAt && (Date.now() - user.passwordResetAt) < ms(limit)) {
            return res.status(429).json({
                message: `reset password failed - Too many requests. Try again in ${ms(ms(limit) - (Date.now() - user.passwordResetAt), { long: true })}`,
                tryAgainAfter: ms(ms(limit) - (Date.now() - user.passwordResetAt), { long: true })
            });
        }

        const resetPasswordToken = randomNumber();
        await sendMail.resetPassword(resetPasswordToken, user.emailFront, user.name);
        await User.findByIdAndUpdate(user._id, { passwordResetToken: resetPasswordToken, passwordResetAt: Date.now() });

        res.status(200).json({
            message: 'reset password email sent successfully'
        });
    },
    resetPasswordConfirm: async (req, res) => {
        const { resetPasswordToken, email, newPassword } = req.body;

        if (!resetPasswordToken) {
            return res.status(400).json({
                message: 'resetPasswordToken parameter required'
            });
        }
        if (!email) {
            return res.status(400).json({
                message: 'email parameter required'
            });
        }
        if (!newPassword) {
            return res.status(400).json({
                message: 'newPassword parameter required'
            });
        }

        if (typeof resetPasswordToken !== 'string') {
            return res.status(400).json({
                message: 'resetPasswordToken must be a string'
            });
        }

        if (typeof email !== 'string') {
            return res.status(400).json({
                message: 'email must be a string'
            });
        }

        if (typeof newPassword !== 'string') {
            return res.status(400).json({
                message: 'newPassword must be a string'
            });
        }

        const emailProcessed = normalizeEmail(email);

        const user = await User.findOne({ emailProcessed });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (resetPasswordToken.length > 5 || !/[0-9]{5}/.test(resetPasswordToken)) {
            return res.status(400).json({
                message: `${resetPasswordToken} is not a valid resetPasswordToken`
            });
        }

        if (user.passwordResetToken !== resetPasswordToken) {
            return res.status(401).json({
                message: 'reset password failed - Wrong reset password code'
            });
        }

        const weakness = zxcvbn(newPassword);

        if (weakness.score < 1) {
            return res.status(400).json({
                message: 'Weak password',
                weakness: weakness.feedback
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(user._id, { password: hash, passwordResetToken: null, passwordResetAt: null });

        res.status(200).json({
            message: 'reset password successful'
        });
    },
    changePassword: async (req, res) => {
        const { _id: userId } = res.locals.user;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword) {
            return res.status(400).json({
                message: 'oldPassword parameter required'
            });
        }
        if (!newPassword) {
            return res.status(400).json({
                message: 'newPassword parameter required'
            });
        }

        if (typeof oldPassword !== 'string') {
            return res.status(400).json({
                message: 'oldPassword must be a string'
            });
        }

        if (typeof newPassword !== 'string') {
            return res.status(400).json({
                message: 'newPassword must be a string'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isMatchPassword) {
            return res.status(401).json({
                message: 'change password failed - Wrong old password'
            });
        }

        const weakness = zxcvbn(newPassword);
        if (weakness.score < 1) {
            return res.status(400).json({
                message: 'Weak password',
                weakness: weakness.feedback
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, { password: hash });

        const sessionsDeleted = await Session.deleteMany({ userId });

        res.status(200).clearCookie('jwt').json({
            message: 'Password changed. Please login again using the new password',
            sessionsDeletedCount: sessionsDeleted.deletedCount,
            clearCookie: true
        });
    }
};
