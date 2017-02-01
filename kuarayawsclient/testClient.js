var Client = require('./awsClient');
var http = require('http');

var client = new Client();
var httpServer = http.createServer(
    function(request,response) {

    }
);

client.start().then(
    function() {
        console.log('OK callback 2');
        var msg = {
            "id": "msg01",
            "txt": "Ok", 
            "time" : new Date()
        }
        client.send(msg);
        console.log('message.sent');
        process.nextTick();
    },
    function(error) {
        console.log('ERROR1: ' + error.message);
    }
);

//Lets start our server
httpServer.listen(3000, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("TestClient server listening on");
});

