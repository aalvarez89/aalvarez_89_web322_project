const express = require('express');
const exphbs = require('express-handlebars');
const db = require('./model/services.js');
const bodyParser = require('body-parser');
// const file = require('fs');

// app is an Express instance
const app = express();

// Set Handlebars as Templating Engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Load Static Resources
app.use(express.static('public'));

// Parse Encoded URL, it tells Express to make form data available
// via req.body in every request
app.use(bodyParser.urlencoded({ extended: false }));


const fakeDB = new db();

// Middleware function Signature
// app.use((req, res, next) => {})

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Hunger Street',
        services: fakeDB.getServices(),
    })
})

app.get('/meals', (req, res) => {
    res.render('meals', {
        title: 'Top Meal Packages',
        services: fakeDB.getServices()
    })
})


app.get('/registration', (req, res) => {
    res.render('registration', {
        title: 'Register'
    })
})

app.post('/registration', (req, res) => {
    // res.render('registration', {

    // })
    console.log(`Phone Numer: ${req.body.firstName}`)
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.listen(3000, () => {
    console.log('Server up and listening!')
})