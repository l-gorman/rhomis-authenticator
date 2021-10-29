// Environment information is set in the package.json
// To run tests enter command "npm run start-test"
const axios = require('axios')
// Set axios information to use standard http 
// to allow for the nock interceptor
axios.defaults.adapter = require('axios/lib/adapters/http')

// Load testing libraries
const nock = require('nock')
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should()
var assert = require('assert');

// Loading app information
let User = require('../models/User')
let index = require('../app')

chai.use(chaiHttp)

describe("Project management", () => {

    testProjectName = "test_project_name"
    testProjectDescription = "a slightly longer test description"

    let scope = nock('https://' + process.env.CENTRAL_URL)
        // Obtaining central authentication token
        .post('/v1/sessions', {
            email: process.env.CENTRAL_EMAIL,
            password: process.env.CENTRAL_PASSWORD
        })
        .reply(200, {
            "token": "1wGY8ahSXsa28AeECrPRht8VWOC7tLAP9EXE63tCvKqGaUdCW5Ae38F4RQ5y5u$O",
            "csrf": "$oTpzNLisrQ2JEKD4hAhfNHJf$Bwfb4gIW4eJB7soWwUIJeu4$jdnI4hFSZg0zo3",
            "expiresAt": "2021-09-28T15:49:14.634Z",
            "createdAt": "2021-09-27T15:49:14.635Z"
        })
        // Getting the list of users from ODK central
        .get('/v1/projects')
        .matchHeader('Authorization', 'Bearer 1wGY8ahSXsa28AeECrPRht8VWOC7tLAP9EXE63tCvKqGaUdCW5Ae38F4RQ5y5u$O')
        .reply(200,
            [
                {
                    "id": 1,
                    "name": "Default Project",
                    "archived": null,
                    "keyId": null,
                    "createdAt": "2021-04-29T15:41:56.869Z",
                    "updatedAt": null
                },
                {
                    "id": 2,
                    "name": "second Project",
                    "archived": null,
                    "keyId": null,
                    "createdAt": "2021-04-29T15:41:56.869Z",
                    "updatedAt": null
                },
                {
                    "id": 3,
                    "name": "third Project",
                    "archived": null,
                    "keyId": null,
                    "createdAt": "2021-04-29T15:41:56.869Z",
                    "updatedAt": null
                }
            ]
        )
        // Adding a user to the central database
        .post('/v1/projects', {
            name: testProjectName
        })
        .matchHeader('Authorization', 'Bearer 1wGY8ahSXsa28AeECrPRht8VWOC7tLAP9EXE63tCvKqGaUdCW5Ae38F4RQ5y5u$O')
        .reply(200,
            {
                "id": 4,
                "name": testProjectName,
                "acteeId": "0708f282-8f63-4577-88af-4bc575441582",
                "createdAt": "2021-10-29T09:41:25.779Z",
                "updatedAt": null,
                "deletedAt": null,
                "archived": null,
                "keyId": null
            }
        )


    it("Create project for the correct user", async function () {



    })
})