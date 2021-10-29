// VALIDATION
const Joi = require('@hapi/joi');

const registrationValidator = (data) => {
    const schema = Joi.object({
        email: Joi.string().
            min(6).
            required().
            email(),
        password: Joi.string().
            min(6).
            required(),

    })

    return schema.validate(data)
}

module.exports.registrationValidator = registrationValidator;

// VALIDATION

const loginValidator = (data) => {
    const schema = Joi.object({
        email: Joi.string().
            min(6).
            required().
            email(),
        password: Joi.string().
            min(6).
            required(),
    })

    return schema.validate(data)
}

// PROJECT

const projectValidator = data =>{
    const schema = joi.object({
        name: Joi.string().
        min(3).
        required(),

        description: Joi.string().
        min(25).
        required()
    })
}

module.exports.loginValidator = loginValidator;




