const Joi = require('joi');
module.exports.carSchema = Joi.object({
    CarModelID: Joi.number(),
    Name: Joi.string().required(),
    Manufacturer: Joi.string().required(),
    Country: Joi.string().required(),
    Year: Joi.number().min(1899).required(),
    BHP: Joi.number().min(0).required(),
    NbOfSeats: Joi.number().min(0).required(),
    NbCarsLeft: Joi.number().min(0).required(),
    EngineType: Joi.string().required(),
    Emissions: Joi.number().min(0).required(),
    Torque: Joi.number().min(0).required(),
    image:Joi.string().required()


});

module.exports.personSchema = Joi.object({
    FN: Joi.string().required(),
    LN: Joi.string().required(),
    DOB: Joi.string().required(),
    address: Joi.string().required(),
    password: Joi.string().required(),
    username:Joi.string().required(),
    subscriptionTypeSelect: Joi.allow(),
    personType: Joi.string()

});

module.exports.loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),

})