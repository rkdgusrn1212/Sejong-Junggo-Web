var router = require('./index');
var db = require('../../db-server');

//item에 해당하는 이미지를 추가. 이미지를 서버에 업로드하고 반환된 url과 썸네일 url들을 본문에 포함하여 호출하여야한다.
router.post('/:item_id/image',(req, res)=>{
  if(req.body.url&&req.body.thumb_url&&req.body.thumb_micro_url){
    var sql = "INSERT INTO item_image VALUES( "+item_id+", '"+url+"', '"+thumbUrl+"', '"+thumbMicroUrl+"')";
    db.query(sql, (req,res)=>{
      if(err){
        res.status(500).send("query failed");
      }else{
        res.send("success");
      }
    })
  }else{
    res.status(400).send("body validation failed");
  }
});

//item의 image의 리스트를 불러온다. 각이미지는 id와 쿼리로 받은 속성값을 가진다. (thumb_url, thumb_micro_url, url)
router.get('/:item_id/image',(req, res)=>{

});

//item의 image_id의 쿼리매개변수로 받아온 해당 컬럼 값을 불러온다. (thumb_url, url_micro_url, url)
router.get('/:item_id/image/:img_id',(req, res)=>{

});

//해당 이미지의 컬럼을 수정한다.
router.put('/:item_id/image/:img_id',(req, res)=>{

})

//해당 아이템의 이미지를 삭제한다.
//서버에 저장된 이미지와 썸네일 이미지들도 삭제하기위한 트리거 역활을 한다. 호출 후 반드시 해당 이미지 삭제.
router.delete('/:item_id/image/:img_Id')=>{

}
