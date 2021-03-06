var express = require('express');
var router = express.Router();
var db = require('../db-server');

//메인 이미지를 변경할때 호출, 카테고리를 추출.
const findCategoryByImagePath = (path, callback)=>{
  var vision = require('google-vision-api-client');//node.js에서 cloud vision api 호출
  var requtil = vision.requtil;

  var jsonfile = 'secret/GoogleApiKey.json'; //google vision cloud api key
  vision.init(jsonfile);
  path = "public"+path;
  console.log(path);
  var d = requtil.createRequests().addRequest(
       requtil.createRequest(path) //분석할 사진파일의 경로
       .withFeature('LABEL_DETECTION',2) //무슨 사진인지 찾아내는 분석
       .build());

  //분석 결과 출력
  vision.query(d, function(e, r, d){
       if(e){
         console.log('ERROR:', e);
         callback(e);
       }else{
         callback(null,d); //콜백으로 결과 받아옴.
       }
  })
}

//이미지로 카테고리를 쿼리하는 메소드
router.get('/',(req, res)=>{
  if(req.query.path != null){
    findCategoryByImagePath(req.query.path,(err, result)=>{
      if(err){
        console.log(err);
        res.status(500).send('QUERY_FAIL');
      }else{
        console.log(result);
        if(result.responses[0].labelAnnotaions.length>0){
          //쓸데없는 퍼센트 데이터 날리고 카테고리 라벨만 배열로 가공.
          let categorys = result.responses[0].labelAnnotaions;
          let resultCategory = [];
          for(let i = 0 ;i< categorys.length; i++){
            resultCategory.push(categorys[i].description);
          }
          res.send({categories:resultCategory});
        }else{
          res.status(400).send('NO_CATEGORY');
        }
      }
    });
  }
});

module.exports = router;
