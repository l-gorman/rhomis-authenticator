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

        // defining email an password first
        const email = "user2@xyz.com"
        const password = "test_password"




        // Creating the fake responses from the central URL to 
        // mimic test results


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
        assert.equal(newUser.roles.administrator, false);
        assert.equal(newUser.roles.basic, true);
        assert.equal(newUser.roles.researcher, false);

        assert.equal(newUser.roles.dataCollector.length, 0);
        assert.equal(newUser.roles.projectAnalyst.length, 0);
        assert.equal(newUser.roles.projectManager.length, 0);


        should.exist(newUser.projects);
        should.exist(newUser.forms);
        should.exist(newUser._id);
        should.exist(newUser.createdAt);
        should.exist(newUser.__v);

        await User.deleteOne({ _id: testResult.data.userID })

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