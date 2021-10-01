const express = require('express');
const flash = require('connect-flash')
const AppError = require('../utils/appError');
const router = express.Router();
const dbFunctions = require('../utils/dbFunctions');
const { personSchema, loginSchema } = require('../utils/schemas');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')
const middleware = require('../middleware')

router.route('/login')
    .all(middleware.alreadyLoggedIn)
    .get((req, res, next) => {
        res.render('accounts/login')
    }).post(middleware.validateLogin, passport.authenticate('local-login', { failureMessage: true, failureRedirect: '/accounts/login', failureFlash: true }),
        catchAsync(users.login));

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'logged you out');
    res.redirect('/');
})
router.route('/signup')
    .all(middleware.alreadyLoggedIn)
    .get((req, res) => {
        res.render('accounts/signup')
    })
    .post(middleware.validatePerson, catchAsync(users.signUp));
module.exports = router;
