var mysql = require('mysql');
var dbconfig   = require('./secret/database.js');
//secret/database.js 파일 생성하여 db설정값 선언.
module.exports = mysql.createConnection(dbconfig);
