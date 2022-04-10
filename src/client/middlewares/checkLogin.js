const jwt = require('jsonwebtoken');

    let logadin;
const checkLogin = function (req, res, next) {
    try {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_KEY, { complete: true });
        logadin = true;
    } catch (error) {
        logadin = false;
    }

    if (req.originalUrl === '/login/' && logadin === true) {
        return res.redirect('/');
    }

    if (req.originalUrl === '/' && logadin === false) {
        return res.redirect('/login');
    }

    next();
};

module.exports = checkLogin;
