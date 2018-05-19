var express = require('express');
var router = express.Router();

router.get('/price', function(req, res){
	res.send('5000');
});

router.get('/name', function(req, res){
	res.send('this is item name');
});

module.exports = router;
