const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios')
// Authentication middleware
const auth = require('../validation/verifyToken')
const getCentralToken = require('./centralAuth')

// Validating the body of the request
const { registrationValidator, loginValidator } = require("../validation/validators.js")

const cors = require("cors");
router.use(cors());
router.options("*", cors());

// Registration route
router.post('/register', async (req, res) => {


    // Validate date before making user
    const { error } = registrationValidator(req.body);
    if (error !== undefined) return res.send(error.details[0].message)

    // Checking if the user already exists in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.send('Email already exists')

    // Checking if the user already exists on ODK central
    const central_token = await getCentralToken()

    if (!central_token) return res.status(500).send("Could not log administrator into central")
    // console.log("central token: " + central_token)

    const centralResultUsers = await axios({
        url: 'https://' + process.env.CENTRAL_URL + "/v1/users",
        method: "get",
        data: {
            email: req.body.email
        },
        headers: {
            'Authorization': 'Bearer ' + central_token
        }
    })

    // console.log(centralResultUsers)

    const user = centralResultUsers.data.filter(user => user.email === req.body.email)
    if (user.length > 1) res.status(400).send("multiple users with that email in central database")
    if (user.length === 1) res.status(400).send("A user with that email already exists in ODK central database")


    // Obtaining central access token
    try {
        // console.log("Obtaining token")

        // Add user to central database using the API
        const centralResult = await axios({
            url: 'https://' + process.env.CENTRAL_URL + "/v1/users",
            method: "post",
            data: {
                email: req.body.email,
                password: req.body.password
            },
            headers: {
                'Authorization': 'Bearer ' + central_token
            }
        })
        // console.log("Adding user")

        // console.log(centralResult.data)
        if (centralResult.data.id === undefined) throw "Unable to save user in ODK Central"

        // Save the user in the database

        // Hash passwords
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        // Create a new user

        const user = new User({
            email: req.body.email,
            centralID: centralResult.data.id,
            password: hashPassword,
            role: "project",
            projects: [],
            forms: []
        });


        const savedUser = await user.save();

        res.status(201).send({
            userID: savedUser._id
        })
    } catch (err) {
        res.status(400).send("error: " + err)
    }
})



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

    // Create and sign a token
    const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, process.env.TOKEN_SECRET)
    // Sending the JWT as a header but also as the 
    res.header('Authorization', token).send(token)
})

// Delete user
router.delete('/delete', auth, async (req, res) => {
    const userToDelete = await User.findOne({ _id: req.user._id })

    if (!userToDelete) return res.status.apply(400).send('User does not exist in local db, cannot delete')

    // Checking if the user already exists on ODK central
    const central_token = await getCentralToken()
    const centralResultUsers = await axios({
        url: 'https://' + process.env.CENTRAL_URL + "/v1/users",
        method: "get",
        data: {
            email: req.body.email,
            password: req.body.password
        },
        headers: {
            'Authorization': 'Bearer ' + central_token
        }
    })

    const user = centralResultUsers.data.filter(user => user.email === req.user.email)

    if (user.length === 0) return res.status(400).send("No users with that email in ODK central database")

    try {
        const centralResult = await axios({
            url: 'https://' + process.env.CENTRAL_URL + "/v1/users/" + userToDelete.centralID,
            method: "delete",
            data: {
                email: req.body.email,
                password: req.body.password
            },
            headers: {
                'Authorization': 'Bearer ' + central_token
            }
        })

        const deletedUser = await User.findOneAndDelete({ _id: req.user._id })
        res.send(deletedUser)

    } catch (err) {
        res.send(err)

    }


})

// Adding auth as a middleware
router.get('/information', auth, async (req, res) => {

    const user = await User.findOne({ _id: req.user._id })
    if (!user) return res.send("Could not find a user with the credentials provided")
    res.json({
        id: user._id,
        email: user.email,
        projects: user.projects,
        forms: user.forms
    })
})


module.exports = router;
