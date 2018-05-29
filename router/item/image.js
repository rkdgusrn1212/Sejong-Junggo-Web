const db = require('../../db-server');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/item_images/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
const upload = multer({storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }).single('img');
const Thumbnail = require('thumbnail');
const thumbnail = new Thumbnail(__dirname+'/../../uploads/item_images', __dirname+'/../../uploads/item_images/thumbs');
const microThumbnail = new Thumbnail(__dirname+'/../../uploads/item_images', __dirname+'/../../uploads/item_images/micro_thumbs');

module.exports = (router)=>{
  //item에 해당하는 이미지를 추가. 이미지를 서버에 업로드하고 반환된 url과 썸네일 url들을 본문에 포함하여 호출하여야한다.
  router.post('/:item_id/image', (req, res)=>{
    upload(req, res, (err)=>{
      if(err){
        console.log(err);
        res.status(500).send("upload failed");
        return;
      }
      thumbnail.ensureThumbnail(req.file.filename, 300, 300, function (err, filename) {
        if(err){
          console.log(err);
        }
      });
      microThumbnail.ensureThumbnail(req.file.filename, 100, 100, function (err, filename) {
        if(err){
          console.log(err);
        }
      });
      /*썸네일 로직 구현 필요->graphicsImage 리눅스 설치 + thumbnail*/
      let url = 'uploads/item_images/'+req.file.filename;
      let thumbUrl = 'uploads/item_images/thumb'+req.file.filename;
      let thumbMicroUrl = 'upload/item_images/micro_thumb'+req.file.filename;
      let sql = "INSERT INTO item_image ( item_id, url, thumb_url, thumb_micro_url) VALUES ( "+req.params.item_id+", '"+url+"', '"+thumbUrl+"', '"+thumbMicroUrl+"')";
      db.query(sql, (err, result)=>{
        if(err){
          console.log(err);
          res.status(500).send("query failed");
        }else{
          res.send("success");
        }
      });
    });
  });

  //item의 image의 리스트를 불러온다. 각이미지는 id와 쿼리로 받은 속성값을 가진다. (thumb_url, thumb_micro_url, url)
  router.get('/:item_id/image',(req, res)=>{
    var sql = "SELECT * FROM item_image WHERE item_id = "+req.params.item_id;
    db.query(sql, (err, raws, fields)=>{
      if(err){
        res.status(500).send("query failed");
      }else{
        res.send(raws);
      }
    });
  });

  //item의 image_id의 쿼리매개변수로 받아온 해당 컬럼 값을 불러온다. (thumb_url, url_micro_url, url)
  router.get('/:item_id/image/:img_id',(req, res)=>{

  });

  //해당 이미지의 컬럼을 수정한다.
  router.put('/:item_id/image/:img_id',(req, res)=>{

  });

  //해당 아이템의 이미지를 삭제한다.
  //서버에 저장된 이미지와 썸네일 이미지들도 삭제하기위한 트리거 역활을 한다. 호출 후 반드시 해당 이미지 삭제.
  router.delete('/:item_id/image/:img_Id',()=>{

  });
};
