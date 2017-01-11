
var express = require('express');
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());

app.post('/auth/token', function (req, res) {
  console.log(req.body.username);
  res.json({'test': false});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

