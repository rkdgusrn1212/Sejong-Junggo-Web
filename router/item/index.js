var express = require('express');
var router = express.Router();
var db = require('../../db-server');
/*
item get 쿼리 조건
1. item_name을 포함하는 목록
2. owner_id를 포함하는 목록
order
1. item_price desc
2. item_price asc
3. item_time asc
4. item_time desc - default
limit
default  = 15;
*/
//item_time 반환 형식 ISO-8601 세계 표준시 기준.
router.get('/', function(req, res){
	console.log(req.query);
	var sql = 'SELECT item_id, item_name, item_price, owner_id, item_time, item_state FROM item';
	var conditions = [];
	if(req.query.item_name){
		conditions.push(" item_name like '%"+req.query.item_name+"%'");
	}
	if(req.query.owner_id){
		conditions.push(" owner_id like '%"+req.query.owner_id+"%'");
	}
	var i;
	for( i = 0;  i < conditions.length; i++){
		if(conditions.length === 0){
			sql+=' WHERE';
		}else{
			sql+=' AND';
		}
		sql += conditions[i];
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

//item_time 반환 형식 ISO-8601 세계 표준시 기준.
router.get('/:id',(req, res)=>{
	var sql ='SELECT * FROM item where item_id = '+req.params.id;
	db.query(sql, function(err, rows, fields){
		if(err){
			console.log(err);
			res.status(500).send("sever error!");
		} else {
			res.send(rows);
		}
	});
})

//body:{owner_id}, initiate item posting, 새 글 작성페이지를 열때 호출하면 될듯.
router.post('/', (req, res)=>{

	if(req.body.owner_id!=null){
		//item_state 'I'는 초기화된 상태를 의미.
		//UKNOWN은 문자열 값의 초기값. 그러나, 이값이 초기 상태임을 보장하지 않는다.
		//0은 정수형 자료의 초기값, 마찬가지로 초기상태를 보장하진 않는다.
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
		res.status(400).send("body validation failed");
	}
});
//body에 업데이트될 컬럼들을 JSON형태로 전송, ex) body{"item_name"="면도기"}, 저장버튼을 누를때 호출되면 될 듯
router.put('/:id', (req, res)=>{
	var sql = "UPDATE item SET";
	var validation = false;
	if(req.body.item_name){
		sql+=" item_name = '"+req.body.item_name+"',";
		validation = true;
	}
	if(req.body.item_specific){
		sql+=" item_specific = '"+req.body.item_specific+"',";
		validation = true;
	}
	if(req.body.item_price){
		sql+=" item_price = '"+req.body.item_price+"',";
		validation = true;
	}
	if(req.body.item_method){
		sql+=" item_method = '"+req.body.item_method+"',";
		validation = true;
	}

	if(validation){
		sql+= " item_time = NOW() WHERE item_id = "+req.params.id;
		db.query(sql, (err, result)=>{
			if(err){
				console.log(err);
				res.status(500).send("query failed");
			}else{
				res.send("success");
			}
		});
	}else{
		res.status(400).send("body validation failed");
	}
});
//item 삭제
router.delete('/:id', (req, res)=>{
	var sql = "DELETE FROM item WHERE item_id = '"+req.params.id+"'";
	db.query(sql, (err, result)=>{
		if(err){
			res.status(500).send("query failed");
		}else{
			res.send('success');
		}
	});
});

module.exports = router;
