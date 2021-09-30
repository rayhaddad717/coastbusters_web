const express = require('express');
const router = express.Router();
const dbFunctions = require('../utils/dbFunctions');
const catchAsync = require('../utils/catchAsync');
const { carSchema } = require('../utils/schemas');
const AppError = require('../utils/appError');
const cars = require('../controllers/cars');
const middleware = require('../middleware');



router.delete('/return/:CarID', catchAsync(cars.returnCar))
const Car = require('../models/car')
//Customer
router.get('/mycars', middleware.isLoggedIn, catchAsync(async (req, res) => {
    const carsArray = await Car.getRentedCarsByPerson(req.user.PersonID)
   
    res.render('cars/mycars', { carsArray });
}))


//Employee
//Add a new car
router.get('/new', catchAsync(async (req, res) => {
    res.render('cars/newCar');
}))

const { storage, a } = require('../cloudinary/index');
const multer = require('multer');
const upload = multer({ storage });
router.route('/')
    //Get All Cars
    .get(catchAsync(async (req, res) => {
        const cars = await Car.getAllCars();
        res.render('cars/index', { cars });
    }))

    //Post a new car
    .post(middleware.validateCar, catchAsync(cars.addNewCar));

router.get('/rent/:CarID', catchAsync(cars.rentCar))
router.get('/getAvailableCars/:id',cars.getAvailableCars);

router.route('/:id')
    //Get One Car
    .get(catchAsync(cars.showOneCar))
    //edit one car
    .patch(middleware.validateCar, catchAsync(cars.editCar))

    //Delete One Car
    .delete(catchAsync(cars.deleteCar));
//Edit One Car
router.get('/:id/edit', catchAsync(async (req, res) => {
    const car = await Car.getOneCar(req.params.id);
    res.render('cars/editCar', { car })

}))

router.route('/:id/addAvailableCar')
    .get((req, res) => {
        res.render('cars/addAvailableCar',{carModelID:req.params.id});
    })
    //add new available car
    .post(upload.single('image'), catchAsync(cars.addAvailableCar));









module.exports = router;