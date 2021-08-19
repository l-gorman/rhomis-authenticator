const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Authentication middleware
const auth = require('./verifyToken')


// Validating the body of the request
const { registrationValidator, loginValidator } = require("./validators.js")

const cors = require("cors");
router.use(cors());
router.options("*", cors());

// Registration route
router.post('/register', async (req, res) => {

    // Validate date before making user
    const { error } = registrationValidator(req.body);
    if (error !== undefined) return res.status(400).send(error.details[0].message)

    // Checking if the user is already existent
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists')

    // Hash passwords
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    // Create a new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });

    // Save user and catch error
    try {
        const savedUser = await user.save();
        res.status(201).send({ userID: savedUser._id })
    } catch (err) {
        res.status(400).send(err)
    }
});


// Login

router.post('/login', async (req, res) => {
    // Validate request
    const { error } = loginValidator(req.body)
    if (error !== undefined) return res.status(400).send(error.details[0].message)

    // Checking if the user is already existent
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Email not found')

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Incorrect password')

    // Create and assign a token

    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_SECRET)
    // Sending the JWT as a header but also as the 
    res.header('Authorization', token).status(200).send(token)
})

router.delete('/delete', auth, async (req, res) => {
    // Validate request

    // Delete user
    const deletedUser = await User.findOneAndDelete({ _id: req.user._id })

    res.send(deletedUser)
})

// Adding auth as a middleware
router.get('/information', auth, (req, res) => {

    res.json({
        id: req.user._id,
        username: req.user.username
    })
}
)




module.exports = router;