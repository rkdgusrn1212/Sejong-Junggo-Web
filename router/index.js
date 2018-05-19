module.exports = function(app)
{
  var user = require('./user');
  app.use('/user',user);
  var item = require('./item');
  app.use('./item',item);
  app.get('/',function(req, res){
    res.render('index.html');
  });
};
