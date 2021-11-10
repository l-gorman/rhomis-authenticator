const express = require('express');
const app = express();
const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')

// Import Routes
const authRoute = require('./routes/auth')
const projectsRoute = require('./routes/projects')
const formRoute = require('./routes/forms')
const metaDataRoute = require('./routes/metaData')



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
const dbHost = config.get('dbConfig.host')
const port = config.get('dbConfig.port')

// Connect to DB
mongoose.connect(dbHost,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    () => {
        console.log("Connected to " + dbHost)
    })

// Ensuring that queries are not limited by size
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Middleware
// Add this to allow us to use post requests with JSON
app.use(express.json())

// Route Middlewares
app.use('/api/user/', authRoute)
app.use('/api/projects/', projectsRoute)
app.use('/api/forms/', formRoute)
app.use('/api/meta-data/', metaDataRoute)

// Using the reate limiting
app.use("/api/user", apiLimiter);

app.get('/', function (req, res) {
    res.send("Welcome to RHoMIS Authenticator")
})

app.listen(port, () => console.log('Server up and running on port ' + port))

module.exports = app; // This needs to be exported for testing
