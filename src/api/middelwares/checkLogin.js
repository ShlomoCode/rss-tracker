const jwt = require("jsonwebtoken");
const config = require('../../../config.json')

const checkLogin = function (req, res, next) {
    try {
        const token = req.headers.authorization.replace("Bearer ", "")
        jwt.verify(token, config.JWT_KEY)
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Auth faild"
        })
    }
}

module.exports = checkLogin;