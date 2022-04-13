const jwt = require('jsonwebtoken');

const checkLogin = function (req, res, next) {
    try {
        const token = req.cookies.token;
        const infoLogin = jwt.verify(token, process.env.JWT_KEY, { complete: true });

        const { id: userID } = infoLogin.payload;

        res.locals.user = {
            userID
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};

module.exports = checkLogin;
