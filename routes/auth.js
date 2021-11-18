const router = require('express').Router();
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
const Project = require('../models/Project');
const Form = require('../models/Form');
const User = require('../models/User');

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


async function verifyCaptcha(props) {

    console.log(process.env.RECAPTCHA_SECRET_KEY)
    console.log(props.captchaToken)
    try {
        // await timeout(2000)

        const query_params = {
            "secret": process.env.RECAPTCHA_SECRET_KEY,
            "response": props.captchaToken
        }

        const response = await axios({
            method: "post",
            url: "https://www.google.com/recaptcha/api/siteverify",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            params: query_params
        })
        console.log(response)
        return (response)
    } catch (err) {
        console.log(err)
        return (err)

    }
}


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

        // Verify User with Recaptcha
        const captchaResult = await verifyCaptcha({ captchaToken: req.body.captchaToken })
        console.log("captchaResult")
        console.log(captchaResult)


        // Save the user in the database
        // Hash passwords
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        const date = new Date()
        // Create a new user
        const user = new User({
            title: req.body.title,
            firstName: req.body.firstName,
            surname: req.body.surname,
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

router.post('/project-manager', auth, async (req, res) => {
    console.log("Finding the user")

    const otherUser = await User.findOne({ "email": req.body.email })
    console.log("Checking if the user exists")
    if (!otherUser) {
        return res.status(400).send("User does not exist")
    }

    if (otherUser.roles.projectManager.includes(req.body.projectName)) {
        return res.status(400).send("User is already a project manager for this project")
    }
    console.log("Checking if the IDs are the same")

    if (otherUser._id.toString() === req.user._id) {
        return res.status(400).send("Please enter the email of another user")

    }


    console.log("Updating DB")
    try {
        console.log("Adding User to project")

        const updatedProject = await Project.updateOne(
            {
                name: req.body.projectName
            },
            {
                $addToSet: {
                    users: otherUser._id.toString()
                }
            })

        console.log("Adding Users to forms")


        const updatedForms = await Form.updateMany({
            project: req.body.projectName
        },
            {
                $addToSet: {
                    users: otherUser._id.toString()
                }
            })
        console.log("Adding forms to users")
        const formsToAdd = await Form.find({
            project: req.body.projectName
        })
        console.log(formsToAdd)
        const formIDs = formsToAdd.map((form) => form.name)
        console.log(formIDs)
        console.log("UserID")

        console.log(otherUser._id)
        const updatedUser = await User.updateOne(
            {
                _id: otherUser._id
            },
            {
                $addToSet: {
                    "roles.projectManager": req.body.name,
                    "roles.analyst": { $each: formIDs },
                    "roles.dataCollector": { $each: formIDs }
                }
            })
        console.log(updatedUser)

        return res.status(200).send(updatedUser)

    } catch (err) {
        return res.status(400).send(err)
    }

})

router.post('/data-collector', auth, async (req, res) => {

})

router.post('/analyst', auth, async (req, res) => {

})


// Delete user
router.delete('/delete', auth, async (req, res) => {
    const userToDelete = await User.findOne({ _id: req.user._id })

    if (!userToDelete) return res.status.apply(400).send('User does not exist in local db, cannot delete')

    try {

        const deletedUser = await User.findOneAndDelete({ _id: req.user._id })
        res.send(deletedUser)

    } catch (err) {
        res.send(err)
    }


})

module.exports = router;
