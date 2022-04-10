const jwt = require('jsonwebtoken');
const User = require('../models/user');

const checkPermissions = async (req, res, next) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const infoLogin = jwt.verify(token, process.env.JWT_KEY, { complete: true });
        const { id: userID } = infoLogin.payload;

        let user;
        try {
            user = await User.findById(userID);
        } catch (error) {
            return res.status(500).json({
                error
            });
        }

        res.locals.user = {
            userID,
            Permissions: user.Permissions
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};

module.exports = checkPermissions;
