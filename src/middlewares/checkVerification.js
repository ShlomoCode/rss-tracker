const checkVerification = (req, res, next) => {
    const { user } = res.locals;
    if (!user.verified) {
        res.header('client-action-required', 'verify');
        return res.status(401).json({
            message: 'Email not verified'
        });
    }
    next();
};

module.exports = checkVerification;
