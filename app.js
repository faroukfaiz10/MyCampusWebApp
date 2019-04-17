var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'mycampus',
    password: 'root',
    //port: 3211,
  })

client.connect()

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

packagesList=[];

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    client.query('SELECT * FROM colis JOIN students ON students.email_address = colis.email ORDER BY colis_id DESC', (err, res2) => {
        packagesList = res2.rows;
    })
    res.render("packages", {packagesList:packagesList});
})

app.post("/colis", function(req, res){
    args = [req.body.email, "En attente", req.body.sender]
    client.query('INSERT INTO colis (email, status, sender) VALUES ($1, $2, $3)', args, (err, res2) => {
        res.redirect("/packages")
    })
})

client.query('SELECT * FROM colis JOIN students ON students.email_address = colis.email', (err, res) => {
    packagesList = res.rows;
})

app.listen('3000');