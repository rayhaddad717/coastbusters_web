const mssql = require('mssql');
const dbFunctions = require('../utils/dbFunctions');
module.exports = class Person{
        constructor(person) {
            this.personID = person.PersonID;
            this.firstName = person.FirstName;
            this.lastName = person.LastName;
            this.dateOfBirth = person.DateOfBirth;
            this.address = person.Address;
            this.isCustomer = person.isCustomer;
            this.subscriptionID = person.SubscriptionID;
            this.accidentsMade = person.AccidentsMade;
            this.nbOfRentedCars = person.NbOfRentedCars;
        };
        print() {
            const { personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars } = this;
    
            console.log(personID, firstName, lastName, dateOfBirth, address, isCustomer, subscriptionID, accidentsMade, nbOfRentedCars);
        };
        //Function to get the logged in user Person information
        static getPersonInfo = async function (personID) {
            try {
                await dbFunctions.connectToDB();
                const info = await mssql.query(`select * from [coastBusters].[dbo].[People] where personID=${personID}`)
                if (info.recordset[0]) {
                    const { FirstName, LastName, DateOfBirth, Address, SubscriptionID, IsACustomer: isCustomer, PersonID, AccidentsMade, NbOfRentedCars } = info.recordset[0];
        
                    // const person = new dbObjects.PersonObject({ PersonID, FirstName, LastName, DateOfBirth, Address, SubscriptionID, isCustomer });
                    const person = new Person({ PersonID, FirstName, LastName, DateOfBirth, Address, SubscriptionID, isCustomer, AccidentsMade, NbOfRentedCars });
                            return person;
                } else { return null; }
            } catch (e) { console.log(e, 'error in reading person') }
        };
        static insertNewPerson = async function (info) {
           info = { ...info, AccidentsMade: 0, NbOfRentedCars: 0 };
           try {
                let pool = await mssql.connect(dbFunctions.config)
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
                    const newPerson = new Person({ PersonID, FirstName, LastName, DOB, Address, SubscriptionID, isCustomer, AccidentsMade, NbOfRentedCars });
                    return newPerson;
                }
            } catch (e) { console.log(e); }
        };
        static increaseNbRentedCars = async (personID)=>{
            try {
                await dbFunctions.connectToDB();
                const commandString = `update People set  NbOfRentedCars=NbOfRentedCars+1 where PersonID=${personID}`;
                await mssql.query(commandString);
            } catch (e) { console.log(e) }
        };
        static decreaseNbRentedCars = async (personID)=>{
            try {
                await dbFunctions.connectToDB();
                const commandString = `update People set  NbOfRentedCars=NbOfRentedCars-1 where PersonID=${personID}`;
                await mssql.query(commandString);
            } catch (e) { console.log(e) }
        };
        

};