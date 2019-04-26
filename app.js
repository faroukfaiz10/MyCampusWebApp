var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { Client } = require('pg')

// Informations for connecting to database
const client = new Client({
    connectionString: "postgres://uqvdtwfrgprpiu:e38b4d2280afdbd47a58c205a65af5c3abeb07c3892066cbe4c7ba046643b604@ec2-54-247-82-210.eu-west-1.compute.amazonaws.com:5432/d49o42sht2rmp9",
    ssl: true,
  })

client.connect()

// For parsing request objects from post requests
app.use(bodyParser.urlencoded({extended: true}));
 
// The path to directory containing files
app.use(express.static(__dirname + "/public"));

// For using EJS to generate html documents
app.set("view engine", "ejs");

// Index page
app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    // Retrieve data (packages) from database 
    client.query('SELECT * FROM colis JOIN students ON students.email_address = colis.email ORDER BY colis_id DESC', function(err, allPackages) {
        if(err){
            console.log(err);
        } else{
            // Render the 'packages' page after retrieving data and number of rows
            res.render("packages", {packagesList:allPackages.rows, numberOfRows:allPackages.rows.length});
        }
    })
})

// Post request after adding new package
app.post("/packages", function(req, res){
    // Data received from the form
    args = [req.body.email, "En attente", req.body.sender]
    // Adding data to packages table
    client.query('INSERT INTO colis (email, status, sender) VALUES ($1, $2, $3)', args, function (err,res2){
        if (err){
            console.log(err);
        } else{
            // Redirecting to packages page to display the package just added
            res.redirect("/packages");
        }
    });
})

// Post request after editing a package
app.post("/packages/:id", function(req, res){
    // Data received from the form
    args = [req.body.email, req.body.sender, req.params.id]
    // Adding data to packages table
    client.query('update colis set email = $1, sender = $2 where colis_id = $3;', args, function (err,res2){
        if (err){
            console.log(err);
        } else{
            // Redirecting to packages page to display the package just added
            res.redirect("/packages");
        }
    });
})

// Postrequest after deleting a package
app.post("/packages/delete/:id", function(req, res){
    // Data received from the form
    args = [req.params.id]
    // Adding data to packages table
    client.query('delete from colis where colis_id = $1;', args, function (err,res2){
        if (err){
            console.log(err);
        } else{
            // Redirecting to packages page to display the package just added
            res.redirect("/packages");
        }
    });
})

app.get("/getPackages", function(req,res){
    client.query('SELECT email_address FROM students', function(err, allEmails) {
        if(err){
            console.log(err);
        } else{
            res.send(allEmails)            
        }
    })
})

app.listen('3000');