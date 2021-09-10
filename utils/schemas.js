const Joi = require('joi');
module.exports.carSchema = Joi.object({
    Name: Joi.string().required(),
    Manufacturer: Joi.string().required(),
    Country: Joi.string().required(),
    Year: Joi.number().min(1899).required(),
    BHP: Joi.number().min(0).required(),
    NbOfSeats: Joi.number().min(0).required(),
    NbCarsLeft: Joi.number().min(0).required(),
    EngineType: Joi.string().required(),
    EngineType: Joi.number().min(0).required(),
    Torque: Joi.number().min(0).required()


});

module.exports.personSchema = Joi.object({
    FN: Joi.string().required(),
    LN: Joi.string().required(),
    DOB: Joi.date().required(),
    address: Joi.string().required(),
    password: Joi.string().required(),
    subscriptionTypeSelect: Joi.allow(),
    personType: Joi.string()

});

module.exports.loginSchema = Joi.object({
    loginID: Joi.number().required().min(0),
    password: Joi.string().required()
})