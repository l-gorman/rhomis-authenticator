const router = require('express').Router()
const fs = require('fs')
const axios = require('axios')

const auth = require('../validation/verifyToken')

const Project = require('../models/Project')
const Form = require('../models/Form')
const User = require('../models/User')

const updateAdmins = require('./makeAdmin').updateAdmins


let config = require('config'); //we load the db location from the JSON files
const apiURL = config.get('dataAPI.url')


const cors = require("cors");
router.use(cors());
router.options("*", cors());

const getCentralToken = require('./centralAuth')

router.post("/publish", auth, async (req, res) => {

    console.log("finalizing form")
    // Authenticate on ODK central  
    const token = await getCentralToken()

    console.log(req.query.project_name)
    console.log(req.query.form_name)
    if (req.query.project_name === undefined |
        req.query.form_name === undefined) {
        return res.status(400).send("Missing information in request")
    }

    const previous_projects = await Project.findOne({ name: req.query.project_name })
    console.log("previous projects")
    console.log(previous_projects)
    if (!previous_projects) return res.status(400).send("Project does not exist in RHoMIS db")

    const project_ID = previous_projects.centralID

    const previous_forms = await Form.findOne({ name: req.query.form_name })
    console.log("previous_forms")
    console.log(previous_forms)
    if (!previous_forms) return res.status(400).send("Form does not exist in RHoMIS db")

    try {
        console.log("making central request")
        const centralResponse = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/forms/' + req.query.form_name + '/draft/publish',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        })
            .catch(function (error) {
                throw error
            })
        console.log("centralResponse")

        console.log(centralResponse)

        const updated_form = await Form.updateOne(
            {
                name: req.query.form_name,
                project: req.query.project_name
            },
            {
                draft: false,
            }
        )


        return res.status(200).send("Form finalized")
    } catch (err) {

    }
    // https://central.rhomis.cgiar.org/v1/projects/projectId/forms/xmlFormId/draft/publish


})

router.post("/new-draft", auth, async (req, res) => {
    console.log("user: " + req.user._id)
    console.log("project_name: " + req.query.project_name)
    console.log("form_name: " + req.query.form_name)
    console.log("publish: " + req.query.publish)
    console.log("form_version: " + req.query.form_version)
    try {
        if (req.query.project_name === undefined |
            req.query.form_name === undefined |
            req.query.form_version === undefined |
            req.query.publish === undefined) {
            return res.status(400).send("Missing information in request")
        }

        // Check which project we are looking for

        const previous_projects = await Project.findOne({ name: req.query.project_name })
        console.log("previous_projects")

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
        if (!previous_forms) {
            return res.status(400).send("Form does not exist so cannot update")
        }


        // Authenticate on ODK central  
        const token = await getCentralToken()

        // Load the xls form data from the request
        const data = await converToBuffer(req, res)

        // Send form to ODK central
        const centralResponse = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/forms/' + req.query.form_name + '/draft?ignoreWarnings=true',
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




        // Update forms collection


        const project = await Project.findOne(
            { name: req.query.project_name }
        )
        if (project.centralID === undefined) {
            console.log("could not find centralID of project you are looking for")
        }

        let publish = false

        if (req.query.publish === "true") {
            publish = true
        }






        console.log("saving form")
        const updated_form = await Form.updateOne(
            { name: "", project: "" },
            {
                formVersion: req.query.form_version
            }
        )

        // const formDataApi = await axios({
        //     url: apiURL + "/api/meta-data/form",
        //     method: "post",
        //     data: updated_form,
        //     headers: {
        //         'Authorization': req.header('Authorization')
        //     }
        // })

        res.status(200).send("Form successfully updated")

    } catch (err) {
        console.log(err)
        res.send(err)
    }

    return
})



router.post("/new", auth, async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")
    console.log("user: " + req.user._id)
    console.log("project_name: " + req.query.project_name)
    console.log("form_name: " + req.query.form_name)
    console.log("publish: " + req.query.publish)
    console.log("form_version: " + req.query.form_version)
    try {
        if (req.query.project_name === undefined |
            req.query.form_name === undefined |
            req.query.form_version === undefined |
            req.query.publish === undefined) {
            return res.status(400).send("Missing information in request")
        }

        // Check which project we are looking for

        const previous_projects = await Project.findOne({ name: req.query.project_name })
        console.log("previous_projects")

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
            res.status(400).send("There is already a form with this name in the database")
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


        // Add an app user and assign to project
        // https://private-709900-odkcentral.apiary-mock.com/v1/projects/projectId/app-users

        const appUserName = "data-collector-" + req.query.form_name
        const appUserCreation = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/app-users',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            data: {
                displayName: appUserName
            }
        })
            .catch(function (error) {
                throw error
            })

        const roleID = '2'
        const formID = req.query.form_name
        const appRoleAssignment = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/forms/' + req.query.form_name + '/assignments/' + roleID + '/' + appUserCreation.data.id,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        })
            .catch(function (error) {
                throw error
            })

        const draftDetails = await axios({
            method: "get",
            url: 'https://central.rhomis.cgiar.org/v1/projects/' + project_ID + '/forms/' + req.query.form_name + "/draft",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
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
            {
                $push: {
                    forms: req.query.form_name,
                    "roles.dataCollector": req.query.form_name,
                    "roles.analyst": req.query.form_name
                }
            });

        // Add form to forms collection
        console.log(req.query.project_name)
        console.log(centralResponse.data)

        const project = await Project.findOne(
            { name: req.query.project_name }
        )
        if (project.centralID === undefined) {
            console.log("could not find centralID of project you are looking for")
        }

        let publish = false

        if (req.query.publish === "true") {
            publish = true
        }

        const formInformation = {
            name: req.query.form_name,
            project: req.query.project_name,
            formVersion: req.query.form_version,
            users: [req.user._id],
            centralID: centralResponse.data.xmlFormId,
            draft: !publish,
            complete: false,
            collectionDetails: {
                general: {
                    server_url: "https://central.rhomis.cgiar.org/v1/key/" + appUserCreation.data.token + "/projects/" + project.centralID,
                    form_update_mode: "match_exactly",
                    autosend: "wifi_and_cellular"
                },
                project: { name: req.query.project_name },
            },
            draftCollectionDetails: {
                general: {
                    server_url: "https://central.rhomis.cgiar.org/v1/test/" + draftDetails.data.draftToken + "/projects/" + project.centralID + "/forms/" + req.query.form_name + "/draft",
                    form_update_mode: "match_exactly",
                    autosend: "wifi_and_cellular"
                },
                project: { name: "[Draft] " + req.query.form_name },
            }


        }

        console.log("formInformation")

        console.log(formInformation)

        // const formDataApi = await axios({
        //     url: apiURL + "/api/meta-data/form",
        //     method: "post",
        //     data: formInformation,
        //     headers: {
        //         'Authorization': req.header('Authorization')
        //     }
        // })

        console.log("saving form")
        savedForm = await new Form(formInformation)
        savedForm.save()

        updateAdmins()

        res.send("Form successfully created")

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