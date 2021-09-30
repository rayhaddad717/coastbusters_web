const mssql = require('mssql');
const bcrypt = require('bcrypt');
const dbObjects = require('./dbObjects')
const config = {
    user: process.env.sqlUsername,
    password: process.env.sqlPassword,
    server: 'coastBusters.mssql.somee.com',

    options: {
        trustServerCertificate: true
    },
    database: 'coastBusters'
};
module.exports.config = config;
const connectToDB = async () => {
    try {
        await mssql.connect(config);
        console.log('connected to db');

    } catch (e) { console.log("There was an error to connect to db in dbFunctionsFile.", e) }

}

//Function to search for a manufacturer
//Search
search = async function (searchText) {
    try {
        await connectToDB();
        const result = await mssql.query(`SELECT * FROM [coastBusters].[dbo].[CarModels] where (Manufacturer) like '${searchText}%' OR (Name) like '${searchText}%'`)
        return result;
    } catch { console.log('some error happened') }

}
module.exports.search = search;

const LoginCredential = require('../models/loginCredentials');
//Function to get The logged in user login information
getLoginCredentialsInfo = async function (loginID) {
    await connectToDB();
    const info = await mssql.query(`select * from [coastBusters].[dbo].[LoginCredentials] where loginID=${loginID}`)
    if (info.recordset[0]) {
        const { isCustomer, PersonID } = info.recordset[0];
        // return new dbObjects.LoginCredentialObject({ loginID, PersonID, isCustomer })
        return new LoginCredential({ loginID, PersonID, isCustomer })
    } else { return null };

}
module.exports.getLoginCredentialsInfo = getLoginCredentialsInfo;
const Person = require('../models/person')

//Function to get the logged in user Person information
getPersonInfo = async function (personID) {
    try {
        await connectToDB();
        const info = await mssql.query(`select * from [coastBusters].[dbo].[People] where personID=${personID}`)
        if (info.recordset[0]) {
            const { FirstName, LastName, DateOfBirth, Address, SubscriptionID, IsACustomer: isCustomer, PersonID, AccidentsMade, NbOfRentedCars } = info.recordset[0];

            // const person = new dbObjects.PersonObject({ PersonID, FirstName, LastName, DateOfBirth, Address, SubscriptionID, isCustomer });
            const person = new Person({ PersonID, FirstName, LastName, DateOfBirth, Address, SubscriptionID, isCustomer, AccidentsMade, NbOfRentedCars });

            return person;
        } else { return null; }
    } catch (e) { console.log(e, 'error in reading person') }
}
module.exports.getPersonInfo = getPersonInfo;


//Get Rented Cars by Person
const getRentedCarsByPerson = async function (personID) {
    await connectToDB();
    const dbString = `select * from [coastBusters].[dbo].[AvailableCars] where RentedByPersonID=${personID}`
    console.log(dbString)
    const result = await mssql.query(dbString);
    return result;
}
module.exports.getRentedCarsByPerson = getRentedCarsByPerson;


//Insert new login user Person Info
const insertNewLoginUsingPersonInfo = async function (info) {

    const subscription = await insertNewSubscription(info.subscriptionTypeSelect);
    const subscriptionID = subscription.subsID;
    info = { ...info, subscriptionID };
    const person = await insertNewPerson(info);
    const personID = person.personID;
    try {
        info.isCustomer = (info.isCustomer ? 1 : 0);
        let pool = await mssql.connect(config)
        let result = await pool.request()
            .input('personID', mssql.NVarChar(20), personID)
            .input('username', mssql.NVarChar(50), info.username)
            .input('password', mssql.NVarChar(100), info.hashedPassword)
            .input('isCustomer', mssql.Bit, info.isCustomer)
            .query('insert into [coastBusters].[dbo].LoginCredentials (PersonID,Password,isCustomer,username) values(@personID,@password,@isCustomer,@username)');
        const idResult = await mssql.query(`SELECT IDENT_CURRENT ('LoginCredentials') as id `)
        const loginID = idResult.recordset[0].id;
        const { isCustomer, username } = info;
        // const newLogin = new dbObjects.LoginCredentialObject({ loginID, PersonID: personID, isCustomer,username });
        const newLogin = new LoginCredential({ loginID, PersonID: personID, isCustomer, username });
        return [newLogin, person, subscription];

    } catch (e) { console.log('login', e) }

}
module.exports.insertNewLoginUsingPersonInfo = insertNewLoginUsingPersonInfo;


//insert New Person
const insertNewPerson = async function (info) {

    info = { ...info, AccidentsMade: 0, NbOfRentedCars: 0 };

    try {
        let pool = await mssql.connect(config)
        let result = await pool.request()
            .input('FN', mssql.NVarChar(20), info.FN)
            .input('LN', mssql.NVarChar(20), info.LN)
            .input('DOB', mssql.SmallDateTime, info.DOB)
            .input('address', mssql.NVarChar(20), info.address)
            .input('isACustomer', mssql.Bit, info.isCustomer)
            .input('subscriptionID', mssql.Int, info.subscriptionID)
            .input('AccidentsMade', mssql.Int, info.AccidentsMade)
            .input('NbOfRentedCars', mssql.Int, info.NbOfRentedCars)
            .query('insert into [coastBusters].[dbo].People (FirstName,LastName,DateOfBirth,Address,SubscriptionID,isACustomer,AccidentsMade,NbOfRentedCars) values(@FN,@LN,@DOB,@address,@subscriptionID,@isACustomer,@AccidentsMade,@NbOfRentedCars)');
        if (result.rowsAffected === 0) {
            console.log('no rows were affected by inserting a person');
            return -1;
        }
        else {
            const idResult = await mssql.query(`SELECT IDENT_CURRENT ('People') as id `)
            const { FN: FirstName, LN: LastName, DOB, address: Address, subscriptionID: SubscriptionID, isCustomer, AccidentsMade, NbOfRentedCars } = info;
            const PersonID = idResult.recordset[0].id;
            // const newPerson = new dbObjects.PersonObject({ PersonID, FirstName, LastName, DOB, Address, SubscriptionID, isCustomer });
            const newPerson = new Person({ PersonID, FirstName, LastName, DOB, Address, SubscriptionID, isCustomer, AccidentsMade, NbOfRentedCars });
            return newPerson;
        }
    } catch (e) { console.log(e); }
}

module.exports.insertNewPerson = insertNewPerson;

const Subscription = require('../models/subscription')
//insert new subscription
const insertNewSubscription = async function (type) {

    try {
        await connectToDB();
        const result = await mssql.query(`insert into [coastBusters].[dbo].Subscriptions (SubscriptionTypeID,Status) values (${type},1)`)
        const idResult = await mssql.query(`SELECT IDENT_CURRENT ('Subscriptions') as id `)
        const subsID = idResult.recordset[0].id;
        // const newSubscription = new dbObjects.SubscriptionObject(subsID, type);
        const newSubscription = new Subscription(subsID, type);

        return newSubscription;
    }
    catch (e) { console.log('error in inserting new subscription'); return -1; }

}
const Car = require('../models/car')
//Get all cars
//Will return an array filled with CarModelObjects
const getAllCars = async function () {
    try {
        await connectToDB();
        let cars = await mssql.query('select * from [coastBusters].[dbo].CarModels');
        cars = cars.recordset;
        const carsArray = [];
        for (let car of cars) {
            // const newCar = new dbObjects.CarModel({ ...car });
            const newCar = new Car({ ...car });

            carsArray.push(newCar);
        }
        return carsArray;
    } catch (e) { console.log(e, 'error in reading all cars') }
}
module.exports.getAllCars = getAllCars;

//Will one car specified by its id
const getOneCar = async function (id) {
    try {
        await connectToDB();
        const dbString = `select * from CarModels where CarModelID=${id}`;
        console.log(dbString);
        let cars = await mssql.query(dbString);
        if (cars.recordset[0]) {
            car = cars.recordset[0];
            return new Car({ ...car });
        } else { return null; }


    } catch (e) { console.log(e, 'error in reading one cars in getONeCar') }
}
module.exports.getOneCar = getOneCar;


//Insert a new Car Model
const insertNewCarModel = async function (carModel) {
    try {
        let pool = await mssql.connect(config)
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
            .input('nbCarsLeft', mssql.Int, carModel.nbCarsLeft)
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
}
module.exports.insertNewCarModel = insertNewCarModel;

//Edit a Car Model
const editCarModel = async function (carModel) {
    try {
        let pool = await mssql.connect(config)
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
}
module.exports.editCarModel = editCarModel;


//Edit a Car Model
const deleteOneCarModel = async function (carModelID) {

    try {
        await connectToDB();
        const result = await mssql.query(`delete from [coastBusters].[dbo].[CarModels] where CarModelID= ${parseInt(carModelID)}`)
        if (result.rowsAffected === 0) {
            console.log('no rows were affected by deleting a car model');

            return -1;
        }
        else {
            console.log('deleted car model ', carModelID);
        }
    } catch (e) { console.log(e); }
}
module.exports.deleteOneCarModel = deleteOneCarModel;



//Get all people
//Will return an array filled with Logins
const getAllLogins = async function () {
    try {
        await connectToDB();
        let logins = await mssql.query('select * from [coastBusters].[dbo].LoginCredentials');
        logins = logins.recordset;
        const loginsArray = [];
        for (let login of logins) {
            // const newLogin = new dbObjects.LoginCredentialObject({ ...login });
            const newLogin = new LoginCredential({ ...login });

            loginsArray.push(newLogin);
        }
        return loginsArray;
    } catch (e) { console.log(e, 'error in logins') }
}
module.exports.getAllLogins = getAllLogins;



const checkLogin = async function (username, password) {
    try {
        let pool = await mssql.connect(config)
        let result = await pool.request()
            .input('username', mssql.NVarChar(50), username)
            .query('select * from [coastBusters].[dbo].LoginCredentials where username=@username');
        const user = result.recordset[0];
        const validLogin = await bcrypt.compare(password, user.Password);
        if (validLogin) { return user; }
        else { return null; }
    } catch (e) {
        console.log(e)
    }
}
module.exports.checkLogin = checkLogin;

const findByID = async function (id) {
    try {
        await connectToDB();
        const result = await mssql.query(`select * from [coastBusters].[dbo].LoginCredentials where loginID =${id}`);
        if (result.recordset[0]) {
            const user = result.recordset[0];
            return user;
        } else { return null; }
    } catch (e) {
        console.log(e)
    }
}
module.exports.findByID = findByID;
module.exports.connectToDB = connectToDB;



const getAvailableCarsFromCarModelID = async (carModelID) => {
    try {
        await connectToDB();
        const result = await mssql.query(`select * from AvailableCars where CarModelID=${carModelID} and isRented = 0`);
        return result.recordset;
    } catch (e) {
        console.log('error reading available cars', e);
    }
}

module.exports.getAvailableCarsFromCarModelID = getAvailableCarsFromCarModelID;

const date = require('./date');
const rentCar = async (carID, personID) => {

    try {
        await connectToDB();
        const commandString = `update AvailableCars set isRented=1,RentedByPersonID=${personID},RentedDate='${date}' where CarID=${carID} update People set  NbOfRentedCars=NbOfRentedCars+1 where PersonID=${personID}`;
        await mssql.query(commandString);
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

}

module.exports.rentCar = rentCar;

const returnCar = async (carId, personId) => {
    const commandString = `update AvailableCars set isRented=0,RentedByPersonID=null,RentedDate=null where CarID=${carId} update People set  NbOfRentedCars=NbOfRentedCars-1 where PersonID=${personId}`;
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
}
module.exports.returnCar = returnCar;

const getNbOfAllowedCars = async (subscriptionID) => {
    try {
        await connectToDB();
        let commandString = `select SubscriptionTypeID from Subscriptions where SubscriptionID=${subscriptionID}`;
        let result = await mssql.query(commandString);
        const subsTypeID = result.recordset[0].SubscriptionTypeID;
        commandString = `select NbAllowedRentedCars from SubscriptionTypes where SubscriptionTypeID=${subsTypeID}`;
        result = await mssql.query(commandString);
        console.log(result.recordset[0].NbAllowedRentedCars);

        return result.recordset[0].NbAllowedRentedCars;
    } catch (e) {
        console.log(e, 'error gettingnb alowed cars')
    }
}
module.exports.getNbOfAllowedCars = getNbOfAllowedCars;


module.exports.addAvailableCar = async (carModelID, car) => {
    try {
        await connectToDB();
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