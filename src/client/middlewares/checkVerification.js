const path = require('path');

const checkVerification = (req, res, next) => {
    const { user } = res.locals;
    const regexVerifyPage = /^\/verify\/(\?verifyCode=[0-9]{5,6})?$/;
        return res.redirect('/');
    if (user.verified && regexVerifyPage.test(req.originalUrl)) {
    }
    if (!user.verified && !regexVerifyPage.test(req.originalUrl)) {
        return res.redirect('/verify/');
    }

    next();
};

module.exports = checkVerification;
