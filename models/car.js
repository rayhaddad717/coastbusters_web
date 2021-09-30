const mssql = require('mssql');
const dbFunctions = require('../utils/dbFunctions');
const date = require('../utils/date');
const Person = require('./person');
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
        this.nbCarsLeft = 0;
        this.image = car.image;

    };
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
    };
    //Get Rented Cars by Person
    static getRentedCarsByPerson = async function (personID) {
        await dbFunctions.connectToDB();
        const dbString = `select * from [coastBusters].[dbo].[AvailableCars] where RentedByPersonID=${personID}`
        console.log(dbString)
        const result = await mssql.query(dbString);
        return result.recordset;
    };
    //Get all cars
    //Will return an array filled with CarModelObjects
    static getAllCars = async function () {
        try {
            await dbFunctions.connectToDB();
            let cars = await mssql.query('select * from [coastBusters].[dbo].CarModels');
            cars = cars.recordset;
            const carsArray = [];
            for (let car of cars) {
                // const newCar = new dbObjects.CarModel({ ...car });
                const newCar = new CarModel({ ...car });

                carsArray.push(newCar);
            }
            return carsArray;
        } catch (e) { console.log(e, 'error in reading all cars') }
    };
    //Will one car specified by its id
    static getOneCar = async function (id) {
        try {
            await dbFunctions.connectToDB();
            const dbString = `select * from CarModels where CarModelID=${id}`;
            let cars = await mssql.query(dbString);
            if (cars.recordset[0]) {
                const car = cars.recordset[0];
                return new CarModel({ ...car });
            } else { return null; }


        } catch (e) { console.log(e, 'error in reading one cars in getONeCar') }
    };
    //Insert a new Car Model
    static insertNewCarModel = async function (carModel) {
        try {
            let pool = await mssql.connect(dbFunctions.config);
            let result = await pool.request()
                .input('name', mssql.NVarChar(20), carModel.name)
                .input('manufacturer', mssql.NVarChar(20), carModel.manufacturer)
                .input('country', mssql.NVarChar(20), carModel.country)
                .input('year', mssql.Int, carModel.year)
                .input('engineType', mssql.NVarChar(20), carModel.engineType)
                .input('bhp', mssql.Int, carModel.bhp)
                .input('torque', mssql.Int, carModel.torque)
                .input('emissions', mssql.Int, carModel.emissions)
                .input('nbOfSeats', mssql.Int, carModel.nbOfSeats)
                .input('nbCarsLeft', mssql.Int, 0)
                .query('insert into [coastBusters].[dbo].CarModels (Name,Manufacturer,Country,Year,BHP,EngineType,Torque,Emissions,NbOfSeats,NbCarsLeft) values(@name,@manufacturer,@country,@year,@bhp,@engineType,@torque,@emissions,@nbOfSeats,@nbCarsLeft)');
            if (result.rowsAffected === 0) {
                console.log('no rows were affected by inserting a car model');
                return -1;
            }
            else {
                const idResult = await mssql.query(`SELECT IDENT_CURRENT ('CarModels') as id `)
                const carID = idResult.recordset[0].id;
                return carID;
            }
        } catch (e) { console.log(e); }
    };
    //Edit a Car Model
    static editCarModel = async function (carModel) {
    try {
        let pool = await mssql.connect(dbFunctions.config)
        let result = await pool.request()
            .input('name', mssql.NVarChar(20), carModel.name)
            .input('manufacturer', mssql.NVarChar(20), carModel.manufacturer)
            .input('country', mssql.NVarChar(20), carModel.country)
            .input('carModelID', mssql.Int, carModel.carModelID)
            .input('year', mssql.Int, carModel.year)
            .input('engineType', mssql.NVarChar(20), carModel.engineType)
            .input('bhp', mssql.Int, carModel.bhp)
            .input('torque', mssql.Int, carModel.torque)
            .input('emissions', mssql.Int, carModel.emissions)
            .input('nbOfSeats', mssql.Int, carModel.nbOfSeats)
            .input('nbCarsLeft', mssql.Int, carModel.nbCarsLeft)
            .query('update [coastBusters].[dbo].CarModels set Name=@name,Manufacturer=@manufacturer,Country=@country,Year=@year,BHP=@bhp,EngineType=@engineType,Torque=@torque,Emissions=@emissions,NbOfSeats=@nbOfSeats,NbCarsLeft=@nbCarsLeft where CarModelID=@carModelID');
        if (result.rowsAffected === 0) {
            console.log('no rows were affected by inserting a car model');

            return -1;
        }
        else {
            const idResult = await mssql.query(`SELECT IDENT_CURRENT ('CarModels') as id `)
            const carID = idResult.recordset[0].id;
            return carID;
        }
    } catch (e) { console.log(e); }
};
//Edit a Car Model
static deleteOneCarModel = async function (carModelID) {

    try {
        await dbFunctions.connectToDB();
        const result = await mssql.query(`delete from [coastBusters].[dbo].[CarModels] where CarModelID= ${parseInt(carModelID)}`)
        if (result.rowsAffected === 0) {
            console.log('no rows were affected by deleting a car model');

            return -1;
        }
        else {
            console.log('deleted car model ', carModelID);
        }
    } catch (e) { console.log(e); }
};
static getAvailableCarsFromCarModelID = async (carModelID) => {
    try {
        await dbFunctions.connectToDB();
        const result = await mssql.query(`select * from AvailableCars where CarModelID=${carModelID} and isRented = 0`);
        return result.recordset;
    } catch (e) {
        console.log('error reading available cars', e);
    }
};
static rentCar = async (carID, personID) => {

    try {
        await dbFunctions.connectToDB();
        const commandString = `update AvailableCars set isRented=1,RentedByPersonID=${personID},RentedDate='${date}' where CarID=${carID}`;
        await mssql.query(commandString);
        Person.increaseNbRentedCars(personID);
    } catch (e) { console.log(e) }
    let query = `select CarModelID from AvailableCars where CarID=${carID}`;
    try {
        const res = await mssql.query(query);
        const carModelID = res.recordset[0].CarModelID;
        query = `update CarModels set NbCarsLeft = NbCarsLeft-1 where CarModelID=${carModelID}`;
        await mssql.query(query);
    }
    catch (e) {
        console.log(e);
    }

};
static returnCar = async (carId, personId) => {
    const commandString = `update AvailableCars set isRented=0,RentedByPersonID=null,RentedDate=null where CarID=${carId}`;
    Person.decreaseNbRentedCars(personId);
    try {
        await connectToDB();
        await mssql.query(commandString);
        console.log(commandString);
    } catch (e) {
        console.log(e);
    }
    let query = `select CarModelID from AvailableCars where CarID=${carID}`;
    try {
        const res = await mssql.query(query);
        const carModelID = res.recordset[0].CarModelID;
        query = `update CarModels set NbCarsLeft = NbCarsLeft+1 where CarModelID=${carModelID}`;
        await mssql.query();
    }
    catch (e) {
        console.log(e);
    }
};

static addAvailableCar = async (carModelID, car) => {
    try {
        await dbFunctions.connectToDB();
        let query = `insert into AvailableCars (CarModelID,isRented,RentedByPersonID,RentedDate,NeedsRepair,Color,Condition,Image) values (${carModelID},0,null,null,0,'${car.color}','${car.condition}','${car.imageURL}')`;
        let result = await mssql.query(query);
        if (result.rowsAffected === 0) {
            console.log('did not add available car to db')
        };

        query = `update CarModels set NbCarsLeft = NbCarsLeft + 1 where CarModelID=${carModelID}`;
        await mssql.query(query);
    } catch (e) {
        console.log(e)
    }
}



}



module.exports = CarModel;