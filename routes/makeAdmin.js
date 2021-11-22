
const router = require('express').Router();
const axios = require('axios')
let config = require('config'); //we load the db location from the JSON files
const bcrypt = require('bcryptjs');
const auth = require('../validation/verifyToken')
const cors = require("cors");

const { registrationValidator, loginValidator } = require("../validation/validators.js")

const Project = require('../models/Project');
const Form = require('../models/Form');
const User = require('../models/User');

router.use(cors());
router.options("*", cors());

async function initAdmin() {

    console.log("initialising admin")
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt)
    const date = new Date()


    const projectIDs = await Project.distinct("name")
    const formIDs = await Form.distinct("name")
    console.log(projectIDs)
    console.log(formIDs)
    // console.log(hashPassword)
    // console.log(process.env.ADMIN_EMAIL)


    // Add all projects to user
    const newUser = await User.updateOne({
        email: process.env.ADMIN_EMAIL
    }, {

        email: process.env.ADMIN_EMAIL,
        password: hashPassword,
        roles: {
            basic: true,
            projectManager: projectIDs,
            dataCollector: formIDs,
            analyst: formIDs,
            researcher: true,
            administrator: true
        },
        projects: projectIDs,
        forms: formIDs,
        log: [
            {
                action: "user created",
                byEmail: process.env.ADMIN_EMAIL,
                date: date
            }
        ]
    },
        {
            upsert: true
        })

    // Addd all


}

async function updateAdmins() {

    // Add all projects and forms to admins


    // Add admins to all projects

    // Add admins to all forms
}

router.post('/', auth, async (req, res) => {

})

module.exports.router = router
module.exports.initAdmin = initAdmin
module.exports.updateAdmins = updateAdmins