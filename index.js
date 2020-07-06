const express = require('express');
const exphbs = require('express-handlebars');
const db = require('./model/services.js');
const bodyParser = require('body-parser');
const e = require('express');
// const file = require('fs');

// Abstract Secret API KEY - (email.js is obfuscated in .gitignore)
const apiKey = require('./model/email.js');
const emailService = new apiKey();


// Extract Sensitive info from Email Service
const API_KEY = emailService.getKey();
const DOMAIN = emailService.getDomain();
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});




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

//Get /registration site
app.get('/registration', (req, res) => {
    res.render('registration', {
        title: 'Register'
    })
})

//Handle submitted data from /registration form
app.post('/registration', (req, res) => {

    let errors = {
        messages : [],
        fName: "",
        lName: "",
        email: ""
    };

    
    if (req.body.firstName == "") {

        errors.messages.push('You must enter a First Name')
    } else {

        errors.fName = req.body.firstName;
    }

    if (req.body.lastName == "") {

        errors.messages.push('You must enter a Last Name')
    } else {
        errors.lName = req.body.lastName;
    }

     // Email Regex anyword+@+anyword+.+alphanumeric
     if (req.body.email == "") {

        errors.messages.push(`Email required`)
    } else {
        if (!req.body.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){

            errors.messages.push(`Email format invalid`)
        } else {
            errors.email = req.body.email;
        }
    }

    // Password Regex 1 lowercase/uppercase/number/specialchar && 4 to 15 characters
    if (req.body.password == "" ) {

        errors.messages.push(`Password Required`)

    } else if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,15}$/)) {

        errors.messages.push(`Password requires 4-15 Characters and 1 Lowercase/Uppercase/Number/Special Character`)
    }

    if (errors.messages.length > 0) {
        res.render('registration', errors)
        console.log(errors.messages)
    } else {

        const data = {
            from: 'Excited User <me@samples.mailgun.org>',
            to: 'aa.elijah89@gmail.com',
            subject: `Hello ${req.body.firstName}`,
            text: 'Testing some Mailgun awesomeness!'
        };

        mailgun.messages().send(data, (error, body) => {
            console.log(body);
        });
          
        res.redirect('/')
    }

})

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login'
    })
})

app.post('/login', (req, res) => {
    let errors = [];
   

   
    res.render('login')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server up and listening!')
})


// echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
// echo "sendgrid.env" >> .gitignore
// source ./sendgrid.env