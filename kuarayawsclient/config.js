
var Promise = require('promise');
var fs = require('fs');
var path = require('path');


module.exports = {
	"start" : function(configPath) {
	  var filepath = configPath;
	  if(configPath == null) {
	  	filepath = path.join(__dirname, './config.json');
	  }
      return new Promise(
            function (fulfill, reject){
				fs.readFile(filepath, 'utf8', function (err, data) {
					if (err) {
						console.log('error loading config.json: ' + err.message);
						reject(err);
					}
					else {
						try {
							global.config = JSON.parse(data);							
							fulfill(config);					
						}
						catch(err) {
							console.log('error parsing config.json: ' + err.message);
							reject(err);
						}
					}
				});
			}
      );	
	}
};
