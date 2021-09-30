const bcrypt=require('bcrypt');
const Person = require('../models/person')
module.exports.signUp = async(req,res,next)=>{
    try {
        const { FN, LN, DOB, address, personType, subscriptionTypeSelect,username } = req.body;
        const hashedPassword=await bcrypt.hash(req.body.password,12);
        const isCustomer = (personType === "customer" ? true : false);
        const info = { FN, LN, DOB, address, isCustomer, subscriptionTypeSelect, hashedPassword,username };
        const result = await LoginCredential.insertNewLoginUsingPersonInfo(info);
        const newLogin = result[0];
        console.log(newLogin);
        const user=await LoginCredential.findByID(newLogin.loginID);
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            //if no error when loggin in
            req.flash('success', 'Welcome to coasbusters');
        });
        const person=await Person.getPersonInfo(req.user.PersonID);
        if(person.isCustomer){
        res.cookie('nbOfRentedCars',person.nbOfRentedCars,{signed:true});
        const nbAllowedCars= await Subscription.getNbOfAllowedCars(person.subscriptionID);
        res.cookie('nbOfAllowedCars',nbAllowedCars,{signed:true,overwrite:true});}
        req.flash('success', `successfully created a new account.');
        //Your loginID=${newLogin.loginID}`);
        res.redirect('/')
    }
    catch (e) {
        console.log(e);
    }
};

const loginCredentials = require('../models/loginCredentials');
const LoginCredential = require('../models/loginCredentials');
const Subscription = require('../models/subscription');
module.exports.login = async function(req, res) {
    const currentLoggedInUser = await loginCredentials.getLoginCredentialsInfo(req.user.loginID);
        req.session.personID = currentLoggedInUser.personID;
        const person = await Person.getPersonInfo(currentLoggedInUser.personID);
        if(person.isCustomer){
            res.cookie('nbOfRentedCars',person.nbOfRentedCars,{signed:true,overwrite:true});
            const nbAllowedCars=await Subscription.getNbOfAllowedCars(person.subscriptionID);
            res.cookie('nbOfAllowedCars',nbAllowedCars,{signed:true});}

        req.flash('success','logged you in')
    res.redirect('/');
};