var bodyParser = require('body-parser');
var user = require('./user');
var item = require('./item');

module.exports = function(app)
{

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/user',user);
  app.use('/item', item);
  app.get('/',function(req, res){
    res.render('index.html');
  });
};
