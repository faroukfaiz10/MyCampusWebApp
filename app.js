var express = require("express");
var app = express();
var bodyParser = require("body-parser");

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

app.listen('3000');