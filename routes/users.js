const express = require('express');
const router = express.Router();
const dbFunctions = require('../utils/dbFunctions');
const middleware= require('../middleware');
router.use(middleware.isLoggedIn);
router.get('/', async (req, res) => {

    const logins = await dbFunctions.getAllLogins();
    res.render('users/users', { logins })
});

router.get('/:id', async (req, res) => {
    if(req.user.isCustomer){
        if(req.params.id!== res.locals.currentPerson.PersonID){
            req.flash('warning','you can only view you profile');
        }
        res.render('users/showPerson',{person:res.locals.currentPerson});
    }else{
    const person = await dbFunctions.getPersonInfo(req.params.id);
    if(person === null){
        req.flash('warning','cant find user');
        res.redirect('/');
    }else
    {res.render('users/showPerson', { person })}}
})

module.exports = router;