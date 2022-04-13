const User = require('../models/user');

const checkPermissions = async (req, res, next) => {
    const { userID } = res.locals.user;
    let user;
    try {
        user = await User.findById(userID);
        res.locals.user.Permissions = user.Permissions;
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
    next();
};

module.exports = checkPermissions;
