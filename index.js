const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const carRoutes = require('./routes/cars');
app.use(methodOverride('_method'));

const dbObjects = require('./dbObjects')
const dbFunctions = require('./dbFunctions');
const { render } = require('ejs');
const AppError = require('./utils/appError')
let isLoggedIn = false;
let currentLoggedInUser;
let currentLoggedInUserPersonInfo;
let currentLoggedInUseSubscription;

app.engine('ejs', ejsMate);
//Accepting html form posts
app.use(express.urlencoded({ extended: true }))
//Setting up express to use ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Adding static files
app.use(express.static('public'));
app.set('public', path.join(__dirname), 'public')

//Seting up RESTful routes
app.use('/cars', carRoutes);
//Home
app.get('/', async (req, res) => {
    if (isLoggedIn) {
        currentLoggedInUserPersonInfo = await dbFunctions.getPersonInfo(currentLoggedInUser);
    }
    res.render('home', { isLoggedIn, currentLoggedInUserPersonInfo });
})


//Login
app.get('/login', async (req, res) => {
    const queryString = req.query;
    //If the query string is empty it means i want the login page 
    if (Object.getOwnPropertyNames(queryString).length === 0) {
        res.render('login');
    }
    //else the query string has the loginid and password to login
    else {
        const { loginID, password } = queryString;
        const isCorrectPassword = await dbFunctions.checkLogin(loginID, password);
        if (isCorrectPassword) {
            isLoggedIn = true;
            currentLoggedInUser = await dbFunctions.getLoginCredentialsInfo(loginID);
            res.redirect('/')
        }
        else { res.send('Invalid username/password') }
    }

})

//Logout
app.get('/logout', (req, res) => {
    isLoggedIn = false;
    currentLoggedInUser = undefined;
    currentLoggedInUserPersonInfo = undefined;
    currentLoggedInUseSubscription = undefined;
    res.redirect('/');
}
)

//Signup
app.get('/signup', async (req, res) => {
    res.render('signup')
})
app.post('/signup', async (req, res) => {

    const { FN, LN, DOB, address, personType, subscriptionTypeSelect, password } = req.body;
    const isCustomer = (personType === "customer" ? true : false);
    const info = { FN, LN, DOB, address, isCustomer, subscriptionTypeSelect, password };
    console.log(info);
    const result = await dbFunctions.insertNewLoginUsingPersonInfo(info);
    [currentLoggedInUser, currentLoggedInUserPersonInfo, currentLoggedInUseSubscription] = result;
    isLoggedIn = true;
    res.redirect('/')
})

//Search
app.get('/search', async (req, res) => {
    const query = req.query;
    let results = await dbFunctions.search(query.q);
    console.log(results);
    if (results.recordset.length === 0) {
        results = undefined;
    } else {

    }
    // res.render('search', { query, results: results, isLoggedIn });
    let cars = [];
    if (results) { cars = results.recordset; }
    cars.forEach(car => {
        car.carModelID = car.CarModelID;
        car.name = car.Name;
        car.manufacturer = car.Manufacturer;
        car.country = car.Country;
        car.year = car.Year;
        car.engineType = car.EngineType;
        car.bhp = car.BHP;
        car.torque = car.Torque;
        car.emissions = car.Emissions;
        car.nbOfSeats = car.NbOfSeats;
        car.nbCarsLeft = car.NbCarsLeft;
        delete car.CarModelID;
        delete car.Name;
        delete car.Manufacturer;
        delete car.Country;
        delete car.Year;
        delete car.BHP;
        delete car.EngineType;
        delete car.Torque;
        delete car.Emissions;
        delete car.NbOfSeats;
        delete car.NbCarsLeft;

    })
    console.log(cars)
    res.render('cars', { isLoggedIn, cars })
})



app.get('/users', async (req, res) => {

    const logins = await dbFunctions.getAllLogins();
    res.render('users/users', { logins })
})

app.all('*', (req, res, next) => {
    next(new AppError('The page that you requested cannot be found. :(', 404))
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'something went wrong' } = err;
    res.status(status);
    res.render('error', { err })
})
//Start Listening
const port = process.env.Port ? process.env.port : 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}. It works`)
});