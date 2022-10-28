const User = require('@models/user');
const Session = require('@models/session');

const checkLogin = async (req, res, next) => {
    let sessionId = req.cookies.session || req.headers.authorization;
    if (!sessionId) return res.status(401).json({ message: 'session is required. please login' });

    sessionId = sessionId.replace('Bearer ', '');

    const session = await Session.findById(sessionId);
    if (!session) {
        res.header('action-required', 'login');
        return res.clearCookie('session').status(401).json({
            message: 'session not found. Please login again',
            clearCookie: true
        });
    }

    const user = await User.findById(session.userId);
    if (!user) {
        res.header('action-required', 'login');
        return res.status(401).clearCookie('session').json({
            message: 'user not found',
            clearCookie: true
        });
    }

    res.locals.user = user;
    res.locals.sessionId = sessionId;
    next();
};

module.exports = checkLogin;
