const express = require('express');
const router = express.Router();
require('./image')(router);
const db = require('../../db-server');
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
//item_state는 필수
router.get('/', function(req, res){
	var sql = "SELECT item_id, item_name, item_price, owner_id, item_time, item_state, item_main_image FROM item WHERE ";
	if(req.query.item_state){
		sql+= "item_state = '"+req.query.item_state+"'"
	}else{
		sql+= "item_state <> '"+req.query.item_state+"'"
	}
	if(req.query.item_name){
		sql+=" AND item_name like '%"+req.query.item_name+"%'";
	}
	if(req.query.owner_id){
	 sql+=" AND owner_id like '%"+req.query.owner_id+"%'";
	}
	if(req.query.category){
		sql = "SELECT item.item_id, item.item_name, item.item_price, item.owner_id, item.item_time, item.item_state, item.item_main_image, item_category.category FROM item INNER JOIN item_category ON item.item_id = item_category.item_id WHERE item_category.category = '"+req.query.category+"'";
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
			res.status(500).send("query failed");
		} else {
			console.log("query success!");
			res.send(rows);
		}
	});
});

//item_time 반환 형식 ISO-8601 세계 표준시 기준.
router.get('/:id',(req, res)=>{
	var sql ='SELECT item_id, item_name, owner_id, CONVERT(item_specific USING utf8), item_time, item_price, item_method, item_state, asker_id, item_main_image FROM item where item_id = '+req.params.id;
	db.query(sql, function(err, rows, fields){
		if(err){
			console.log(err);
			res.status(500).send("query failed");
		} else {
			res.send(rows);
		}
	});
})

//body:{owner_id}, initiate item posting, 새 글 작성페이지를 열때 호출하면 될듯.
router.post('/', (req, res)=>{
	if(req.body.owner_id!=null){
		//item_state 'M'는 글 수정중임을 의미.
		var sql = "INSERT INTO item ( owner_id, item_time, item_state) VALUES( '"+req.body.owner_id+"', NOW(), 'M')"
		db.query(sql, (err, result)=>{
			if(err){
				console.log(err);
				//query 실패를 클라이언트에 알림.
				res.status(500).send("QUERY_FAIL");
			}else{
				//query성공, 클라이언트에 새로 생성된 item의 id를 전달.
				res.send({item_id:result.insertId});
			}
		});
	}else{
		//owner_id값이 전달되지 않아 쿼리를 시작하지 않음, 잘못된 요청.
		res.status(400).send("BODY_VALIDATION_FAIL");
	}
});

//body에 업데이트될 컬럼들을 JSON형태로 전송, ex) body{"item_name"="면도기"}, 저장버튼을 누를때 호출되면 될 듯
router.put('/:id', (req, res)=>{

	console.log(req.body);
	if(req.body.item_state){
		itemState = req.body.item_state;
	}else{
		//나머지 상태는 전부 대기(수정중) 상태로 갱신.
		itemState = 'M';
	}
	console.log(req.body);
	let sql = "UPDATE item SET item_state='"+itemState+"',";
	let validation = false;
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
	//양의 정수 정규식
	let regex = /^[1-9][0-9]*$/;
	if(regex.test(req.body.item_main_image)){
		sql+=" item_main_image = '"+req.body.item_main_image+"',"
		validation = true;
	}
	if(validation){
		sql+= " item_time = NOW() WHERE item_id = "+req.params.id;
		db.query(sql, (err, result)=>{
			if(err){
				console.log(err);
				res.status(500).send("QUERY_FAIL");
			}else{
				res.send({result:"SUCCESS"});
			}
		});
	}else{
		res.status(400).send("BODY_VALIDATION_FAIL");
	}
});
//item 삭제
router.delete('/:id', (req, res)=>{
	var sql = "DELETE FROM item WHERE item_id = '"+req.params.id+"'";
	db.query(sql, (err, result)=>{
		if(err){
			console.log(err);
			res.status(500).send("query failed");
		}else{
			res.send({result:'success'});
		}
	});
});

//해당 아이템의 카테고리를 하나 추가 {category : 이름}
router.post('/:id/category',(req, res)=>{
	db.query("INSERT INTO item_category (item_id, category) VALUES (?, ?)",[req.params.id, req.body.category],(err, result)=>{
		if(err){
			console.log(err);
			res.status(500).send('QUERY_FAIL');
		}else{
			console.log(req.body.category);
			res.send({category:req.body.category});
		}
	});
});

//해당 아이템의 해당 카테고리를 제거
router.delete('/:id/category/:category',(req, res)=>{
	let sql = "DELETE FROM item_category WHERE item_id = "+req.params.id+" AND category = '"+req.params.category+"'";
	console.log(sql);
	db.query(sql,(err, result)=>{
		if(err){
			console.log(err);
			res.status(500).send('QUERY_FAIL');
		}else{
			res.send({result:"SUCCESS"});
		}
	});
});

router.get('/:id/category',(req,res)=>{
	db.query("SELECT * FROM item_category WHERE item_id = ?",[req.params.id],(err, result)=>{
		if(err){
			console.log(err);
			res.status(500).send('QUERY_FAIL');
		}else{
			res.send(result);
		}
	});
});


module.exports = router;
