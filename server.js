var express = require('express');
var app = express();
var router = require('./router')(app);


app.set('views', __dirname +'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(8999, function(){
  console.log("server has started on port 8999")
});
