const express = require('express');
const router = express.Router();
const dbObjects = require('../utils/dbObjects')
const dbFunctions = require('../utils/dbFunctions');
const catchAsync = require('../utils/catchAsync');
const { carSchema } = require('../utils/schemas');
const AppError = require('../utils/appError');
//middleware test
const checkLogin = (req, res, next) => {
    if (true) {
        console.log('entered middleware')
        next();
    }
}

//middleware joi validation
const validateCar = (req, res, next) => {
    const { error } = carSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(error.message, '400');
    }
    else {
        next();
    }
}
//Customer
router.get('/mycars', catchAsync(async (req, res) => {
    // if (isLoggedIn) {
    const cars = await dbFunctions.getRentedCarsByPerson(currentLoggedInUserPersonInfo.personID)
    const carsArray = cars.recordset;
    // res.render('mycars', { carsArray, isLoggedIn });
    res.render('mycars', { carsArray });
    // } else res.render('mycars', { isLoggedIn });
}))


//Employee
//Add a new car
router.get('/new', catchAsync(async (req, res) => {
    // if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
    //     console.log('employee can login')
    // res.render('newCar', { isLoggedIn })
    res.render('cars/newCar')
    // }
    // else {
    //     res.render('nopermission', { isLoggedIn })
    // }
}))


//Get All Cars
router.get('/', checkLogin, catchAsync(async (req, res) => {
    // if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
    //     console.log('employee can login')
    //     const cars = await dbFunctions.getAllCars();
    //     res.render('cars/cars', { cars, isLoggedIn });
    // }
    // else {
    //     res.render('nopermission', { isLoggedIn })
    // }
    const cars = await dbFunctions.getAllCars();
    // res.render('cars/cars', { cars, isLoggedIn });
    res.render('cars/index', { cars });
}))

//Post a new car
router.post('/', validateCar, catchAsync(async (req, res) => {
    const carModel = new dbObjects.CarModel({ ...req.body })
    const carModelID = dbFunctions.insertNewCarModel(carModel);
    console.log(carModelID);
    req.flash('success', 'successfully added a new car')
    setTimeout(() => res.redirect('/cars'), 500);
}))
//Get One Car
router.get('/:id', catchAsync(async (req, res) => {
    // if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
    const car = await dbFunctions.getOneCar(req.params.id);
    const cars = [car];
    // res.render('cars', { cars, isLoggedIn });
    res.render('cars/show', { cars });
    // }
    // else {
    //     res.render('nopermission', { isLoggedIn })
    // }
}))
//Edit One Car
router.get('/:id/edit', catchAsync(async (req, res) => {
    const car = await dbFunctions.getOneCar(req.params.id);
    // res.render('editCar', { car, isLoggedIn })
    res.render('cars/editCar', { car })

}))

router.patch('/:id', validateCar, catchAsync(async (req, res) => {
    const editedCar = new dbObjects.CarModel({ ...req.body })
    await dbFunctions.editCarModel(editedCar);
    setTimeout(() => { res.redirect('/cars') }, 500)
}))


//Delete One Car
router.delete('/:id', catchAsync(async (req, res) => {
    const carModelID = req.params.id;
    await dbFunctions.deleteOneCarModel(carModelID);
    res.redirect('/cars')
}))




module.exports = router;