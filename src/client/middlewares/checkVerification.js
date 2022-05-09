const path = require('path');

const checkVerification = (req, res, next) => {
    const { user } = res.locals;
    const regexVerifyPage = /^\/verify\/(\?verifyCode=[0-9]{5,6})?$/;
    if (user.verified && regexVerifyPage.test(req.originalUrl)) {
        return res.sendFile(path.join(__dirname, '../views/', 'verified-ok.html'));
    }
    if (!user.verified && !regexVerifyPage.test(req.originalUrl)) {
        return res.redirect('/verify/');
    }

    next();
};

module.exports = checkVerification;
