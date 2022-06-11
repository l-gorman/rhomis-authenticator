class HttpError extends Error {
    constructor(message, status) {
        super(message); //pass message to the parent Error class
        this.status = status ?? 500 //set the status so Express can read it
    } 
}

module.exports = {HttpError}