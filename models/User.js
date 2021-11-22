const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    title: {

        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },

    roles: {
        type: Object,
        // required: true,
        min: 6,
        max: 1024,
    },
    passwordResetKey: {
        type: Number,
        min: 6,
        max: 1024,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
    projects: {
        type: Object,
    },
    forms: {
        type: Object,
    },
    log: {
        type: Object
    }
})

module.exports = mongoose.model('User', userSchema)