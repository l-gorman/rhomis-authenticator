const router = require('express').Router()
const fs = require('fs')
const axios = require('axios')

const auth = require('../validation/verifyToken')


const User = require('../models/User')
const Form = require('../models/Form')
const Project = require('../models/Project')

const getCentralAuthToken = require('./centralAuth')

const cors = require("cors");
router.use(cors());
router.options("*", cors());


router.post("/", auth, async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")


    try {
        const user = await User.findOne({ _id: req.user._id }, 'projects forms roles -_id')

        const projects = await Project.find({ users: req.user._id })
        // const projects = await Project.find({})
        const forms_found = await Form.find({ users: req.user._id })

        let forms = JSON.parse(JSON.stringify(forms_found))

        console.log("get submission count")
        console.log(req.body)
        if (req.body.getSubmissionCount === true) {

            for (let form_index = 0; form_index < forms.length; form_index++) {

                forms[form_index].submissions = await getSubmissionCounts({
                    projectName: forms[form_index].project,
                    formName: forms[form_index].name,
                })

            }
        }



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


async function getSubmissionCounts(props) {
    const project = await Project.findOne({ "name": props.projectName })
    const form = await Form.findOne({ "project": props.projectName, "name": props.formName })


    const url = BuildSubmissionURL({
        form: form,
        project: project
    })
    console.log(url)


    const token = await getCentralAuthToken()
    const centralResponse = await axios({
        method: "get",
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    })
        .catch(function (error) {
            console.log(error)
            throw error
        })


    const number_of_submissions = centralResponse.data.length

    return number_of_submissions

}

function BuildSubmissionURL(props) {


    if (props.form.draft === false) {
        return "https://" + process.env.CENTRAL_URL + '/v1/projects/' + props.project.centralID + '/forms/' + props.form.centralID + '/submissions'
    }

    if (props.form.draft = true) {
        return "https://" + process.env.CENTRAL_URL + '/v1/projects/' + props.project.centralID + '/forms/' + props.form.centralID + '/draft/submissions'
    }
}

module.exports = router

