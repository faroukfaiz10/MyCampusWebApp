var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
const { Client } = require('pg');
require("dotenv").config();

var app = express();
var passport = require("passport");
var session = require("express-session");
var RedisStore = require('connect-redis')(session);
var bcrypt = require("bcrypt")
var LocalStrategy = require("passport-local").Strategy;


// Informations for connecting to database
const client = new Client({
    connectionString: process.env.URL,
    ssl: true,
  })

client.connect()


app.use(require("cookie-parser")());
app.use(session({
    store: new RedisStore({client:client}),
    secret: "mySecretKey", 
    resave: false, 
    saveUninitialized: true
})); // To change
app.use(passport.initialize());
app.use(passport.session());



// For parsing request objects from post requests
app.use(bodyParser.urlencoded({extended: true}));


function addAccount(usr,pwd){
    try{
        bcrypt.hash(pwd, 5, function(err,hashedPassword){
            client.query("SELECT username FROM account WHERE username=$1", [usr], function(err, result) {
                if(result.rows[0]){
                    console.log("Username already in database!")
                }
                else{
                    client.query("INSERT INTO account (username, password) VALUES ($1, $2)", [usr, hashedPassword], function(err, result) {
                        if(err){
                            console.log(err)
                        }
                        else {
                            console.log(result)
                        }
                    });
                }    
            });
        });
    } 
    catch(e){throw(e)}
}

app.get("/login", function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/packages");
    }
    else{
        res.render("login");
    }
});
    
app.post("/login", passport.authenticate("local", {
    successRedirect: "/packages",
    failureRedirect: "/login",
    }), function(req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect("/");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

passport.use("local", new LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {
    try{
        client.query("SELECT username, password FROM account WHERE username=$1", [username], function(err, result) {
            if(err) {
                return done(err)
            } 
            if(result.rows[0] == null){
                console.log("Username not in database!")
                return done(null, false);
            }
            else{
                bcrypt.compare(password, result.rows[0].password, function(err, check) {
                    if (err){
                        console.log("Error while checking password");
                        return done();
                    } 
                    else if (check){
                        return done(null, {username: result.rows[0].username});
                    } 
                    else{
                        console.log("Incorrect password!")
                        return done(null, false);
                    }
                });
            }
        })
    }
    catch(e){
        throw (e);
    }
}))
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

//Send a ping to the chatbot server
request.post("https://mycampus-imt.herokuapp.com/ping")
 
// The path to directory containing files
app.use(express.static(__dirname + "/public"));

// For using EJS to generate html documents
app.set("view engine", "ejs");

// Index page
app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    if(req.isAuthenticated()){
        // Retrieve data (packages) from database 
        client.query('SELECT * FROM colis JOIN students ON students.email_address = colis.email ORDER BY colis_id DESC', function(err, allPackages) {
            if(err){
                console.log(err);
            } 
            else{
                packagesList=[]
                // Add the (key,value) pair for shortDate format to all packages
                allPackages.rows.forEach(function(package){
                    package.shortDate = shortDateFormat(package.date);
                    packagesList.push(package)
                })
                // Render the 'packages' page after retrieving data and number of rows
                res.render("packages", {packagesList:packagesList, numberOfRows:allPackages.rows.length});
            }
        })
    } 
    else{
        res.redirect("/login");
    }
})

// Function for getting location
function getLocation(locationObject){
    if (locationObject[0] == "autre"){
        return locationObject[1]
    } 
    else{
        return locationObject
    }
}

// Function for getting date object
function getDate(dateString){
    var day   = parseInt(dateString.slice(0,2));
    var month = parseInt(dateString.slice(3,5));
    var year  = parseInt(dateString.slice(6,10));
    return new Date(year,month-1,day)
}


// Post request after adding new package
app.post("/packages", function(req, res){
    // Data received from the form
    args = [req.body.email, "En attente", req.body.sender, getLocation(req.body.location), getDate(req.body.date), req.body.comment]
    // Adding data to packages table
    client.query('INSERT INTO colis (email, status, sender, location, date, comment) VALUES ($1, $2, $3, $4, $5, $6)', args, function (err,res2){
        if (err){
            console.log(err);
        } 
        else{
            // Redirecting to packages page to display the package just added
            res.redirect("/packages");
        }
    });
})

// Post request after editing a package
app.post("/packages/:id", function(req, res){
    // Data received from the form
    args = [req.body.email, req.body.sender, getLocation(req.body.location), getDate(req.body.date), req.body.comment, req.params.id]
    // Adding data to packages table
    client.query('UPDATE colis SET email = $1, sender = $2, location = $3, date = $4, comment = $5 WHERE colis_id = $6;', args, function (err,res2){
        if (err){
            console.log(err);
        } 
        else{
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
    client.query('DELETE FROM colis WHERE colis_id = $1;', args, function (err,res2){
        if (err){
            console.log(err);
        } 
        else{
            // Redirecting to packages page to display the package just added
            res.redirect("/packages");
        }
    });
})



// Post request from front-end java script to get emails for Typeahead functionality and email verification
app.get("/emails", function(req,res){
    client.query('SELECT email_address FROM students', function(err, allEmailsObjects) {
        if(err){
            console.log(err);
        } 
        else{
            allEmails=[]
            allEmailsObjects.rows.forEach(function(emailObject){
                // Some emails are equal to null
                if (emailObject.hasOwnProperty("email_address") && emailObject.email_address != null ){ 
                    allEmails.push(emailObject.email_address)
                }
            })
            res.send(allEmails)            
        }
    })
})

// Get short date format from long date format
function shortDateFormat(longDate){
    let month = longDate.getMonth()+1
    return  longDate.getDate()+"/"+month+"/"+longDate.getFullYear()
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Mycampus web app has started!")
});