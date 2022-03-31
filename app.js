const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')

const dotenv = require('dotenv')


function getEnvFile(nodeEnv) {
    if (process.env.NODE_ENV === "test") {
        return ".env.test"
    } else {
        return ".env"
    }
}

var envFile = getEnvFile(process.env.NODE_ENV)
console.log("env file")
console.log(envFile)
console.log(process.env.NODE_ENV)


dotenv.config({ path: envFile })




// console.log(process.env.RECAPTCHA_SECRET_KEY)

// Import Routes
const authRoute = require('./routes/auth')
const projectsRoute = require('./routes/projects')
const formRoute = require('./routes/forms')
const metaDataRoute = require('./routes/metaData')
const adminRoute = require('./routes/makeAdmin').router
const testEmailRoute = require('./routes/email-test')
const odkChoicesRoute = require('./routes/odkChoices')

// Rate limiting
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use(apiLimiter);



// Getting information from the config files
let config = require('config'); //we load the db location from the JSON files

console.log('Running "' + config.util.getEnv('NODE_ENV') + '" environment')
let dbHost = config.get('dbConfig.host')
let port = config.get('dbConfig.port')

console.log(config.get('dataAPI.url'))


var connectWithRetry = function () {
    console.log("Connecting to datase")
    return mongoose.connect(dbHost, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec \n ', err);
            setTimeout(connectWithRetry, 5000);
        }
    });

}
connectWithRetry()

const db = mongoose.connection;
db.once("open", (_) => {
    console.log("Database connected:", dbHost);
});
// Ensuring that queries are not limited by size
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
// Add this to allow us to use post requests with JSON
app.use(express.json())

// Route Middlewares
app.use('/api/user/', authRoute)
app.use('/api/projects/', projectsRoute)
app.use('/api/forms/', formRoute)
app.use('/api/meta-data/', metaDataRoute)
app.use('/api/admin/', adminRoute)
// Using the reate limiting
app.use("/api/user", apiLimiter);
app.use("/api/email-test", testEmailRoute)
app.use("/api/odk-choices/", odkChoicesRoute)

app.get('/', function (req, res) {
    res.send("Welcome to RHoMIS Authenticator")
})

app.listen(port, () => console.log('Server up and running on port ' + port))


const initAdmin = require('./routes/makeAdmin').initAdmin
initAdmin()


module.exports = app; // This needs to be exported for testing
