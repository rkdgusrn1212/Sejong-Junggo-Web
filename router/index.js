var bodyParser = require('body-parser');
var user = require('./user');
var item = require('./item');
var login = require('./login');
var passport = require('passport');
var session = require('express-session');
var sessionSecret = require('../secret/session');

module.exports = function(app){
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(session({
    secret: sessionSecret,
    resave: false,
    cookie:{
      maxAge: 1000 * 60 * 60 // cookie expired in 1hour.
    },
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/login',login);
  app.use('/user',user);
  app.use('/item', item);
  app.get('/',function(req, res){
    console.log(req.session);
    if(req.session.passport==null||req.session.passport.user==null){
      res.render('index.html',{login:false});
    }else{
      res.render('index.html',{login:true, user:req.session.passport.user});
    }
  });
};
