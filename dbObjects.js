module.exports.LoginCredentialObject = class LoginCredentialObject {
    constructor(loginID, personID, isCustomer, password = "") {
        this.personID = personID;
        this.isCustomer = isCustomer;
        this.loginID = loginID;
        this.password = password;
    }
    print() {
        console.log(this.loginID, this.password, this.personID, this.isCustomer)
    }
};
module.exports.PersonObject = class PersonObject {
    constructor(personID, FN, LN, DOB, address, subscriptionID, isCustomer) {
        this.personID = personID;
        this.firstName = FN;
        this.lastName = LN;
        this.dateOfBirth = DOB;
        this.address = address;
        this.isCustomer = isCustomer;
        this.subscriptionID = subscriptionID;
    };
    addCustomerInfo(accidentsMade, nbOfRentedCars) {
        this.accidentsMade = accidentsMade;
        this.nbOfRentedCars = nbOfRentedCars;
    };
    print() {
        const { personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars } = this;

        console.log(personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars);
    }
};
module.exports.SubscriptionObject = class SubscriptionObject {
    constructor(subsID, subsType) {
        this.subsType = subsType;
        this.subsID = subsID;
        this.Status = true;
    }
}

//A Car is an object passed as argument
const CarModel = class {
    constructor(car) {
        if (car.CarModelID === undefined) {
            this.carModelID = undefined;
        }
        this.carModelID = car.CarModelID;
        this.name = car.Name;
        this.manufacturer = car.Manufacturer;
        this.country = car.Country;
        this.year = car.Year;
        this.engineType = car.EngineType;
        this.bhp = car.BHP;
        this.torque = car.Torque;
        this.emissions = car.Emissions;
        this.nbOfSeats = car.NbOfSeats;
        this.nbCarsLeft = car.NbCarsLeft;

    }
    print() {
        console.log(this.carModelID,
            this.name,
            this.manufacturer,
            this.country,
            this.year,
            this.engineType,
            this.bhp,
            this.torque,
            this.emissions,
            this.nbOfSeats,
            this.nbCarsLeft)
    }
}
module.exports.CarModel = CarModel;
