const router = require('express').Router()
const fs = require('fs')
const axios = require('axios')

const auth = require('../validation/verifyToken')

const Project = require('../models/Project')
const Form = require('../models/Form')
const User = require('../models/User')

const cors = require("cors");
router.use(cors());
router.options("*", cors());

const getCentralToken = require('./centralAuth')

router.post("/new", auth, async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")

    console.log(req.query.project_name)
    console.log(req.query.form_name)
    console.log(req.query.publish)

    try {

        // Check which project we are looking for
        const previous_projects = await Project.findOne({ name: req.query.project_name })
        console.log(previous_projects)
        if (!previous_projects) {
            return res.send("Could not the project you are looking for in the RHoMIS db")
        }

        // Check if the authenticated user is actually linked to the project under question
        console.log(previous_projects.users)
        console.log(req.user._id)

        if (!previous_projects.users.includes(req.user._id)) return res.send("Authenticated user does not have permissions to modify this project")

        const project_ID = previous_projects.centralID

        // Check if form exists
        const previous_forms = await Form.findOne({ name: req.query.form_name, project: req.query.project_name })
        if (previous_forms) {
            res.send("There is already a form with this name in the database")
        }


        // Authenticate on ODK central  
        const token = await getCentralToken()

        // Load the xls form data from the request
        const data = await converToBuffer(req, res)

        // Send form to ODK central
        const centralResponse = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/forms?ignoreWarnings=true&publish=' + req.query.publish,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'X-XlsForm-FormId-Fallback': req.query.form_name,
                'Authorization': 'Bearer ' + token
            },
            data: data
        })
            .catch(function (error) {
                throw error
            })

        // Add form to projects collection
        const updated_project = await Project.updateOne(
            { name: req.query.project_name },
            { $push: { forms: req.query.form_name } });


        // Add form to user collection
        const updated_user = await User.updateOne(
            { _id: req.user._id },
            { $push: { forms: req.query.form_name } });

        // Add form to forms collection
        console.log(req.query.project_name)
        console.log(centralResponse.data)

        savedForm = await new Form({
            name: req.query.form_name,
            project: req.query.project_name,
            formVersion: req.body.form_version,
            users: [req.user._id],
            centralID: centralResponse.data.xmlFormId,
            draft: !req.query.publish,
            complete: false,
        }).save()




        res.send("Project successfully created")

        // res.send(centralResponse.data)

    } catch (err) {
        console.log(err)
        res.send(err)
    }

    return
})


async function converToBuffer(req, res) {
    var data = new Buffer.from('');

    return new Promise((resolve, reject) => {
        req.on('data', function (chunk) {
            data = Buffer.concat([data, chunk]);
        });
        req.on('err', function (err) {
            reject(err)
        })

        req.on('end', () => {
            resolve(data)
        })

    })

}

// Asynchronous file writing
// Based on this: https://stackoverflow.com/questions/16598973/uploading-binary-file-on-node-js
async function writeToFile(req, res) {
    // Creating a new empty buffer
    var data = new Buffer.from('');

    // We listen to the stream of data events
    // We concantenate these events onto the data Buffer
    req.on('data', function (chunk) {
        data = Buffer.concat([data, chunk]);
    });

    // When the data stream ends, we write it to a file
    req.on('end', async function () {

        //This chuck writes to file if needs be
        await fs.writeFile("./survey_modules/node_output.xlsx", data, (err) => {
            if (err) throw err
        });
    })
    res.write("Success in saveing survey file to server \n")
}


// Asynchronous file reading
async function readFile(path) {
    const data = fs.readFileSync(path)
    return data
}

module.exports = router;