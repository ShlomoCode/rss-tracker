const jwt = require('jsonwebtoken');

const checkLogin = function (req, res, next) {
    let logadin;
    try {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_KEY, { complete: true });
        logadin = true;
    } catch (error) {
        logadin = false;
    }

    console.log(logadin);
    console.log(req.originalUrl);

    if (req.originalUrl === '/login/' && logadin === true) {
        return res.redirect('/');
    }

    if (req.originalUrl === '/' && logadin === false) {
        return res.redirect('/login');
    }

    next();
};

module.exports = checkLogin;
