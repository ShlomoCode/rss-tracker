const checkPermissions = (req, res, next) => {
    const { user } = res.locals;

    if (user.Permissions !== 'admin') {
        return res.status(403).json({
            message: 'You are not allowed to do this action'
        });
    }

    next();
};

module.exports = checkPermissions;
