const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const carRoutes = require('./routes/cars');
const accRoutes = require('./routes/accounts');
const usersRoutes = require('./routes/users');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const dbObjects = require('./utils/dbObjects')
const dbFunctions = require('./utils/dbFunctions');
const { render } = require('ejs');
const AppError = require('./utils/appError');

app.engine('ejs', ejsMate);
//Setting up express to use ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Accepting html form posts
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('thisismysecret'));
//setting up the options for the session
const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: 'thisismysecret',
    cookie: {
        maxAge: 1000 * 60 * 20
    }
}
app.use(session(sessionConfig));
app.use(methodOverride('_method'));
//Adding static files
app.use(express.static('public'));

app.use(flash());
app.set('public', path.join(__dirname), 'public')



//middleware to initialize the variable isLoggedIn in the session to false
app.use((req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.session.isLoggedIn = false;
    }
    res.locals.isLoggedIn = req.session.isLoggedIn;
    if (req.session.personID) {
        res.locals.personID = req.session.personID
        res.locals.loginID = req.session.loginID
    }
    res.locals.messages = req.flash('success');
    next();
})
//Seting up RESTful routes
app.use('/cars', carRoutes);
app.use('/accounts', accRoutes)
app.use('/users', usersRoutes);
//Home
app.get('/', async (req, res) => {
    // if (isLoggedIn) {
    //     currentLoggedInUserPersonInfo = await dbFunctions.getPersonInfo(currentLoggedInUser);
    // }
    res.render('home');
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
    res.render('cars/show', { cars })
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
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}. It works`)
});