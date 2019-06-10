var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
const { Client } = require('pg');
require("dotenv").config();

var app = express();
var passport = require("passport");
var session = require("express-session");
var bcrypt = require("bcrypt")
var LocalStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");

var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');
const docx = require("@nativedocuments/docx-wasm");

// Informations for connecting to database
const client = new Client({
    connectionString: process.env.URL,
    ssl: true,
  })

client.connect()

app.use(flash());
app.use(require("cookie-parser")());
app.use(session({
    secret: "mySecretKey", // To change
    resave: false, 
    saveUninitialized: true
})); 
app.use(passport.initialize());
app.use(passport.session());

// For parsing request objects from post requests
app.use(bodyParser.urlencoded({extended: true}));

// Function for adding an account given a username and a password as a string
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
        res.redirect("/");
    }
    else{
        res.render("login",{messages: {danger: req.flash("danger"), warning: req.flash("warning"), success: req.flash("success")}});
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
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
    res.redirect("/login");
});

passport.use("local", new LocalStrategy({passReqToCallback : true}, (req, username, password, done) => {
    try{
        client.query("SELECT username, password FROM account WHERE username=$1", [username], function(err, result) {
            if(err) {
                return done(err)
            } 
            if(result.rows[0] == null){
                console.log("Username not in database!")
                req.flash('danger', "Identifiants incorrects, veuillez réessayer!");
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
                        req.flash('danger', "Identifiants incorrects, veuillez réessayer!");
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

app.set("view engine", "ejs");

// Index page
/*app.get("/", function(req, res){
    res.render("landing");
});*/

app.get("/", function(req, res){
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
    args = [req.body.email, "En attente", req.body.sender, getLocation(req.body.location), getDate(req.body.date), req.body.comment, req.body.packageNumber]
    // Adding data to packages table
    client.query('INSERT INTO colis (email, status, sender, location, date, comment, packagenumber) VALUES ($1, $2, $3, $4, $5, $6, $7)', args, function (err,res2){
        if (err){
            console.log(err);
        } 
        else{
            // Redirecting to packages page to display the package just added
            res.redirect("/");
        }
    });
})

// Post request after editing a package
app.post("/packages/:id", function(req, res){
    // Data received from the form
    args = [req.body.email, req.body.sender, getLocation(req.body.location), getDate(req.body.date), req.body.comment, req.body.packageNumber, req.params.id]
    // Adding data to packages table
    client.query('UPDATE colis SET email = $1, sender = $2, location = $3, date = $4, comment = $5, packagenumber = $6 WHERE colis_id = $7;', args, function (err,res2){
        if (err){
            console.log(err);
        } 
        else{
            // Redirecting to packages page to display the package just added
            res.redirect("/");
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
            res.redirect("/");
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

app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("Mycampus web app has started!")
});

app.get("/packages.pdf", function(req,res){
    if(req.isAuthenticated()){
        client.query('SELECT first_name, last_name, sender, date, packagenumber FROM colis JOIN students ON students.email_address = colis.email ORDER BY colis_id DESC', function(err, allPackages) {
            if(err){
                console.log(err);
            } 
            else{
                // Add the short date to the packages info
                for(i=0; i< allPackages.rows.length; i++){    
                    allPackages.rows[i].shortDate = shortDateFormat(allPackages.rows[i].date)
                }     

                //Load the docx file as a binary
                var content = fs.readFileSync(path.resolve(__dirname, 'packages2.docx'), 'binary');

                var zip = new JSZip(content);

                var doc = new Docxtemplater();
                doc.loadZip(zip);

                //Set the template variables
                doc.setData({
                    packages : allPackages.rows
                });
        
                try {
                    doc.render()
                }
                catch (error) {
                    throw error;
                }

                // buf is a NodeJS buffer
                var buf = doc.getZip().generate({type: 'nodebuffer'});
        
                fs.writeFileSync(path.resolve(__dirname, 'packagesoutput.docx'), buf);
        
                // Init docx engine
                docx.init({
                    ND_DEV_ID: "5BFAVRPS5LB60RAHLTONI0MUTS",
                    ND_DEV_SECRET: "54427DDKQF3BEF6M57OP0DVPN4",
                    ENVIRONMENT: "NODE",
                    LAZY_INIT: true      // if set to false the WASM engine will be initialized right now, usefull pre-caching (like e.g. for AWS lambda)
                }).catch( function(e) {
                    console.error(e);
                });
                
                async function convertHelper(document, exportFct) {
                    const api = await docx.engine();
                    await api.load(document);
                    const arrayBuffer = await api[exportFct]();
                    await api.close();
                    return arrayBuffer;
                }
                
                convertHelper(buf, "exportPDF").then((arrayBuffer) => {
                    fs.writeFile("packages.pdf", new Uint8Array(arrayBuffer), (err)=>{
                        var file = __dirname + "/packages.pdf";
                        res.download(file)
                    });
                }).catch((e) => {
                    console.error(e);
                });
            }
        })
    } 
    else{
        res.redirect("/login");
    }
})

