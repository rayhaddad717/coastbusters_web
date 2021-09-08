const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const mssql = require('mssql')

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const dbObjects = require('./dbObjects')
const dbFunctions = require('./dbFunctions')

let isLoggedIn = false;
let currentLoggedInUser;
let currentLoggedInUserPersonInfo;
let currentLoggedInUseSubscription;
//Setting up MS SQL
const config = {
    user: 'ray',
    password: '1234',
    server: 'localhost',
    options: {
        trustServerCertificate: true
    },
    database: 'Coast Busters'
}


//Accepting html form posts
app.use(express.urlencoded({ extended: true }))
//Setting up express to use ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Adding static files
app.use(express.static('public'));
app.set('public', path.join(__dirname), 'public')

//Seting up RESTful routes

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

//Customer
app.get('/mycars', async (req, res) => {
    if (isLoggedIn) {
        const cars = await dbFunctions.getRentedCarsByPerson(currentLoggedInUserPersonInfo.personID)
        const carsArray = cars.recordset;
        res.render('mycars', { carsArray, isLoggedIn });
    } else res.render('mycars', { isLoggedIn });
})


//Employee
//Add a new car
app.get('/cars/new', async (req, res) => {
    if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
        console.log('employee can login')
        res.render('newCar', { isLoggedIn })
    }
    else {
        res.render('nopermission', { isLoggedIn })
    }
})
//Post a new car
app.post('/cars', async (req, res) => {
    const carModel = new dbObjects.CarModel({ ...req.body })
    const carModelID = dbFunctions.insertNewCarModel(carModel);
    console.log(carModelID);
    setTimeout(() => res.redirect('/cars'), 500);
})
//Edit One Car
app.get('/cars/:id/edit', async (req, res) => {
    const car = await dbFunctions.getOneCar(req.params.id);
    res.render('editCar', { car, isLoggedIn })

})

app.patch('/cars/:id', async (req, res) => {
    const editedCar = new dbObjects.CarModel({ ...req.body })
    await dbFunctions.editCarModel(editedCar);
    setTimeout(() => { res.redirect('/cars') }, 500)
})


//Delete One Car
app.delete('/cars/:id', async (req, res) => {
    const carModelID = req.params.id;
    await dbFunctions.deleteOneCarModel(carModelID);
    res.redirect('/cars')
})
//Get One Car
app.get('/cars/:id', async (req, res) => {
    if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
        const car = await dbFunctions.getOneCar(req.params.id);
        const cars = [car];
        res.render('cars', { cars, isLoggedIn });
    }
    else {
        res.render('nopermission', { isLoggedIn })
    }
})

//Get All Cars
app.get('/cars', async (req, res) => {
    if (isLoggedIn && currentLoggedInUser.isCustomer === false) {
        console.log('employee can login')
        const cars = await dbFunctions.getAllCars();
        res.render('cars', { cars, isLoggedIn });
    }
    else {
        res.render('nopermission', { isLoggedIn })
    }
})



//Monitor Requests
app.use(() => {
    // console.log('got a request')
})

//Start Listening
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
