var bodyParser = require('body-parser');

module.exports = function(app)
{
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  var user = require('./user');
  app.use('/user',user);
  var item = require('./item');
  app.use('/item',item);
  app.get('/',function(req, res){
    res.render('index.html');
  });
};
