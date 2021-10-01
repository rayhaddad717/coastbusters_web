const Car = require('../models/car');
const { ref } = require('joi');
const Person = require('../models/person');
module.exports.addNewCar = async (req, res) => {
    const carModel = new Car({ ...req.body })
    const carModelID = Car.insertNewCarModel(carModel);
    req.flash('success', 'successfully added a new car')
    setTimeout(() => res.redirect('/cars'), 500);
};

module.exports.editCar = async (req, res) => {
    const editedCar = new Car({ ...req.body })
    await Car.editCarModel(editedCar);
    setTimeout(() => { res.redirect('/cars') }, 500)
};

module.exports.deleteCar = async (req, res) => {
    const carModelID = req.params.id;
    await Car.deleteOneCarModel(carModelID);
    res.redirect('/cars')
};
module.exports.showOneCar = async (req, res) => {
    const car = await Car.getOneCar(req.params.id);
    if (car === null) {
        req.flash('warning', 'cant find car');
        res.redirect('/');
    } else {
        const cars = [car];
        res.render('cars/show', { cars });
    }
};

module.exports.getAvailableCars = async (req, res) => {
    const cars = await Car.getAvailableCarsFromCarModelID(req.params.id);

    res.send({ cars });
};
const Subscription = require('../models/subscription')
module.exports.rentCar = async (req, res) => {


    if (req.isAuthenticated()) {

        const { CarID } = req.params;
        const { PersonID } = req.user;
        const person = await Person.getPersonInfo(PersonID);
        const maxAllowedCars = await Subscription.getNbOfAllowedCars(person.subscriptionID);
        if (person.nbOfRentedCars < maxAllowedCars) {
            await Car.rentCar(CarID, PersonID);
            res.send('ok').status(200);
        } else {
            res.send('cant rent any more cars').status(200);
        }
    }
    else { res.send('not loggedIn').status(200) }
}

module.exports.returnCar = async (req, res) => {
    const { CarID } = req.params;
    const { PersonID } = req.user;
    await Car.returnCar(CarID, PersonID);
    res.send('ok').status(200);

}

module.exports.addAvailableCar = async (req, res) => {
    const carModelID = req.params.id;
    const imageURL = req.file.path;
    const car = { ...req.body, imageURL };
    await Car.addAvailableCar(carModelID, car);
    res.redirect(`/cars/${carModelID}`);
}