const jwt = require('jsonwebtoken');
const User = require('../../api/models/user');
const Session = require('../../api/models/session');

const checkLogin = async (req, res, next) => {
    let token = req.cookies.jwt || req.headers.authorization;
    if (!token) {
        if (req.originalUrl === '/login/') {
            return next();
        } else {
            return res.redirect('/login/');
        }
    }
    token = token.replace('Bearer ', '');

    let auth;
    try {
        auth = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (req.originalUrl !== '/login/') {
            return res.clearCookie('jwt').redirect('/login/');
        }
    }

    const { sessionId } = auth;
    let session;
    try {
        session = await Session.findById(sessionId);
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

    if (!session) {
        if (req.originalUrl !== '/login/') {
            return res.clearCookie('jwt').redirect('/login/');
        }
    }

    // אם ניסו לגשת לדף חיבור וכבר מחובר
    if (req.originalUrl === '/login/') {
        return res.redirect('/');
    }

    let user;
    try {
        user = await User.findById(session.userId);
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

    if (!user) {
        return res.status(401).clearCookie('jwt').json({
            message: 'user not found',
            clearCookie: true
        });
    }

    res.locals.user = user;
    res.locals.sessionId = sessionId;
    next();
};

module.exports = checkLogin;
