const db = require('../../db-server');
const multer = require('multer');
const crypto = require('crypto');
const async = require('async');
const fs = require('fs');
const mime = require('mime');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image/item/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
const upload = multer({storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }).single('img');
const Thumbnail = require('thumbnail');
const thumbnail = new Thumbnail(__dirname+'/../../public/image/item', __dirname+'/../../public/image/item/thumb');
const microThumbnail = new Thumbnail(__dirname+'/../../public/image/item', __dirname+'/../../public/image/item/micro_thumb');

module.exports = (router)=>{
  //item에 해당하는 이미지를 추가. 이미지를 서버에 업로드하고 반환된 url과 썸네일 url들을 본문에 포함하여 호출하여야한다.
  router.post('/:item_id/image',(req, res)=>{
    //서버로 이미지를 업로드
    upload(req, res, (err)=>{
      if(err){
        console.log(err);
        res.status(500).send("upload failed");
        return;
      }
      //병렬 처리
      async.parallel([
        (callback)=>{
          //중간크기의 썸네일을 생성
          thumbnail.ensureThumbnail(req.file.filename, 300, 300, function (err, filename) {
            if(err){
              console.log(err);
              callback({code:500,msg:IMAGE_PROCESSING_ERROR});
            }else{
              callback();
            }
          });
        },
        (callback)=>{
          //작은크기의 썸네일을 생성.
          microThumbnail.ensureThumbnail(req.file.filename, 100, 100, function (err, filename) {
            if(err){
              console.log(err);
              callback({code:500,msg:IMAGE_PROCESSING_ERROR});
            }else{
              callback();
            }
          });
        }
      ],(err,result)=>{
        if(err){
          res.status(err.code).send(err.msg);
        }else{
          //썸네일 생성이 둘다 성공.
          let url = '/image/item/'+req.file.filename;
          let splitedName = (req.file.filename).split('.');
          let exclusiveName = splitedName[0];
          let extension = splitedName[1];
          let thumbUrl = '/image/item/thumb/'+exclusiveName+"-300x300."+extension;
          let thumbMicroUrl = '/image/item/micro_thumb/'+exclusiveName+"-100x100."+extension;
          let sql = "INSERT INTO item_image ( item_id, url, thumb_url, thumb_micro_url) VALUES ( "+req.params.item_id+", '"+url+"', '"+thumbUrl+"', '"+thumbMicroUrl+"')";
          db.query(sql, (err, result)=>{
            if(err){
              console.log(err);
              res.status(500).send("QUERY_FAIL");
            }else{
              res.send({
                item_id:req.params.item_id,
                url:url,
                thumb_url:thumbUrl,
                thumb_micro_url:thumbMicroUrl,
                image_id:result.insertId
              });
            }
          });
        }
      });
    });
  });

  //item의 image의 리스트를 불러온다. 각이미지는 id와 쿼리로 받은 속성값을 가진다. (thumb_url, thumb_micro_url, url)
  router.get('/:item_id/image',(req, res)=>{
    var sql = "SELECT * FROM item_image WHERE item_id = "+req.params.item_id;
    db.query(sql, (err, raws, fields)=>{
      if(err){
        console.log(err);
        res.status(500).send("QUERY_FAIL");
      }else{
        res.send(raws);
      }
    });
  });

  //item의 해당 이미지를 불러온다. (thumb_url, thumb_micro_url, url)
  router.get('/:item_id/image/:image_id',(req, res)=>{
    var sql = "SELECT * FROM item_image WHERE item_id = ? AND image_id = ?";
    db.query(sql,[req.params.item_id, req.params.image_id] ,(err, raws, fields)=>{
      if(err){
        console.log(err);
        res.status(500).send("QUERY_FAIL");
      }else{
        res.send(raws);
      }
    });
  });

  //해당 아이템의 이미지를 삭제한다.
  //서버에 저장된 이미지와 썸네일 이미지들도 삭제하기위한 트리거 역활을 한다. 호출 후 반드시 해당 이미지 삭제.
  router.delete('/:item_id/image/:img_id',(req, res)=>{
    let sql = "SELECT * FROM item_image WHERE item_id = "+req.params.item_id+" AND image_id = "+req.params.img_id;
    db.query(sql, (err, rows, fields)=>{
      if(err){
        console.log(err)
        res.status(500).send("query failed");
      }else{
        if(rows.length>0){
          let url = rows[0].url;
          let thumbUrl = rows[0].thumb_url;
          let thumbMicroUrl = rows[0].thumb_micro_url;
          console.log(url);
          fs.unlink(url, (err)=>{
            if (err){
              console.log(err);
            }
          });
          fs.unlink(thumbUrl, (err)=>{
            if (err){
              console.log(err);
            }
          });
          fs.unlink(thumbMicroUrl, (err)=>{
            if (err){
              console.log(err);
            }
          });
          sql = "DELETE FROM item_image WHERE item_id = "+req.params.item_id+" AND image_id = "+req.params.img_id;
          db.query(sql, (err, result)=>{
            if(err){
              console.log(err);
              res.status(500).send("query failed");
            }else{
              res.send("success");
            }
          });
        }else{
          res.status(400).send("resource not exist");
        }
      }
    });
  });
};
