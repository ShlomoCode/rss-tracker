const jwt = require('jsonwebtoken');
const config = require('../../../config.json');

const checkLogin = function (req, res, next) {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const infoLogin = jwt.verify(token, config.JWT_KEY, { complete: true });

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
