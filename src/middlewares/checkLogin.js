const User = require('@models/user');
const Session = require('@models/session');

const checkLogin = async (req, res, next) => {
    let sessionUuid = req.cookies.session || req.headers.authorization;
    if (!sessionUuid) return res.status(401).header('action-required', 'login').json({ message: 'session is required. please login' });

    sessionUuid = sessionUuid.replace('Bearer ', '');

    const session = await Session.findOne({ uuid: sessionUuid });
    if (!session) {
        if (req.url !== '/logout') res.header('action-required', 'login');
        return res.clearCookie('session').status(401).json({
            message: 'session not found. Please login again'
        });
    }

    const user = await User.findById(session.userId);
    if (!user) {
        res.header('action-required', 'login');
        return res.status(401).clearCookie('session').json({
            message: 'user not found'
        });
    }

    res.locals.user = user;
    res.locals.sessionId = session._id;
    next();
};

module.exports = checkLogin;
