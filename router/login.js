var express = require('express');
var router = express.Router();
var db = require('../db-server');
var passport = require('passport');
var auth_config = require('../secret/auth');
var KakaoStrategy = require('passport-kakao').Strategy;

/*로그인 성공시 사용자 정보를 Session에 저장한다*/
passport.serializeUser(function (user, done) {
    console.log("serializeUser");
  done(null, user)
});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function (user, done) {
    console.log("deserializeUser");
  done(null, user);
});

/*로그인 유저 판단 로직*/
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
};

var isNotAuthenticated = (req, res, next)=>{
  if(req.isAuthenticated()){
    res.redirect('/');
  }else{
    next();
  }
}

/**
 * 1. 중복성 검사
 * */
loginByThirdparty = (info, callback) => {

  console.log('kakao auth accepted');

  let sql_query_user = 'select * from `user` where `auth_id` = ?';

  db.query(sql_query_user, info.auth_id, function (err, result) {
    if (err) {
      return callback(err);
    } else {
      if (result.length === 0) {
        callback(null, {
          'auth_provider':info.auth_provider,
          'auth_id': info.auth_id,
          'user_id': info.auth_name,
          'signup':false
        });
      } else {
        //로그인
        console.log('login user');
        callback(null, {
          'auth_provider':result[0].auth_provider,
          'auth_id': result[0].auth_id,
          'user_id': result[0].user_id,
          'signup':true
        });
      }
    }
  });
}

// kakao로 로그인
passport.use(new KakaoStrategy({
    clientID: auth_config.federation.kakao.client_id,
    callbackURL: auth_config.federation.kakao.callback_url
  },
  function (accessToken, refreshToken, profile, callback) {
    var _profile = profile._json;
    console.log('Kakao login info');
    console.info(_profile);
    loginByThirdparty({
      'auth_provider': 'kakao',
      'auth_id': 'kakao'+_profile.id,
      'auth_name': _profile.properties.nickname,
    }, callback);
  }
));


router.get('/',isNotAuthenticated,(req, res)=>{
  res.render('login.html',{login:false, page:'login'});
});
// kakao 로그인
router.get('/kakao',
  passport.authenticate('kakao')
);
// kakao 로그인 연동 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', {
    successRedirect: '/login/signup',
    failureRedirect: '/login'
  })
);
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
  console.log('logout');
});

router.get('/signup', isAuthenticated, function (req, res) {
  console.log(req.session.passport);
  if(req.session.passport.user.signup){
    res.redirect('/');
  }else{
    res.render('signup.html', {login:true,
      user: req.session.passport.user
    , page:'signup'})
  }
})

module.exports = router;
