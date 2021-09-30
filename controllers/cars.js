const Car = require('../models/car');
const { ref } = require('joi');
module.exports.addNewCar = async (req, res) => {
    const carModel = new Car({ ...req.body})
    const carModelID = Car.insertNewCarModel(carModel);
    console.log(carModelID);
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
    const nbCarsCanStillRent = req.signedCookies.nbOfAllowedCars - req.signedCookies.nbOfRentedCars;
    const car = await Car.getOneCar(req.params.id);
    if(car === null){
        req.flash('warning','cant find car');
        res.redirect('/');
    }else{
    const cars = [car];
    res.render('cars/show', { cars, nbCarsCanStillRent });}
};

module.exports.getAvailableCars = async (req, res) => {
    console.log('entered getAvailable Cars');
    const cars = await Car.getAvailableCarsFromCarModelID(req.params.id);

    res.send({ cars });
};

module.exports.rentCar = async (req, res) => {
    const { CarID } = req.params;
    const { PersonID } = req.user;
    try {
        let currentNbRentedCars = parseInt(req.signedCookies.nbOfRentedCars, 10) + 1;
        
        res.cookie('nbOfRentedCars', currentNbRentedCars, { signed: true });
    } catch (e) {
        console.log(e)
    }
    await Car.rentCar(CarID, PersonID);
    res.send('ok').status(200);
}

    module.exports.returnCar = async (req, res) => {
        const { CarID } = req.params;
        const { PersonID } = req.user;
        console.log('about to change cookie')
        try {
            let currentNbRentedCars = parseInt(req.signedCookies.nbOfRentedCars, 10) - 1;
            res.cookie('nbOfRentedCars', currentNbRentedCars, { signed: true });
            console.log('changed cookie')
        } catch (e) { console.log(e) }
        await Car.returnCar(CarID, PersonID);
    
    res.send('ok');

}

module.exports.addAvailableCar = async (req,res)=>{
    const carModelID = req.params.id;
    const imageURL = req.file.path;
    const car = {...req.body,imageURL};
    await Car.addAvailableCar(carModelID,car);
    res.redirect(`/cars/${carModelID}`);
}