const express = require('express');
const flash = require('connect-flash')

const AppError = require('../utils/appError');
const router = express.Router();
const dbObjects = require('../utils/dbObjects')
const dbFunctions = require('../utils/dbFunctions');
const { personSchema, loginSchema } = require('../utils/schemas');
const cookieParser = require('cookie-parser');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const bcrypt=require('bcrypt');

//person validation middleware
const validatePerson = (req, res, next) => {
    const { error } = personSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, '400');
    }
    next();
};

//login validation middleware if needed later
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, '400');
    }
    next();
}
router.get('/login',(req,res,next)=>{
    res.render('accounts/login')
})

router.post('/login',validateLogin,passport.authenticate('local-login', {failureMessage:true, failureRedirect: '/accounts/login',failureFlash:true }),
    async function(req, res) {
        const currentLoggedInUser = await dbFunctions.getLoginCredentialsInfo(req.user.loginID);
            req.session.personID = currentLoggedInUser.personID;
        res.redirect('/');
    });

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success', 'logged you out');
    res.redirect('/');
})
module.exports=router;
router.get('/signup',(req,res)=>{
    res.render('accounts/signup')
})
router.post('/signup',validatePerson,async(req,res,next)=>{
    try {
        const { FN, LN, DOB, address, personType, subscriptionTypeSelect,username } = req.body;
        const hashedPassword=await bcrypt.hash(req.body.password,12);
        const isCustomer = (personType === "customer" ? true : false);
        const info = { FN, LN, DOB, address, isCustomer, subscriptionTypeSelect, hashedPassword,username };
        const result = await dbFunctions.insertNewLoginUsingPersonInfo(info);
        const newLogin = result[0];
        console.log(newLogin);
        const user=await dbFunctions.findByID(newLogin.loginID);
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            //if no error when loggin in
            req.flash('success', 'Welcome to coasbusters');
        });
        req.flash('success', `successfully created a new account.');
        //Your loginID=${newLogin.loginID}`);
        res.redirect('/')
    }
    catch (e) {
        console.log(e);
    }
})