/*
item{
  post
  get:{
    item_id, name, category_id category_name
  put
}
category{

}

user{
  get{
    id
  }
  post
  put
}
*/
module.exports = function(app)
{
  var user = require('./user');
  app.use('/user',user);
  var item = require('./item');
  app.use('/item',item);
  app.get('/',function(req, res){
    res.render('index.html');
  });
};
