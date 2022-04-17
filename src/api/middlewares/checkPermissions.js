const User = require('../models/user');

const checkPermissions = async (req, res, next) => {
    const { id: userID } = res.locals.user;
    let user;
    try {
        user = await User.findById(userID);
        if (user.Permissions !== 'admin') {
            return res.status(403).json({
                message: 'You are not allowed to do this action'
            });
        }
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
    next();
};

module.exports = checkPermissions;
