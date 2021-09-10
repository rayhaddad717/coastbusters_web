const express = require('express');
const AppError = require('../utils/appError');
const router = express.Router();
const dbObjects = require('../utils/dbObjects')
const dbFunctions = require('../utils/dbFunctions');
const { personSchema, loginSchema } = require('../utils/schemas');
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
router.get('/login', async (req, res) => {
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
            res.redirect('/')
        }
        else { res.send('Invalid username/password') }
    }

})

//Logout
router.get('/logout', (req, res) => {
    isLoggedIn = false;
    currentLoggedInUser = undefined;
    currentLoggedInUserPersonInfo = undefined;
    currentLoggedInUseSubscription = undefined;
    res.redirect('/');
}
)

//Signup
router.get('/signup', async (req, res) => {
    res.render('accounts/signup')
})
router.post('/signup', validatePerson, async (req, res) => {

    const { FN, LN, DOB, address, personType, subscriptionTypeSelect, password } = req.body;
    const isCustomer = (personType === "customer" ? true : false);
    const info = { FN, LN, DOB, address, isCustomer, subscriptionTypeSelect, password };
    const result = await dbFunctions.insertNewLoginUsingPersonInfo(info);
    // [currentLoggedInUser, currentLoggedInUserPersonInfo, currentLoggedInUseSubscription] = result;
    // isLoggedIn = true;
    res.redirect('/')
});
module.exports = router;
