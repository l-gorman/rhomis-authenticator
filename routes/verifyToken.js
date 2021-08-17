const jwt = require('jsonwebtoken')

// Middle ware function (add to protected routes)

function auth(req, res, next) {
    // Checking if a request has a token
    const token = req.header('auth-token')
    // If token doesn't exist, give access denied
    if (!token) return res.status(401).send('Access Denied');

    try {

        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified
        next();

    } catch (err) {
        res.status(400).send('Invalid Token')
    }
}

module.exports = auth;