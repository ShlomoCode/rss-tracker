const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Session = require('../models/session');

const checkLogin = async (req, res, next) => {
    let token = req.cookies.jwt || req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'jwt is required. please login' });

    token = token.replace('Bearer ', '');
    let auth;
    try {
        auth = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '120d' });
    } catch (error) {
        if (error.message === 'maxAge exceeded') {
            return res.status(401).clearCookie('jwt').json({
                message: 'jwt is expired, please login again',
                clearCookie: true
            });
        }
        return res.clearCookie('jwt').status(401).json({
            message: 'jwt invalid',
            clearCookie: true
        });
    }

    const { sessionId } = auth;

    const session = await Session.findById(sessionId);
    if (!session) {
        return res.clearCookie('jwt').status(401).json({
            message: 'session not found. Please login again',
            clearCookie: true
        });
    }

    const user = await User.findById(session.userId);
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
