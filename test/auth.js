
// No longer need to set the node environment to test as I do this when running the 
// test scripts anyways
//process.env.NODE_ENV = 'test';
const axios = require('axios')
axios.defaults.adapter = require('axios/lib/adapters/http')

const nock = require('nock')

let User = require('../models/User')

// Require the dev dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let index = require('../app')
let should = chai.should()
var assert = require('assert');
// const mocha = require('mocha')
// const afterAll = mocha.afterAll()
// const afterEach = mocha.afterEach()



chai.use(chaiHttp)
// Parent Block
describe('Users', () => {
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
    it('should register a user which does not exist andsave in data base', async function () {

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


        // console.log("new user")

        // console.log(newUser)

        // {
        //     _id: 61530298f14bd5230de5742c,
        //     email: 'user2@xyz.com',
        //     centralID: 226,
        //     password: '$2a$10$n4QbqTzxGYn/hFN7DRpfKeavRcwJ5nl51Hzys7ZP6VCiwuG1NXxou',
        //     role: 'project',
        //     projects: [],
        //     forms: [],
        //     createdAt: 2021-09-28T11:55:04.909Z,
        //     __v: 0
        //   }

        assert.equal(newUser.email, "user2@xyz.com");
        assert.equal(newUser.centralID, 226);
        assert.equal(newUser.role, "project");


    })



})