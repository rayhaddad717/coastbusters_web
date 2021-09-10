const express = require('express');
const flash = require('connect-flash')

const AppError = require('../utils/appError');
const router = express.Router();
const dbObjects = require('../utils/dbObjects')
const dbFunctions = require('../utils/dbFunctions');
const { personSchema, loginSchema } = require('../utils/schemas');
const cookieParser = require('cookie-parser')
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
//Login
router.use(flash());

router.use(cookieParser('thisismysecret'))
router.get('/login', async (req, res, next) => {
    const queryString = req.query;
    //If the query string is empty it means i want the login page 
    if (Object.getOwnPropertyNames(queryString).length === 0) {
        res.render('accounts/login');
    }
    //else the query string has the loginid and password to login
    else {
        const { loginID, password } = queryString;
        const isCorrectPassword = await dbFunctions.checkLogin(loginID, password);
        if (isCorrectPassword) {
            isLoggedIn = true;
            const currentLoggedInUser = await dbFunctions.getLoginCredentialsInfo(loginID);
            req.session.isLoggedIn = true;
            req.session.loginID = loginID;
            req.session.personID = currentLoggedInUser.personID;

            req.flash('success', 'sucessfully logged in!')
            res.redirect('/')
        }
        else { next(new AppError('incorrect username/password', 404)) }
    }

})

//Logout
router.get('/logout', (req, res) => {
    isLoggedIn = false;
    currentLoggedInUser = undefined;
    currentLoggedInUserPersonInfo = undefined;
    currentLoggedInUseSubscription = undefined;
    req.session.isLoggedIn = false;
    res.redirect('/');
}
)

//Signup
router.get('/signup', async (req, res) => {
    res.render('accounts/signup')
})
router.post('/signup', validatePerson, async (req, res) => {
    try {
        const { FN, LN, DOB, address, personType, subscriptionTypeSelect, password } = req.body;
        const isCustomer = (personType === "customer" ? true : false);
        const info = { FN, LN, DOB, address, isCustomer, subscriptionTypeSelect, password };
        const result = await dbFunctions.insertNewLoginUsingPersonInfo(info);
        const newLogin = result[0];
        console.log(newLogin)
        req.session.isLoggedIn = true;
        req.session.personID = newLogin.personID;
        console.log(`this is the person id ${newLogin.personID}`)
        req.session.loginID = newLogin.loginID;
        req.flash('success', `successfully created a new account. Your loginID=${newLogin.loginID}`);
        res.redirect('/')
    }
    catch (e) {
        console.log(e);
    }
})
module.exports = router;
