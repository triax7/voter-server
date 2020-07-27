const Joi = require('joi')

const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(4).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required()
    })
    return schema.validate(data)
}

const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required()
    })
    return schema.validate(data)
}

const pollCreateValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(4).max(50).required(),
        options: Joi.array().min(2).items(Joi.string().max(30)),
        duration: Joi.date()
    })
    return schema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.pollCreateValidation = pollCreateValidation
