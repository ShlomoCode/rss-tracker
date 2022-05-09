const path = require('path');

module.exports = async (req, res) => {
    const { emailFront: email } = res.locals.user;
    console.log(req.originalUrl);
    res.render(path.join(__dirname, '../views/verify', 'index.ejs'), { email });
};