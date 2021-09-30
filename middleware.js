const { personSchema, loginSchema,carSchema } = require('./utils/schemas');

module.exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
    next();}
    else{
        req.flash('error','you need to login first');
        res.redirect('/accounts/login');
    }
}
//login validation middleware if needed later
module.exports.validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, '400');
    }
    next();
}

//person validation middleware
module.exports.validatePerson = (req, res, next) => {
    const { error } = personSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, '400');
    }
    next();
};

//middleware joi validation
module.exports.validateCar = (req, res, next) => {
    const { error } = carSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(error.message, '400');
    }
    else {
        next();
    }
}
