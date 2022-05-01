const jwt = require('jsonwebtoken');

const checkLogin = function (req, res, next) {
    const { token } = req.cookies;
    if (!token) {
        if (req.originalUrl === '/login/') {
            return next();
        } else {
            return res.redirect('/login/');
        }
    }
    try {
        const auth = jwt.verify(token, process.env.JWT_KEY);
        res.locals.user = { id: auth.id };
        // אם ניסו לגשת לדף חיבור וכבר מחובר
        if (req.originalUrl === '/login/') {
            return res.redirect('/');
        }
    } catch (error) {
        console.log('Error in Login in Cookie -', error.message);
        res.clearCookie('token');
        console.log('Cookie cleared!');
        if (req.originalUrl !== '/login/') {
            return res.redirect('/login/');
        }
    }
    next();
};

module.exports = checkLogin;
