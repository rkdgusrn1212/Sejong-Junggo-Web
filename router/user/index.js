var express = require('express');
var router = express.Router();

router.get('/id', function(req, res){
	res.send('some id');
});

router.get('/name', function(req, res){
	res.send('this is name');
});

module.exports = router;
