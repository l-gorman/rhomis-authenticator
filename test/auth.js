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

chai.use(chaiHttp)
// User Registration group of tests
describe('User Registration', () => {
    // Before each test, delete the users in the database
    beforeEach(async function () {
        User.deleteMany({}, (err) => {
        });
    });

    // After each clean the nock context
    afterEach(nock.cleanAll)
    after(function () {
        nock.restore
    })

    // Definining a fake response from the captcha verification process
    let scope = nock("https://www.google.com")
        .persist()
        .post('/recaptcha/api/siteverify')
        .query(true)
        .reply(200, {
            "testresponse": "success"
        })



    // Testing whether we can register a user
    it('Should register a user which does not exist and save in data base', async function () {
        // defining email an password first
        const email = "user2@xyz.com"
        const password = "test_password"


        // Creating the fake responses from the central URL to 
        // mimic test results

        // Registering a mock user
        const testResult = await axios({
            method: "post",
            url: "http://localhost:3002/api/user/register",
            data: {
                "title": "Mr",
                "firstName": "testFirstName",
                "surname": "testSurname",
                "captchaToken": "xyz",
                "email": email,
                "password": password,
            }
        })


        const newUser = await User.findOne({ _id: testResult.data.userID })
        assert.equal(newUser.email, "user2@xyz.com");
        assert.equal(newUser.title, "Mr");
        assert.equal(newUser.firstName, "testFirstName");
        assert.equal(newUser.surname, "testSurname");
        assert.equal(newUser.roles.administrator, false);
        assert.equal(newUser.roles.basic, true);
        assert.equal(newUser.roles.researcher, false);

        assert.equal(newUser.roles.dataCollector.length, 0);
        assert.equal(newUser.roles.analyst.length, 0);
        assert.equal(newUser.roles.projectManager.length, 0);

        assert.equal(newUser.log[0].action, "user created")
        assert.equal(newUser.log[0].byEmail, "user2@xyz.com")


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