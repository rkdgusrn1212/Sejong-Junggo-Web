var express = require('express');
var router = express.Router();
var db = require('../../db-server');

router.post('/', function(req, res){
	if(!req.isAuthenticated()){
		res.redirect('/login');
		return;
	}
	if(req.body.user_id!=null&&req.body.phone_num!=null){
		db.query("insert into user ( auth_provider, auth_id, user_id, phone_num) VALUES (?,?,?,?)",[req.session.passport.user.auth_provider,req.session.passport.user.auth_id, req.body.user_id,req.body.phone_num],(err, result)=>{
			if(err){
				console.log(err);
				res.status(500).send('query failed');
			}else{
				req.session.passport.user.signup = true;
				req.session.passport.user.user_id = req.body.user_id;
				res.redirect('/');
			}
		});
	}else{
		res.status(400).send('body validation failed');
	}
});

router.get('/', (req, res)=>{
	if(!req.isAuthenticated()){
		res.redirect('/login');
		return;
	}
	db.query("select * from user where auth_id = ?",[req.session.passport.user.auth_id],(err,row,feild)=>{
		if(err){
			console.log(err);
			res.status(500).send("query failed");
		}else{
			res.send(row);
		}
	});
});

router.put('/', (req, res)=>{
	if(!req.isAuthenticated()){
		res.redirect('/login');
		return;
	}
	db.query("update user set user_id = ?, phone_num = ? where auth_id = ?",[req.body.user_id, req.body.phone_num, req.session.passport.user.auth_id],(err,result)=>{
		if(err){
			console.log(err);
			res.status(500).send("query failed");
		}else{
			req.session.passport.user.user_id=req.body.user_id;
			res.send({result:'success'});
		}
	});
});
module.exports = router;
