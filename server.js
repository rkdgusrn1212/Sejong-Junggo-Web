var express = require('express');
var app = express();
var router = require('./router')(app);
var mysql      = require('mysql');
var dbconfig   = require('./secret/database.js');
var connection = mysql.createConnection(dbconfig);


app.set('views', __dirname +'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(5021, function(){
  console.log("server has started on port 5021")
});
