const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

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
    centralID: {
        type: Number,

    },
    role: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    passwordResetKey: {
        type: Number,
        required: true,
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
})

module.exports = mongoose.model('User', userSchema)