const express = require('express');
const router = express.Router();
const middleware= require('../middleware');
router.use(middleware.isLoggedIn);
router.get('/', async (req, res) => {

    const logins = await LoginCredential.getAllLogins();
    res.render('users/users', { logins })
});
const Person = require('../models/person');
const LoginCredential = require('../models/loginCredentials');
router.get('/:id', async (req, res) => {
    if(req.user.isCustomer){
        if(req.params.id!== res.locals.currentPerson.PersonID){
            req.flash('warning','you can only view you profile');
        }
        res.render('users/showPerson',{person:res.locals.currentPerson});
    }else{
    const person = await Person.getPersonInfo(req.params.id);
    if(person === null){
        req.flash('warning','cant find user');
        res.redirect('/');
    }else
    {res.render('users/showPerson', { person })}}
})

module.exports = router;