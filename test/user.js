
// No longer need to set the node environment to test as I do this when running the 
// test scripts anyways
//process.env.NODE_ENV = 'test';

let mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

let User = require('../models/User')

// Require the dev dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let index = require('../index')
let should = chai.should()

chai.use(chaiHttp)

// Parent Block
describe('Users', () => {
    // Specifying something to  be done before each test
    // In this case we are cleaning up the database
    beforeEach((done) => {
        User.deleteMany({}, (err) => {
            done()
        });
    });

    // Testing the user registration
    describe('/POST user', () => {
        it('It should register a new user, check the token, then make a request to private route', (done) => {
            chai.request(index)
                // Make the request
                .post('/api/user/register')
                // Send the details of the user to register
                .send({
                    username: "test user abc",
                    email: "testemail@randomemailprovider.com",
                    password: "testpassword123"
                })
                // Then we get a response from the endpoint
                .end((err, res) => {
                    res.should.have.status(201); // This should be the response status

                    // Once the user is registered, we need to log them in
                    chai.request(index)
                        .post('/api/user/login')
                        // Send the same details for login
                        .send({
                            email: "testemail@randomemailprovider.com",
                            password: "testpassword123"
                        })
                        //Then we get a response from the endpoint
                        .end((err, res) => {
                            res.should.have.status(200); // This should be the response status

                            // Verifying that the username decoded by JWT equals the one which was sent
                            let token = res.headers.authorization;
                            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
                            verified.username.should.equal("test user abc")
                            chai.request(index)
                                .get('/api/private/username')
                                .set('Authorization', token)
                                .end(function (error, response) {
                                    response.should.have.status(200);
                                    response.body.should.have.property('id');
                                    response.body.should.have.property('username');
                                    response.body.username.should.equal('test user abc');
                                    done();

                                })


                        })

                })
        })
    })
})