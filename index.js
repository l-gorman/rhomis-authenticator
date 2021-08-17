

const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose')
// Import Routes
const authRoute = require('./routes/auth')
const privateRoute = require('./routes/privateRoute')
dotenv.config()

// Connect to DB
mongoose.connect(process.env.MONGO_URL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    () => {
        console.log("Connected to DB")
    })

// Middleware
// Add this to allow us to use post requests with JSON
app.use(express.json())

// Route Middlewares
app.use('/api/user', authRoute)
app.use('/api/private', privateRoute)

app.listen(process.env.PORT, () => console.log('Server up and running'))