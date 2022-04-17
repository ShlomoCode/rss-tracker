const User = require('../../api/models/user');

const checkVerification = async (req, res, next) => {
    const { id: userID } = res.locals.user;
    let user;
    try {
        user = await User.findById(userID);
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

    // if not found user
    if (!user) {
        return res.status(404).clearCookie('token').json({
            message: 'User not found. Please refresh'
        });
    }

    const regexVerifyPage = /^\/verify\/(\?verifyCode=[0-9]{5,6})?$/;
    if (user.verifyEmailStatus && regexVerifyPage.test(req.originalUrl)) {
        return res.redirect('/');
    }
    console.log(req.originalUrl);
    if (!user.verifyEmailStatus && !regexVerifyPage.test(req.originalUrl)) {
        return res.redirect('/verify/');
    }

    const { emailFront: email, name } = user;
    res.locals.user.name = name;
    res.locals.user.email = email;

    next();
};

module.exports = checkVerification;
