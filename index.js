/**
 * Andrew Alvarez
 * 131005191 - aalvarez12
 * WEB322 Milestone Project
 * 
 * Heroku Link:
 * Github Link:
 * 
 */

// ------------- FRAMEWORK -------------

const express = require('express');

// app is an Express instance
const app = express();

// const file = require('fs');
require('dotenv').config()



// ------------- TEMPLATE ENGINE -------------

const exphbs = require('express-handlebars');

// Set Handlebars as Templating Engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');



// Load Static Resources
app.use(express.static('public'));


// ------------- BODY PARSER -------------

const bodyParser = require('body-parser');

// Parse Encoded URL, it tells Express to make form data available
// via req.body in every request
app.use(bodyParser.urlencoded({ extended: false }));


// ------------- EMAIL SERVICE -------------

// Extract Sensitive info from DOTENV
const mailgun = require('mailgun-js')({apiKey: process.env.MG_KEY, domain: process.env.MG_DOM});



// ------------- DATABASE -------------

// Instance of our fake Database 
const fdb = require('./model/services.js');
const fakeDB = new fdb();

// Database Module that handles all DB operations
const db = require('./db_module.js');


// ------------- SESSIONS -------------

const clientSessions = require("client-sessions");

// Setup Cookie
app.use(clientSessions({
    cookieName: "session",          // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 1 * 60 * 1000,        // duration of the session in milliseconds (4 minutes)
    activeDuration: 60/60 * 1000    // the session will be extended by this many ms each request (1 minutes)
  }));


// ------------- MIDDLEWARE -------------

// Middleware function Signature
// app.use((req, res, next) => {})

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Hunger Street',
        services: fakeDB.getServices(),
    })
})

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } 
    else {
      next();
    }
}

/*
function ensureAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role!="admin") {
      res.redirect("/login");
    } else {
      next();
    }
}
*/

app.get('/meals', (req, res) => {
    res.render('meals', {
        title: 'Top Meal Packages',
        services: fakeDB.getServices()
    })
})

app.get('/users', (req, res) => {
    db.getStudents().then((data) => {
        res.render('users', {users: data});
    }).catch((err) => {
        res.render('users');
    })
});

app.get('/registration', (req, res) => {
    res.render('registration', {
        title: 'Register'
    })
})

//Handle submitted data from /registration form
app.post('/registration', (req, res) => {

    let errors = {
        messages : [],
        fName: '',
        lName: '',
        email: ''
    };

    
    if (req.body.firstName == '') {

        errors.messages.push('You must enter a First Name')
    } else {

        errors.fName = req.body.firstName;
    }

    if (req.body.lastName == '') {

        errors.messages.push('You must enter a Last Name')
    } else {
        errors.lName = req.body.lastName;
    }

     // Email Regex anyword+@+anyword+.+alphanumeric
     if (req.body.email == '') {

        errors.messages.push(`Email required`)
    } else {
        if (!req.body.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){

            errors.messages.push(`Email format invalid`)
        } else {
            errors.email = req.body.email;
        }
    }

    // Password Regex 1 lowercase/uppercase/number/specialchar && 4 to 15 characters
    if (req.body.password == '' ) {

        errors.messages.push('Password Required')

    } else if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,15}$/)) {

        errors.messages.push('Password requires 4-15 Characters and 1 Lowercase/Uppercase/Number/Special Character')
    }

    if (errors.messages.length > 0) {
        res.render('registration', errors)
        console.log(errors.messages)
    } else {

        let mailData = {
            from: `${req.body.firstName} ${req.body.lastName} <me@samples.mailgun.org>`,
            to: req.body.email,
            subject: `Hello ${req.body.firstName}, we know you're Hungry`,
            text: 'Get ready to eat a big fat burguer! Only @ Hunger Street!'
        };

        mailgun.messages().send(mailData, (error, body) => {
            console.log(body);
        });

        db.addUser(req.body).then((inData) => {
            req.session.user = inData;
            res.redirect('/dashboard', {users : inData}) 
        }).catch((err) => {
            console.log(`Error adding user ${err}`)
            res.redirect('/registration')
        })
          
    }

})

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login'
    })
})

app.post('/login', (req, res) => {

    let errors = {
        messages : [],
        email: ''
    };

    // Email Validation
    if (req.body.email == '') {

        errors.messages.push(`Email required`)
    } else {
        if (!req.body.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){

            errors.messages.push(`Email format invalid`)
        } else {
            errors.email = req.body.email;
        }
    }

    // Password Validation
    if (req.body.password == '' ) {

        errors.messages.push(`Password Required`)

    } else if (!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,15}$/)) {

        errors.messages.push(`Password requires 4-15 Characters and 1 Lowercase / Uppercase / Number / Special Character`)
    }

    if (errors.messages.length > 0) {

        res.render('login', errors)
        console.log(errors.messages)

    } else {

        db.validateUser(req.body)
        .then((inData) => {
            // Logs in a user
            req.session.user = inData[0];
            console.log(req.session.user)

            // ??? when you render it doesn't change the URL???
            res.render("dashboard", {
                title: "Dashboard",
                users: inData[0]
            })
            // res.redirect('/dashboard')

        }).catch((err) => {
            console.log(err)
            res.redirect("/login")
        })

        

        //res.redirect('/')
    }

})



// app.get("/dashboard", (req, res) => {

//     // db.getUsersByEmail(req.query.email).then((data) => {
       
//     // }).catch((err) => {
//     //     res.render("dashboard")
//     // })

//     // res.render("dashboard", {
//     //     users: ,
//     //     user: req.session.user, 
//     //     layout: false
//     // });
//     db.getUsers().then((data) => {
//         res.render('dashboard', {
//             users: (data.length != 0 ) ? data : undefined,
//             title: 'Dashboard'
//         })
//     })

// });
  
// An authenticated route that requires the user to be logged in.
// Notice the middleware 'ensureLogin' that comes before the function
// that renders the dashboard page
app.get("/dashboard", ensureLogin, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard",
        users: req.session.user, 
        // layout: false
    });
});

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/");
  });

const PORT = process.env.PORT || 3000;

db.initialize()
.then(() => {
    console.log('Data read successfully')
    app.listen(PORT, () => {
        console.log(`Server up and listening on Port: ${PORT}!`)
    })

})
.catch((data) => {
    console.log(data)
})