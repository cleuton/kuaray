
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var crypto = require('crypto');
var base64 = require('base-64');
var fs = require('fs');
var pem = fs.readFileSync('../../../cert/cleutonsampaio.key');
var key = pem.toString('ascii');

//********************************
var serverName = "MyTest01";
var minutes = 1;
//********************************
/*
  pending: 
  a) Parametrizar caminho...
  b) Authenticate userName and password using a database or a file
*/

var tokenGenerator = function(username, ipAddress, serverName, loginDate, minutesValid) {
  var token = {
                'userName': username,
                'loginDate': loginDate,
                'originalIp': ipAddress,
                'timeout': null,
                'serverName': serverName,
                'signature': null
              };
  var timeoutDate = new Date(loginDate.getTime() 
    + minutesValid * 60000);
  token.timeout = timeoutDate;
  var tokenToSign = token.userName + ";" 
                  + token.loginDate + ";"
                  + token.originalIp + ";"
                  + token.timeout + ";"
                  + token.serverName;
  var sign = crypto.createSign('RSA-SHA256');
  sign.update(tokenToSign);
  token.signature = sign.sign(key, 'hex');               
  tokenToSign += ";" + token.signature;
  
  return base64.encode(tokenToSign); 
}

app.use(bodyParser.json());

app.post('/auth/token', function (req, res) {
  console.log(req.body.userName);
  var token = tokenGenerator(req.body.userName, 
                             req.connection.remoteAddress, 
                             serverName,
                             new Date(),
                             minutes);
  res.json({'token': token});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

