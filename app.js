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
    {lastName:"Faiz",firstName:"Farouk",email:"farouk.faiz@imt-atlantique.net", sender:"Colissimo"},
    {lastName:"Doubli",firstName:"Youssef",email:"youssef.doubli@imt-atlantique.net", sender:"UPS"},
];

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/packages", function(req, res){
    res.render("packages", {packagesList:packagesList});
})

app.post("/colis", function(req, res){
    packagesList.push({lastName:"Last name",firstName:"First name", email:req.body.email, sender:req.body.sender})
    res.redirect("/packages")
})

/*client.query('SELECT * FROM users', (err, res) => {
    console.log(res.rows[0])
    client.end()
  })*/

app.listen('3000');