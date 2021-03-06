var bodyParser = require('body-parser');
var user = require('./user');
var item = require('./item');
var login = require('./login');
var category = require('./category');
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
      maxAge: 1000 * 60 * 60 //쿠키가 한시간안에 만료된다.
    },
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/login',login);
  app.use('/user',user);
  app.use('/item', item);
  app.use('/category',category);
  app.get('/',function(req, res){
    if(req.session.passport==null||req.session.passport.user==null){
      res.render('main.html',{login:false, page:'main'});
    }else{
      res.render('main.html',{login:true, user:req.session.passport.user, page:'main'});
    }
  });
  app.get('/test',(req, res)=>{
    res.render('test.html');
  });
  app.get('/edit/:id',(req,res)=>{
    if(req.isAuthenticated()){
      //로그인됨.
      if(req.user.signup){
        //필수정보 등록됨.
        //id가 양의 정수일때 참인 정규표현식
        let regex = /^[1-9][0-9]*$/;
        if(regex.test(req.params.id)){
          //url 파라미터가 정수.
          res.render('edit.html',{login:true, user:req.session.passport.user, id:req.params.id, page:'edit'});
        }else{
          //잘못된 url 파라미터.
          res.status(400).send("INVALID_URL");
        }
      }else{
        //필수정보 미등록.
        res.redirect('/login/signup');
      }
    }else{
      //로그인 안됨.
      res.redirect('/login');
    }
  });
  app.get('/search',(req, res)=>{
    if(req.session.passport==null||req.session.passport.user==null){
      res.render('search.html',{login:false, page:'search', query:req.query});
    }else{
      res.render('search.html',{login:true, user:req.session.passport.user, page:'search', query:req.query});
    }
  });
  app.get('/post/:id',(req, res)=>{
    if(req.session.passport==null||req.session.passport.user==null){
        res.render('post.html',{login:false, page:'post', id:req.params.id, user:{auth_id:null}});
    }else{
      res.render('post.html',{login:true, user:req.session.passport.user, page:'post', id:req.params.id});
    }
  });
  app.get('/my_items',(req, res)=>{
    if(req.session.passport==null||req.session.passport.user==null){
      res.redirect('/login');
    }else{
      if(req.session.passport.user.signup){
        res.render('my_items.html',{login:true, user:req.session.passport.user, page:'my_items'});
      }else{
        res.redirect('/login/signup');
      }
    }
  });
  app.get('/my_requests',(req, res)=>{
    if(req.session.passport==null||req.session.passport.user==null){
      res.redirect('/login');
    }else{
      if(req.session.passport.user.signup){
        res.render('my_requests.html',{login:true, user:req.session.passport.user, page:'my_requests'});
      }else{
        res.redirect('/login/signup');
      }
    }
  });
  app.get('/my_info',(req, res)=>{
    if(req.isAuthenticated()){
      if(req.user.signup){
        res.render('my_info.html',{login:true, user:req.user, page:'my_info'});
      }else{
        res.redirect('/login/signup');
      }
    }else{
      res.redirect('/login');
    }
  });
  //시세가 불러오는 get메소드.
  app.get('/market_price',(req, res)=>{
    let queryText = req.query.item_name;
    //파이썬을 child process로 호출하여 시세값을 크롤링한다.
    const spawn = require('child_process').spawn;
    //다나와 크롤링 파이썬 프로세스를 스폰하면서 쿼리텍스트를 인자로 넘긴다.
    const py = spawn('python', ['Danawa_crawling.py', queryText]);
    py.stdout.on('data', function(data){
      let price = data.toString();
      let subPrice = price.substring(0,price.length-2);
      if(subPrice == -1){
        res.status(400).send("NO_MARKET_PRICE");
      }else{
        res.send({
          item_name:queryText,
          item_price:subPrice
        });
      }
    });
  });
};
