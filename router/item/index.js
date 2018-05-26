var express = require('express');
var router = express.Router();
var db = require('../../db-server');

/*
item get 쿼리 조건
1. item_name을 포함하는 목록
2. owner_id를 포함하는 목록
3. item_id에 해당하는 item 상세.
order
1. item_price desc
2. item_price asc
3. item_time asc
4. item_time desc - default
limit
default  = 15;
*/
router.get('/', function(req, res){
	console.log(req.query);
		var sql="";
		if(req.query.item_id!=null){
			sql+='SELECT * FROM item where item_id = '+req.query.item_id;
		}else{
			sql+= 'SELECT item_id, item_name, item_price, owner_id, item_time, item_state FROM item';
			if(req.query.item_name){
				sql+=" where item_name like '%"+req.query.item_name+"%'";
			}else if(req.query.owner_id){
				sql+" where owner_id like '%"+req.query.owner_id+"%'";
			}


			if(req.query.item_price==='desc'){
				sql+=' order by item_price desc, item_time desc';
			}else if(req.query.item_price==='asc'){
				sql+=' order by item_price asc, item_time desc';
			}else if(req.query.item_time==='asc'){
				sql+=' order by item_time asc, item_price asc';
			}else{
				sql+=' order by item_time desc, item_price asc';
			}

			sql+=' limit '
			if(req.query.start){
				sql+=req.query.start;
			}else{
				sql+='0';
			}

			sql+=', ';
			if(req.query.count){
				sql+=req.query.count;
			}else{
				sql+='15';
			};
		}

		db.query(sql, function(err, rows, fields){
			if(err){
				console.log(err);
				res.status(500).send("sever error!");
			} else {
				console.log("query success!");
				res.send(rows);
			}
		});
});


//body:{owner_id}, initiate item posting.
router.post('/', (req, res)=>{
	var result;
	console.log(req.body);
	if(req.body.owner_id!=null){
		var sql = "INSERT INTO item VALUES(NULL,'UNKNOWN', '"+req.body.owner_id+"', NULL, NOW(), 0, 'UNKNOWN', 'I', NULL)"
		db.query(sql, (err, result)=>{
			if(err){
				console.log(err);
				res.status(500).send("query failed");
			}else{
				res.send('success');
			}
		})
	}else{
		res.status(400).send("body validation error");
	}
});


router.get('/name', function(req, res){
	res.send('this is item name');
});

module.exports = router;
