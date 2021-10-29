const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios')

let config = require('config'); //we load the db location from the JSON files

// Authentication middleware
const auth = require('../validation/verifyToken')
const getCentralToken = require('./centralAuth')

// Validating the body of the request
const { registrationValidator, loginValidator } = require("../validation/validators.js")

const cors = require("cors");
router.use(cors());
router.options("*", cors());


// Configuring email transporter 
// sending email
// const nodemailer = require('nodemailer');
// var sgTransport = require('nodemailer-sendgrid-transport');

// function getTransporterOptions() {
//     if (config.util.getEnv('NODE_ENV') == "prod") {
//         return sgTransport({
//             auth: {
//                 api_key: process.env.SENDGRIDAPI
//             }
//         })
//     }

//     if (config.util.getEnv('NODE_ENV') == "dev" | config.util.getEnv('NODE_ENV') == "test") {
//         return {
//             host: 'smtp.ethereal.email',
//             port: 587,
//             auth: {
//                 user: process.env.ETHEREALEMAIL,
//                 pass: process.env.ETHEREALPASSWORD
//             }
//         }
//     }
// }
// const transporterOptions = getTransporterOptions()
// // config.util.getEnv('NODE_ENV')
// console.log(transporterOptions)





// const transporter = nodemailer.createTransport(transporterOptions);


// let mailDetails = {
//     from: 'michelle.renner38@ethereal.email',
//     to: 'leogorman123@gmail.com',
//     subject: 'Test mail',
//     html: '<h1>Test email from rhomis auth test<h1>'
// };

// transporter.sendMail(mailDetails, function (err, data) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('Email sent successfully');
//     }
// });



router.get("/", auth, async (req, res) => {
    const userInfo = await User.findOne({ _id: req.user._id })
    console.log(userInfo.roles)

    res.status(200).send(userInfo.roles)
})



// Registration route
router.post('/register', async (req, res) => {


    // Validate date before making user
    const { error } = registrationValidator(req.body);
    if (error !== undefined) return res.status(400).send(error.details[0].message)

    // Checking if the user already exists in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists')

    // Obtaining central access token
    try {


        // Save the user in the database
        // Hash passwords
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        const date = new Date()
        // Create a new user
        const user = new User({
            email: req.body.email,
            password: hashPassword,
            roles: {
                basic: true,
                projectManager: [],
                dataCollector: [],
                projectAnalyst: [],
                researcher: false,
                administrator: false
            },
            projects: [],
            forms: [],
            log: [
                {
                    action: "user created",
                    byEmail: req.body.email,
                    date: date

                }
            ]
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

    var expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)


    // Create and sign a token
    const token = jwt.sign({ _id: user._id, email: user.email, role: user.role, expiry: expiry }, process.env.TOKEN_SECRET)




    // Sending the JWT as a header but also as the 
    res.header({
        alg: "HS256",
        typ: "JWT"
    }).send(token)
})


router.post('/update', auth, async (req, res) => {
    res.send("reached the update endpoint")
})



// Delete user
router.delete('/delete', auth, async (req, res) => {
    const userToDelete = await User.findOne({ _id: req.user._id })

    if (!userToDelete) return res.status.apply(400).send('User does not exist in local db, cannot delete')

    // Checking if the user already exists on ODK central


    try {


        const deletedUser = await User.findOneAndDelete({ _id: req.user._id })
        res.send(deletedUser)

    } catch (err) {
        res.send(err)
    }


})

module.exports = router;
