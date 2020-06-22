const express = require('express');
const exphbs = require('express-handlebars');
const db = require('./model/services.js')
// const file = require('fs');

const app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static("public"));


const fakeDB = new db();

app.get("/", (req, res) => {
    res.render("home", {
        title: "Hunger Street",
        services: fakeDB.getServices(),
    })
})

app.get("/meals", (req, res) => {
    res.render("meals", {
        title: "Top Meal Packages",
        services: fakeDB.getServices()
    })
})

app.get("/registration", (req, res) => {
    res.render("registration", {
        title: "Register"
    })
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.listen(3000, () => {
    console.log('Server up and listening!')
})