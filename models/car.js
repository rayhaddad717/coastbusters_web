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
        this.image=car.image;

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
module.exports=CarModel;