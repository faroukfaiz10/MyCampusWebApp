var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { Client } = require('pg')

// Informations for connecting to database
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mycampus',
    password: 'root',
    //port: 3211,
  })

client.connect()

// For parsing request objects from post requests
app.use(bodyParser.urlencoded({extended: true}));

// For using EJS to generate html documents
app.set("view engine", "ejs");

packagesList=[];

// Index page
app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    // Retrieve data (packages) from database 
    client.query('SELECT * FROM colis JOIN students ON students.email_address = colis.email ORDER BY colis_id DESC', function(err, allPackages) {
        // Render the 'packages' page after retrieving data
        res.render("packages", {packagesList:allPackages.rows});
    })
})

// Post request after adding new package
app.post("/packages", function(req, res){
    // Data received from the form
    args = [req.body.email, "En attente", req.body.sender]
    // Adding data to packages table
    client.query('INSERT INTO colis (email, status, sender) VALUES ($1, $2, $3)', args, function (err,res2){
        // Redirecting to packages page to display the package just added
        res.redirect("/packages");
    });
})

app.listen('3000');