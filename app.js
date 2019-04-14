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

packagesList=[
    {name:"Faiz Farouk", sender:"Colissimo"},
    {name:"Doubli Youssef", sender:"UPS"},
];

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    res.render("packages", {packagesList:packagesList});
})

app.post("/packages", function(req, res){
    var name = req.body.name;
    var sender = req.body.sender
    var newpackage = {name: name, sender: sender}
    packagesList.push(newpackage);
    res.redirect("/packages")
})

app.get("/packages/new", function(req, res){
    res.render("new")
})

client.query('SELECT * FROM users', (err, res) => {
    console.log(res.rows[0])
    client.end()
  })

app.listen('3000');