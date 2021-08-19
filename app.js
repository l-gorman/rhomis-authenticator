

const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose')
// Import Routes
const authRoute = require('./routes/auth')
const privateRoute = require('./routes/privateRoute')

// Getting information from the config files
let config = require('config'); //we load the db location from the JSON files

console.log('Running "' + config.util.getEnv('NODE_ENV') + '" environment')
const dbHost = config.get('dbConfig.host')
const port = config.get('dbConfig.port')
dotenv.config()

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
// Add this to allow us to use post requests with JSON
app.use(express.json())

// Route Middlewares
app.use('/api/user', authRoute)
app.use('/api/private', privateRoute)

app.listen(port, () => console.log('Server up and running on port ' + port))

module.exports = app; // This needs to be exported for testing