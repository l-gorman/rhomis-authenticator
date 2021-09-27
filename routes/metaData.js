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

const getCentralToken = require('./centralAuth')

router.get("/", auth, async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")


    try {
        const user = await User.find({ _id: req.user._id }, 'projects forms -_id')

        const projects = await Project.find({ users: req.user._id })
        // const projects = await Project.find({})
        const forms = await Form.find({ users: req.user._id })
        // const forms = await Form.find({})


        const result = {
            user: user,
            projects: projects,
            forms: forms
        }

        res.send(result)


    } catch (err) {
        res.json({ error: err })
    }
})

module.exports = router

