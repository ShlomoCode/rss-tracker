const path = require('path');

module.exports = async (req, res) => {
    const { email } = res.locals.user;
    res.render(path.join(__dirname, '../views/unsubscribe', 'index.ejs'), { email });
};