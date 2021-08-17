# RHoMIS 2.0 Authenticator

A JWT based authenticator for the RHoMIS 2 application. The central idea behind this application is that there is server secret. 

## Instructions

### Installation
Write these later 

###

There are seperate configuration files for production, development, and testing. This can be found in the `./config` folder. The "scripts" object in the `package.json` file has been modified to include scripts for running the production environment, the development environment, and the testing environment:

* `npm run start-prod` to run the production version of the server
* `npm run start-dev` to run the development version
* `npm run start-test` to run the test version

## To do

* Email based password reset

## Tutorials
* JWT authentication implemented using stips outlined in [this tutorial](https://www.youtube.com/watch?v=2jqok-WgelI&ab_channel=DevEd)

* Tutorial for testing [found here](https://www.digitalocean.com/community/tutorials/test-a-node-restful-api-with-mocha-and-chai)

* Tutorials on config [found here](https://www.npmjs.com/package/config)


# Other notes
* Could also consider using [Webauthn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API). See [Google reference for webauthn](https://developers.google.com/web/updates/2018/05/webauthn#authenticating_a_user)
