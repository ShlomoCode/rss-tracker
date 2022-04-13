const jwt = require('jsonwebtoken');

const checkLogin = function (req, res, next) {
    try {
        const token = req.cookies.token;
        const auth = jwt.verify(token, process.env.JWT_KEY, { complete: true });
        const { id } = auth.payload;
        // אם ניסו להתחבר וכבר מחובר
        if (req.originalUrl === '/login/') {
            return res.redirect('/');
        }
        res.locals.user = { id };
    } catch (error) {
        console.log(error);
        if (req.originalUrl === '/') {
            return res.redirect('/login/');
        }
    }
    next();
};

module.exports = checkLogin;
