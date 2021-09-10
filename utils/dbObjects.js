//this class is only to get all users
module.exports.LoginCredentialObject = class LoginCredentialObject {
    constructor(login) {
        this.personID = login.PersonID;
        this.isCustomer = login.isCustomer;
        this.loginID = login.loginID;
        this.password = login.Password ? login.Password : "";
    }
    print() {
        console.log(this.loginID, this.password, this.personID, this.isCustomer)
    }
};

module.exports.PersonObject = class PersonObject {
    constructor(person) {
        this.personID = person.PersonID;
        this.firstName = person.FirstName;
        this.lastName = person.LastName;
        this.dateOfBirth = person.DOB;
        this.address = person.Address;
        this.isCustomer = person.isCustomer;
        this.subscriptionID = person.SubscriptionID;
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
