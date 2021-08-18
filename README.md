# RHoMIS 2.0 Authenticator

A JWT based authenticator for the RHoMIS 2 application. The central idea behind this application is that there is server has a "secret". When users are registered they give a username, their email, and a password. The password are hashed using bcrypt.

When a user wants to login, they submit their email and password to the server. We check if that email exists. Then we compare the incoming password with the hashed password using bcrypt. If the password is correct, a token is generated. This token is 'digitally signed'. Meaning we pass information in the token that includes information about the user (e.g. username and user_id). This token is then

## Instructions

### Installation
Write these later 

### Running the aaplication

There are seperate configuration files for production, development, and testing. This can be found in the `./config` folder. The "scripts" object in the `package.json` file has been modified to include scripts for running the production environment, the development environment, and the testing environment:

* `npm run start-prod` to run the production version of the server
* `npm run start-dev` to run the development version
* `npm run start-test` to run the test version

## To do

* Email based password reset

## Tutorials
* JWT authentication implemented using stips outlined in [this tutorial](https://www.youtube.com/watch?v=2jqok-WgelI&ab_channel=DevEd)

* Tutorial for testing [found here](https://www.digitalocean.com/community/tutorials/test-a-node-restful-api-with-mocha-and-chai) and [here](https://buddy.works/tutorials/unit-testing-jwt-secured-node-and-express-restful-api-with-chai-and-mocha
). I relied on the second one the most.

* Tutorials on config [found here](https://www.npmjs.com/package/config)


# Other notes
* Could also consider using [Webauthn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API). See [Google reference for webauthn](https://developers.google.com/web/updates/2018/05/webauthn#authenticating_a_user)
