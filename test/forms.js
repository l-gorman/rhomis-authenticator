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

describe("Form Management", () => {
    it("Should create a new form for a particular user", async function () {

    })
})