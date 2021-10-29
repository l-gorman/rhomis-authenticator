const jwt = require('jsonwebtoken')

// Middle ware function (add to protected routes)

function auth(req, res, next) {
    // Checking if a request has a token
    const token = req.header('Authorization')
    // If token doesn't exist, give access denied
    if (!token) return res.status(401).send('Access Denied');
    const currentDate = new Date()

    try {

        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(currentDate)
        const expiry = new Date(verified.expiry)

        // Checking whether or not the token has expired
        console.log(expiry < currentDate)
        if (expiry < currentDate) {
            throw 'Token has expired'
        }
        req.user = verified
        next();

    } catch (err) {
        res.status(401).send('Invalid Token')
    }
}

module.exports = auth;