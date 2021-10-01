const mssql = require('mssql');
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
module.exports.connectToDB = connectToDB;
//Function to search for a manufacturer
//Search
const search = async function (searchText) {
    try {
        await connectToDB();
        const result = await mssql.query(`SELECT * FROM [coastBusters].[dbo].[CarModels] where (Manufacturer) like '${searchText}%' OR (Name) like '${searchText}%'`)
        return result;
    } catch { console.log('some error happened') }

}
module.exports.search = search;






