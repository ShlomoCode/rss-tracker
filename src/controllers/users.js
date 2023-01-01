const User = require('@models/user');
const Session = require('@models/session');
const Token = require('@models/token');
const bcrypt = require('bcrypt');
const { zxcvbn } = require('@zxcvbn-ts/core');
const ms = require('ms');
const { validate: emailValidator } = require('deep-email-validator');
const crypto = require('crypto');
const emailSends = require('@services/email');

/**
 * נרמול כתובת מייל - הסרת נקודות מיותרות, מה שאחרי הפלוס, וכדומה
 * לצורך וידוא שהמייל לא רשום כבר
 * @param {String} email כתובת המייל שהתקבלה מהמשתמש
 * @returns
 */
function normalizeEmail (email) {
    email = email.toLowerCase();
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
    const { email, password } = req.body;

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

    const user = new User({
        password: hash,
        emailProcessed,
        emailFront: email
    });

    const verifyEmailToken = await Token.create({
        userId: user._id,
        type: 'verifyEmail',
        token: crypto.randomInt(10000, 100000)
    });

    await emailSends.verifyEmail({
        code: verifyEmailToken.token,
        address: email
    });

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
        uuid: crypto.randomUUID(),
        userId: user._id
    });

    res.status(200).cookie('session', session.uuid, { path: '/', secure: false, httpOnly: true, maxAge: ms('30d') }).json({
        message: 'Auth successful',
        sessionUuid: session.uuid,
        user: {
            email: user.emailFront,
            verified: user.verified
        }
    });
};

async function logout (req, res) {
    const { sessionId } = res.locals;

    await Session.findByIdAndDelete(sessionId);

    res.status(200).clearCookie('session').json({
        message: 'Logout successful'
    });
};

async function verifyEmail (req, res) {
    const { code } = req.body;
    const { _id: userId } = res.locals.user;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            message: `User ${userId} is not found`
        });
    }

    if (user.verified) {
        return res.status(200).json({
            message: 'User already verified'
        });
    }

    const existsTokens = await Token.find({ userId, type: 'verifyEmail', token: code });
    if (!existsTokens.length) {
        return res.status(401).json({
            message: 'code not correct or expired'
        });
    }

    await User.findByIdAndUpdate(userId, { verified: true });

    res.status(200).json({
        message: 'User verified successfully'
    });
};

async function resendVerificationEmail (req, res) {
    const { _id: userId, verified: isVerified, emailFront } = res.locals.user;

    if (isVerified) {
        return res.status(409).json({
            message: 'you already verified'
        });
    }

    const rateLimit = '1h';
    const existsTokens = await Token.find({ userId, type: 'verifyEmail' }).sort({ createdAt: -1 });
    if (existsTokens.length > 1) {
        const FreshTokens = existsTokens.filter(token => (Date.now() - token.createdAt) < ms(rateLimit));
        if (FreshTokens.length) {
            return res.status(429).json({
                message: `Too many requests. Try again in ${ms(ms(rateLimit) - (Date.now() - existsTokens[0].createdAt), { long: true })}`
            });
        }
    }

    const verifyToken = new Token({
        userId,
        type: 'verifyEmail',
        token: crypto.randomInt(10000, 100000)
    });

    await emailSends.verifyEmail({
        code: verifyToken.token,
        address: emailFront
    });

    await verifyToken.save();

    res.status(200).json({
        message: `verify email sent again to ${emailFront}`
    });
};

async function forgotPassword (req, res) {
    const { email } = req.body;

    const emailProcessed = normalizeEmail(email);

    const user = await User.findOne({ emailProcessed });
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    const rateLimit = '1h';
    const existsTokens = await Token.find({ userId: user._id, type: 'forgotPassword' }).sort({ createdAt: -1 });
    if (existsTokens.length) {
        const FreshTokens = existsTokens.filter(token => (Date.now() - token.createdAt) < ms(rateLimit));
        if (FreshTokens.length) {
            return res.status(429).json({
                message: `Too many requests. Try again in ${ms(ms(rateLimit) - (Date.now() - existsTokens[0].createdAt), { long: true })}`
            });
        }
    }

    const resetToken = new Token({
        userId: user._id,
        type: 'forgotPassword',
        token: crypto.randomInt(10000, 100000)
    });

    await emailSends.forgotPassword({
        token: resetToken.token,
        address: user.emailFront
    });

    await resetToken.save();

    res.status(200).json({
        message: 'reset password email sent successfully'
    });
};

async function changePassword (req, res) {
    const { token, email, newPassword } = req.body;

    const emailProcessed = normalizeEmail(email);

    const user = await User.findOne({ emailProcessed });
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    const tokenSaved = await Token.findOne({ userId: user._id, type: 'forgotPassword', token });
    if (!tokenSaved) {
        return res.status(400).json({
            message: 'Token is wrong or expired'
        });
    }

    const { score: scorePass } = zxcvbn(newPassword);
    if (scorePass < 1) {
        return res.status(400).json({
            message: 'Weak password'
        });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
        password: hash
    });

    await Token.findByIdAndDelete(tokenSaved._id);
    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
        message: 'change password successful'
    });
};

async function getSettings (req, res) {
    const { user } = res.locals;
    return res.status(200).json({
        enableEmailNotifications: user.enableEmailNotifications,
        allowAttachmentsInEmail: user.allowAttachmentsInEmail
    });
};

async function updateSettings (req, res) {
    const { _id: userId } = res.locals.user;
    const { enableEmailNotifications, allowAttachmentsInEmail } = req.body;

    await User.findByIdAndUpdate(userId, {
        enableEmailNotifications,
        allowAttachmentsInEmail
    });

    return res.status(200).json({
        message: 'settings updated successfully'
    });
};

module.exports = {
    signup,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    changePassword,
    getSettings,
    updateSettings
};