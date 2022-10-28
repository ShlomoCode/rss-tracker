const mongoose = require('mongoose');
const User = require('@models/user');
const Session = require('@models/session');
const bcrypt = require('bcrypt');
const { zxcvbn } = require('@zxcvbn-ts/core');
const ms = require('ms');
const { validate: emailValidator } = require('deep-email-validator');
const emailSends = require('@services/email');

/**
 * @returns number random in 5 digit in string format
 */
function randomCode () {
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
};

async function signup (req, res) {
    const { email, password, name } = req.body;

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

    const { score: scorePass } = zxcvbn(password);
    if (scorePass < 1) {
        return res.status(400).json({
            message: 'Weak password'
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const users = await User.find({ emailProcessed });
    if (users.length) {
        return res.status(409).json({
            message: 'Email exists'
        });
    }

    const verifyEmailCode = randomCode();
    const userID = new mongoose.Types.ObjectId();

    const user = new User({
        _id: userID,
        password: hash,
        emailProcessed,
        emailFront: email,
        name,
        verifyEmailCode
    });

    await emailSends.verifyEmail({
        code: verifyEmailCode,
        address: email
    });
    console.log(`info: email sent for user ${emailProcessed}`);

    await user.save();

    res.status(200).json({
        message: 'User created and verification email sent'
    });
};
async function login (req, res) {
    const { email, password } = req.body;

    const emailProcessed = normalizeEmail(email);

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

    const session = await Session.create({
        _id: new mongoose.Types.ObjectId(),
        userId: user._id
    });

    res.status(200).cookie('session', session._id, { path: '/', secure: true, httpOnly: true, maxAge: ms('30d') }).json({
        message: 'Auth successful',
        sessionId: session._id
    });
};
async function logout (req, res) {
    const { sessionId } = res.locals;

    const session = await Session.findById(sessionId);
    if (!session) {
        return res.clearCookie('session').status(409).json({
            message: 'Session not found'
        });
    }

    await Session.findByIdAndDelete(sessionId);

    res.status(200).clearCookie('session').json({
        message: 'Logout successful',
        clearCookie: true
    });
};
async function verifyEmail (req, res) {
    const { code } = req.body;
    const { _id: userID } = res.locals.user;

    const user = await User.findById(userID);
    if (!user) {
        return res.status(404).json({
            message: `User ${userID} is not found`
        });
    }

    if (code !== user.verifyEmailCode) {
        return res.status(401).json({
            message: 'verify failed - Wrong verification code'
        });
    }

    if (user.verified) {
        return res.status(409).json({
            message: 'verify failed - User already verified'
        });
    }

    if (code === user.verifyEmailCode) {
        await User.findByIdAndUpdate(userID, { verified: true });
    }

    res.status(200).json({
        message: 'verify successful'
    });
};
async function resendVerificationEmail (req, res) {
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

    const infoSend = await emailSends.verifyEmail({
        code: user.verifyEmailCode,
        address: user.emailFront
    });
    console.log('Email sent: ' + infoSend.response);
    await User.findByIdAndUpdate(userID, { lastVerifyEmailSentAt: Date.now() });

    res.status(200).json({
        message: `verify email sent again to ${user.emailFront}`
    });
};
async function resetPassword (req, res) {
    const { email } = req.body;

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

    const resetPasswordToken = randomCode();
    await emailSends.resetPassword({
        code: resetPasswordToken,
        address: user.emailFront,
        name: user.name
    });
    await User.findByIdAndUpdate(user._id, { passwordResetToken: resetPasswordToken, passwordResetAt: Date.now() });

    res.status(200).json({
        message: 'reset password email sent successfully'
    });
};
async function resetPasswordConfirm (req, res) {
    const { resetPasswordToken, email, newPassword } = req.body;

    const emailProcessed = normalizeEmail(email);

    const user = await User.findOne({ emailProcessed });
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    if (!/[0-9]{5}/.test(resetPasswordToken)) {
        return res.status(400).json({
            message: 'reset password token is not valid - must be 5 digits'
        });
    }

    if (user.passwordResetToken !== resetPasswordToken) {
        return res.status(401).json({
            message: 'reset password failed - Wrong reset password code'
        });
    }

    const { score: scorePass } = zxcvbn(newPassword);
    if (scorePass < 1) {
        return res.status(400).json({
            message: 'Weak password'
        });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, { password: hash, passwordResetToken: null, passwordResetAt: null });

    res.status(200).json({
        message: 'reset password successful'
    });
};
async function changePassword (req, res) {
    const { _id: userId } = res.locals.user;
    const { oldPassword, newPassword } = req.body;

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

    const { score: scorePass } = zxcvbn(newPassword);
    if (scorePass < 1) {
        return res.status(400).json({
            message: 'Weak password'
        });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hash });

    const sessionsDeleted = await Session.deleteMany({ userId });

    res.status(200).clearCookie('session').json({
        message: 'Password changed. Please login again using the new password',
        sessionsDeletedCount: sessionsDeleted.deletedCount,
        clearCookie: true
    });
};

module.exports = {
    signup,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    resetPassword,
    resetPasswordConfirm,
    changePassword
};