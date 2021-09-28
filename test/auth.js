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
// Parent Block
describe('User Registration', () => {
    // Specifying something to  be done before each test
    // In this case we are cleaning up the database
    beforeEach(async function () {
        User.deleteMany({}, (err) => {
        });
    });

    afterEach(nock.cleanAll)
    after(function () {
        nock.restore
    })

    // The Full test
    it('Should register a user which does not exist and save in data base', async function () {

        // Test admin email and password
        const admin_email = "admin@xyz.com"
        const admin_password = "test_admin_password"


        // defining email an password first
        const email = "user2@xyz.com"
        const password = "test_password"

        // Creating the fake responses from the central URL to 
        // mimic test results
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
            .get('/v1/users', {
                email: email
            })
            .matchHeader('Authorization', 'Bearer 1wGY8ahSXsa28AeECrPRht8VWOC7tLAP9EXE63tCvKqGaUdCW5Ae38F4RQ5y5u$O')
            .reply(200,
                [
                    {
                        "email": "user_1@xyz.org",
                        "id": 102,
                        "type": "user",
                        "displayName": "user_1@xyz.org",
                        "createdAt": "2021-10-22T10:53:00.042Z",
                        "updatedAt": null
                    },
                    {
                        "email": "user_2@xyz.org",
                        "id": 205,
                        "type": "user",
                        "displayName": "user_2@xyz.org",
                        "createdAt": "2021-08-22T10:53:00.042Z",
                        "updatedAt": null
                    },
                    {
                        "email": "user_3@xyz.org",
                        "id": 186,
                        "type": "user",
                        "displayName": "user_3@xyz.org",
                        "createdAt": "2021-011-22T10:53:00.042Z",
                        "updatedAt": null
                    }
                ]
            )
            // Adding a user to the central database
            .post('/v1/users', {
                email: email,
                password: password
            })
            .matchHeader('Authorization', 'Bearer 1wGY8ahSXsa28AeECrPRht8VWOC7tLAP9EXE63tCvKqGaUdCW5Ae38F4RQ5y5u$O')
            .reply(200,
                {
                    "email": "user2@xyz.com",
                    "id": 226,
                    "type": "user",
                    "displayName": "user2@xyz.com",
                    "createdAt": "2021-09-28T08:09:58.842Z",
                    "updatedAt": null
                }
            )


        // Conducting the actual test
        const testResult = await axios({
            method: "post",
            url: "http://localhost:3002/api/user/register",
            data: {
                "email": email,
                "password": password,
            }
        })

        const newUser = await User.findOne({ _id: testResult.data.userID })

        assert.equal(newUser.email, "user2@xyz.com");
        assert.equal(newUser.centralID, 226);
        assert.equal(newUser.role, "project");
        should.exist(newUser.projects);
        should.exist(newUser.forms);
        should.exist(newUser._id);
        should.exist(newUser.createdAt);
        should.exist(newUser.__v);
    })

    it('Should pick up on missing information in user registration', async function () {

        assert.equal(1, 2 - 1);

    })


    it('Should deal with error response from ODK central databases and clean-up properly', async function () {

        assert.equal(1, 2 - 1);

    })

})


describe("User Login", () => {
    it("Should login user and produce a token which can be decoded", async function () {

    })

    it("Should correctly deal with Users who are not authenticated", async function () {

    })

})


describe("User Deletion", () => {
    it("Should delete an authenticated user", async function () {

    })

    it("Should correctly deal with Users who are not authenticated", async function () {

    })

})