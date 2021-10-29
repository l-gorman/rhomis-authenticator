const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    forms: {
        type: Object,
    },
    users: {
        type: Object,
    },
    metadata: {
        type: Object,
    },
    centralID: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
})

module.exports = mongoose.model('Project', projectSchema)