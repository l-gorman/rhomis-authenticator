const router = require('express').Router()
const fs = require('fs')
const axios = require('axios')

const auth = require('../validation/verifyToken')


const User = require('../models/User')
const Form = require('../models/Form')
const Project = require('../models/Project')

const cors = require("cors");
router.use(cors());
router.options("*", cors());


router.get("/", auth, async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")


    try {
        const user = await User.findOne({ _id: req.user._id }, 'projects forms roles -_id')

        const projects = await Project.find({ users: req.user._id })
        // const projects = await Project.find({})
        const forms = await Form.find({ users: req.user._id })
        // const forms = await Form.find({})

        const result = {
            user: user,
            projects: projects,
            forms: forms
        }

        res.status(200).send(result)


    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router

