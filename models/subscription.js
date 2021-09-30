const mssql=require('mssql');
const dbFunctions = require('../utils/dbFunctions')
module.exports  = class Subscription {
    constructor(subsID, subsType) {
        this.subsType = subsType;
        this.subsID = subsID;
        this.Status = true;
    }
    static insertNewSubscription = async function (type) {
    
        try {
            await dbFunctions.connectToDB();
            const result = await mssql.query(`insert into [coastBusters].[dbo].Subscriptions (SubscriptionTypeID,Status) values (${type},1)`)
            const idResult = await mssql.query(`SELECT IDENT_CURRENT ('Subscriptions') as id `)
            const subsID = idResult.recordset[0].id;
            const newSubscription = new Subscription(subsID, type);
    
            return newSubscription;
        }
        catch (e) { console.log('error in inserting new subscription'); return -1; }
    
    };
    static getNbOfAllowedCars = async (subscriptionID) => {
        try {
            await dbFunctions.connectToDB();
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
}
