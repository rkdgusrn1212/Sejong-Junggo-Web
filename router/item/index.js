var express = require('express');
var router = express.Router();
var db = require('../../db-server');

router.get('/', function(req, res){
	console.log(req.query);
		var sql = 'SELECT * FROM item ';
		db.query(sql, function(err, rows, fields){
			if(err){
				console.log(err);
			} else {
				for(var i=0; i<rows.length; i++){
					console.log(rows[i].name);
				}
				res.send(rows);
			}
		});
	/**/
});

router.get('/name', function(req, res){
	res.send('this is item name');
});

module.exports = router;
