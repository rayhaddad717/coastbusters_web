const dbFunctions = require('../utils/dbFunctions');
const mssql = require('mssql');
const Subscription = require('../models/subscription');
const Person = require('../models/person');
const bcrypt = require('bcrypt');
//this class is only to get all users
module.exports = class LoginCredential {
    constructor(login) {
        this.personID = login.PersonID;
        this.isCustomer = login.isCustomer;
        this.loginID = login.loginID;
        this.password = login.Password ? login.Password : "";
    };
    print() {
        console.log(this.loginID, this.password, this.personID, this.isCustomer)
    };
    //Function to get The logged in user login information
    static getLoginCredentialsInfo = async function (loginID) {
        await dbFunctions.connectToDB();
        const info = await mssql.query(`select * from [coastBusters].[dbo].[LoginCredentials] where loginID=${loginID}`)
        if (info.recordset[0]) {
            const { isCustomer, PersonID } = info.recordset[0];
            return new LoginCredential({ loginID, PersonID, isCustomer })
        } else { return null };

    };
    static checkUsernameExists = async (username) => {
        await dbFunctions.connectToDB();
        const command = `select * from LoginCredentials where username='${username}'`;
        try {
            const res = await mssql.query(command);
            if (res.recordset.length === 0) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e)
        }
    }

    //Insert new login user Person Info
    static insertNewLoginUsingPersonInfo = async function (info) {

        const uniqueUsername = await LoginCredential.checkUsernameExists(info.username);
        if (uniqueUsername) {
            const subscription = await Subscription.insertNewSubscription(info.subscriptionTypeSelect);
            const subscriptionID = subscription.subsID;
            info = { ...info, subscriptionID };
            const person = await Person.insertNewPerson(info);
            const personID = person.personID;
            try {
                info.isCustomer = (info.isCustomer ? 1 : 0);
                let pool = await mssql.connect(dbFunctions.config)
                let result = await pool.request()
                    .input('personID', mssql.NVarChar(20), personID)
                    .input('username', mssql.NVarChar(50), info.username)
                    .input('password', mssql.NVarChar(100), info.hashedPassword)
                    .input('isCustomer', mssql.Bit, info.isCustomer)
                    .query('insert into [coastBusters].[dbo].LoginCredentials (PersonID,Password,isCustomer,username) values(@personID,@password,@isCustomer,@username)');
                const idResult = await mssql.query(`SELECT IDENT_CURRENT ('LoginCredentials') as id `)
                const loginID = idResult.recordset[0].id;
                const { isCustomer, username } = info;
                const newLogin = new LoginCredential({ loginID, PersonID: personID, isCustomer, username });
                return [newLogin, person, subscription];
            } catch (e) {
                console.log('login', e)
            }
        }
        else {
            return false;
        }

    };

    //Get all people
    //Will return an array filled with Logins
    static getAllLogins = async function () {
        try {
            await dbFunctions.connectToDB();
            let logins = await mssql.query('select * from [coastBusters].[dbo].LoginCredentials');
            logins = logins.recordset;
            const loginsArray = [];
            for (let login of logins) {
                const newLogin = new LoginCredential({ ...login });

                loginsArray.push(newLogin);
            }
            return loginsArray;
        } catch (e) { console.log(e, 'error in logins') }
    };
    static checkLogin = async function (username, password) {
        try {
            let pool = await mssql.connect(dbFunctions.config)
            let result = await pool.request()
                .input('username', mssql.NVarChar(50), username)
                .query('select * from [coastBusters].[dbo].LoginCredentials where username=@username');
            if (result.rowsAffected === 0) {
                console.log('user not found');
                return null;
            } else {
                const user = result.recordset[0];
                const validLogin = await bcrypt.compare(password, user.Password);
                if (validLogin) { return user; }
                else { return null; }
            }
        } catch (e) {
            console.log(e)
        }
    };

    static findByID = async function (id) {
        try {
            await dbFunctions.connectToDB();
            const result = await mssql.query(`select * from [coastBusters].[dbo].LoginCredentials where loginID =${id}`);
            if (result.recordset[0]) {
                const user = result.recordset[0];
                return user;
            } else { return null; }
        } catch (e) {
            console.log(e)
        }
    };




};
const LoginCredential = require('../models/loginCredentials');