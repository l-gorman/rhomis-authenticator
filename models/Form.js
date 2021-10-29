const mongoose = require('mongoose');



const formSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    project: {
        type: String,
    },
    users: {
        type: Object,
    },
    metadata: {
        type: Object,
    },
    centralID: {
        type: String,
    },
    formVersion: {
        type: String,
    },
    draft: {
        type: Boolean,
    },
    complete: {
        type: Boolean,
    },
    date: {
        type: Date,
        default: Date.now
    },
    collectionURL: {
        type: String
    }

})

module.exports = mongoose.model('Form', formSchema)