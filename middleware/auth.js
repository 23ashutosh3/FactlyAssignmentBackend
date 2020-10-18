const jwt = require("jsonwebtoken")
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token")
        if (!token) {
            return res.status(401).json({ msg: "No authentication token,authrization denied" })
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({ msg: "Token verification failed,authrization denied" })
        }
        req.user = verified.id;
        next()
        console.log(req.user);
    } catch (err) {
        return status(500).json({ error: err.message })
    }

};
module.exports = auth;