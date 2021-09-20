const auth = require("./verifyToken")
const router = require('express').Router()
const jwt = require('jsonwebtoken');
const axios = require('axios')


const cors = require("cors");
router.use(cors());
router.options("*", cors());


const User = require('../models/User');
const Project = require('../models/Project');
const Form = require('../models/Form');

const getCentralToken = require('./centralAuth')

// Create Project
router.post("/create", auth, async (req, res) => {
    // Authenticate for central server
    const central_token = await getCentralToken()

    // Make sure there is a "name" argument provided in the request
    if (!req.body.name) return res.send("Need to include project name to create project")

    // Check if project exists in local mongoDb
    const projectExist = await Project.findOne({ name: req.body.name })
    if (projectExist) return res.status(400).send('Project already exists, please select a different name')

    // Check if project exists in ODK central
    const projectResultCentral = await axios({
        url: 'https://' + process.env.CENTRAL_URL + "/v1/projects",
        method: "get",
        headers: {
            'Authorization': 'Bearer ' + central_token
        }
    })

    const projectExistsCentral = projectResultCentral.data.filter(project => project.name === req.body.name)
    if (projectExistsCentral.length > 0) return res.send("Project already exists in Central database. Please choose another project name")

    try {

        // Create a project on Central 
        const projectCreationResult = await axios({
            url: 'https://' + process.env.CENTRAL_URL + "/v1/projects",
            method: "post",
            data: {
                name: req.body.name
            },
            headers: {
                'Authorization': 'Bearer ' + central_token
            }
        })
        // Check if the request returned a project with the Central ID
        if (projectCreationResult.data.id === undefined) throw ("error in creating central project")

        // Save the new project in the database
        const savedProject = await new Project({
            name: req.body.name,
            centralID: projectCreationResult.data.id,
            users: [req.user._id]
        }).save()

        //LINK THE USER CREATING THE PROJECT, TO THEIR PROJECT
        // Finding user all user information
        const user = await User.findOne({ _id: req.user._id })

        // Assigning user to project
        const projectAssignmentResult = await axios({
            url: 'https://' + process.env.CENTRAL_URL + "/v1/projects/" + projectCreationResult.data.id + "/assignments/manager/" + user.centralID,
            method: "post",
            headers: {
                'Authorization': 'Bearer ' + central_token
            }
        })

        // const previous_projects = user.projects
        // previous_projects.push(req.body.name)
        const updated_user = await User.updateOne(
            { _id: req.user._id },
            { $push: { projects: req.body.name } });


        console.log(updated_user)

        return res.send("Project Saved")
    } catch (err) {
        return res.send(err)
    }
})

// Delete Project
router.delete("/delete", auth, async (req, res) => {
    const central_token = await getCentralToken()

    if (!req.body.name) return res.send("Need to include project name to create project")

    // Find project in database
    const project = await Project.findOne({ name: req.body.name })
    if (!project) return res.send("Project does not exist in database")

    // Check for project in ODK central

    const centralProjects = await axios({
        url: 'https://' + process.env.CENTRAL_URL + "/v1/projects",
        method: "get",
        headers: {
            'Authorization': 'Bearer ' + central_token
        }
    })

    const matchedProjects = centralProjects.data.filter(project => project.name == req.body.name)

    if (matchedProjects == 0) return res.send("Project does not exist in ODK central")
    if (matchedProjects > 1) return res.send("More than one project with this name")

    const centralID = matchedProjects[0].id

    try {
        // Delete the project on central
        console.log(centralID)
        const centralDeleteResult = await axios({
            url: 'https://' + process.env.CENTRAL_URL + "/v1/projects/" + centralID,
            method: "delete",
            headers: {
                'Authorization': 'Bearer ' + central_token
            }

        })


        // Delete forms associated with a project from the User collection
        const forms = await Form.find({}, "name -_id")
        const formsToDelete = forms.map((form) => form.name)

        const modifiedUsers = await User.updateMany(
            {},
            {
                $pull: {
                    forms: { $in: formsToDelete }
                }
            }
        )

        // Delete projects from the user collection
        const projectDeleteUser = await User.updateMany(
            {},
            { $pull: { projects: req.body.name } })


        // Delete forms associated with project from the forms collection
        const deletedForms = await Form.deleteMany({ project: req.body.name })
        console.log(deletedForms)

        // Delete the project from the database
        const projectToDelete = await Project.deleteOne({ name: req.body.name })

        return res.send(projectToDelete)

    } catch (err) {
        return res.send(err)
    }
})

// Assign user
router.post("/assign", auth, (req, res) => {
    const central_token = getCentralToken()

    res.send("")
})


// Assign user
router.post("/unassign", auth, (req, res) => {
    const central_token = getCentralToken()

    res.send("")
})



module.exports = router;