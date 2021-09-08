const mssql = require('mssql');
const dbObjects = require('./dbObjects')
const connectToDB = async () => {
    const config = {
        user: 'ray',
        password: '1234',
        server: 'localhost',
        options: {
            trustServerCertificate: true
        },
        database: 'Coast Busters'
    };
    try {
        await mssql.connect(config);

    } catch { console.log("There was an error to connect to db in dbFunctionsFile.") }

}
//Function to search for a manufacturer
//Search
search = async function (searchText) {
    try {
        await connectToDB();
        const result = await mssql.query(`SELECT * FROM [Coast Busters].[dbo].[CarModels] where (Manufacturer) like '${searchText}%' OR (Name) like '${searchText}%'`)
        return result;
    } catch { console.log('some error happened') }

}
module.exports.search = search;


//Function to get The logged in user login information
getLoginCredentialsInfo = async function (loginID) {
    await connectToDB();
    const info = await mssql.query(`select * from [Coast Busters].[dbo].[LoginCredentials] where loginID=${loginID}`)
    const { Password, isCustomer, PersonID } = info.recordset[0];
    return new dbObjects.LoginCredentialObject(loginID, PersonID, isCustomer)
}
module.exports.getLoginCredentialsInfo = getLoginCredentialsInfo;

//Function to get the logged in user Person information
getPersonInfo = async function (currentLoggedInUser) {
    try {
        await connectToDB();
        const info = await mssql.query(`select * from [Coast Busters].[dbo].[People] where personID=${currentLoggedInUser.personID}`)
        const { FirstName, LastName, DateOfBirth, Address, SubscriptionID, IsACustomer: isCustomer, PersonID } = info.recordset[0];

        const person = new dbObjects.PersonObject(PersonID, FirstName, LastName, DateOfBirth, Address, SubscriptionID, isCustomer);
        if (isCustomer) {
            const { AccidentsMade, NbOfRentedCars } = info.recordset[0];
            person.addCustomerInfo(AccidentsMade, NbOfRentedCars);
        }

        return person;
    } catch (e) { console.log(e, 'error in reading person') }
}
module.exports.getPersonInfo = getPersonInfo;

//Check Login
const checkLogin = async (loginID, password) => {
    try {
        await connectToDB();
        const result = await mssql.query(`select * from [Coast Busters].[dbo].[LoginCredentials] where loginID=${loginID}`)
        if (result.recordset.length === 0 || result.recordset.length > 1) {
            console.log('no such username')
            return false;

        }
        else if (result.recordset[0].Password === password) {
            console.log('logged in');
            // currentLoggedInUser = await dbFunctions.getLoginCredentialsInfo(loginID);
            return true;
        }
        else {
            console.log('wrong password');
            return false;
        }
    } catch (e) { console.log('error in checking login info', e); return false; }
}
module.exports.checkLogin = checkLogin;


//Get Rented Cars by Person
const getRentedCarsByPerson = async function (personID) {
    await connectToDB();
    const result = await mssql.query(`select * from [Coast Busters].[dbo].AvailableCars where RentedByPersonID= ${personID}`)
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
    const config = {
        user: 'ray',
        password: '1234',
        server: 'localhost',
        options: {
            trustServerCertificate: true
        },
        database: 'Coast Busters'
    };
    try {
        info.isCustomer = (info.isCustomer ? 1 : 0);
        let pool = await mssql.connect(config)
        let result = await pool.request()
            .input('personID', mssql.NVarChar(20), personID)
            .input('password', mssql.NVarChar(20), info.password)
            .input('isCustomer', mssql.Bit, info.isCustomer)
            .query('insert into [Coast Busters].[dbo].LoginCredentials (PersonID,Password,isCustomer) values(@personID,@password,@isCustomer)');
        const idResult = await mssql.query(`SELECT IDENT_CURRENT ('LoginCredentials') as id `)
        const loginID = idResult.recordset[0].id;
        const newLogin = new dbObjects.LoginCredentialObject(loginID, personID, info.isCustomer);
        return [newLogin, person, subscription];

    } catch (e) { console.log('login', e) }

}
module.exports.insertNewLoginUsingPersonInfo = insertNewLoginUsingPersonInfo;


//insert New Person
const insertNewPerson = async function (info) {
    const config = {
        user: 'ray',
        password: '1234',
        server: 'localhost',
        options: {
            trustServerCertificate: true
        },
        database: 'Coast Busters'
    };
    if (info.isCustomer) {
        info = { ...info, AccidentsMade: 0, NbOfRentedCars: 0 };
    }
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
            .query('insert into [Coast Busters].[dbo].People (FirstName,LastName,DateOfBirth,Address,SubscriptionID,isACustomer,AccidentsMade,NbOfRentedCars) values(@FN,@LN,@DOB,@address,@subscriptionID,@isACustomer,@AccidentsMade,@NbOfRentedCars)');
        if (result.rowsAffected === 0) {
            console.log('no rows were affected by inserting a person');
            return -1;
        }
        else {
            const idResult = await mssql.query(`SELECT IDENT_CURRENT ('People') as id `)
            const personID = idResult.recordset[0].id;
            const newPerson = new dbObjects.PersonObject(personID, info.FN, info.LN, info.DOB, info.address, info.subscriptionID, info.isCustomer);
            return newPerson;
        }
    } catch (e) { console.log(e); }
}

module.exports.insertNewPerson = insertNewPerson;


//insert new subscription
const insertNewSubscription = async function (type) {

    try {
        await connectToDB();
        const result = await mssql.query(`insert into [Coast Busters].[dbo].Subscriptions (SubscriptionTypeID,Status) values (${type},1)`)
        const idResult = await mssql.query(`SELECT IDENT_CURRENT ('Subscriptions') as id `)
        const subsID = idResult.recordset[0].id;
        const newSubscription = new dbObjects.SubscriptionObject(subsID, type);
        return newSubscription;
    }
    catch (e) { console.log('error in inserting new subscription'); return -1; }

}

//Get all cars
//Will return an array filled with CarModelObjects
const getAllCars = async function () {
    try {
        await connectToDB();
        let cars = await mssql.query('select * from [Coast Busters].[dbo].CarModels');
        cars = cars.recordset;
        const carsArray = [];
        for (let car of cars) {
            const newCar = new dbObjects.CarModel({ ...car });
            carsArray.push(newCar);
        }
        return carsArray;
    } catch (e) { console.log(e, 'error in reading all cars') }
}
module.exports.getAllCars = getAllCars;

//Will one car specified by its id
const getOneCar = async function (id) {
    try {
        console.log('entered')
        await connectToDB();
        let cars = await mssql.query(`select * from [Coast Busters].[dbo].CarModels where CarModelID=${id}`);
        car = cars.recordset[0];
        return new dbObjects.CarModel({ ...car });

    } catch (e) { console.log(e, 'error in reading all cars') }
}
module.exports.getOneCar = getOneCar;


//Insert a new Car Model
const insertNewCarModel = async function (carModel) {
    const config = {
        user: 'ray',
        password: '1234',
        server: 'localhost',
        options: {
            trustServerCertificate: true
        },
        database: 'Coast Busters'
    };
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
            .query('insert into [Coast Busters].[dbo].CarModels (Name,Manufacturer,Country,Year,BHP,EngineType,Torque,Emissions,NbOfSeats,NbCarsLeft) values(@name,@manufacturer,@country,@year,@bhp,@engineType,@torque,@emissions,@nbOfSeats,@nbCarsLeft)');
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
    const config = {
        user: 'ray',
        password: '1234',
        server: 'localhost',
        options: {
            trustServerCertificate: true
        },
        database: 'Coast Busters'
    };
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
            .query('update [Coast Busters].[dbo].CarModels set Name=@name,Manufacturer=@manufacturer,Country=@country,Year=@year,BHP=@bhp,EngineType=@engineType,Torque=@torque,Emissions=@emissions,NbOfSeats=@nbOfSeats,NbCarsLeft=@nbCarsLeft where CarModelID=@carModelID');
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
        const result = await mssql.query(`delete from [Coast Busters].[dbo].[CarModels] where CarModelID= ${parseInt(carModelID)}`)
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
