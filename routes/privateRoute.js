const router = require('express').Router();
const auth = require('./verifyToken')

// Adding auth as a middleware
router.get('/', auth, (req, res) => {
    res.json({
        posts: {
            title: 'My first post',
            data: 'Data you should access if authenticated'
        }
    })
}
)

module.exports = router