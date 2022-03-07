const jwt = require("jsonwebtoken");
const config = require('../../../config.json')

const checkLogin = function (req, res, next) {
    try {
        const token = req.headers.authorization.replace("Bearer ", "")
        const infoLogin = jwt.verify(token, config.JWT_KEY, { complete: true })
        const { email, id } = infoLogin.payload
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Auth faild"
        })
    }
}

module.exports = checkLogin;