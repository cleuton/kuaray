var Client = require('./awsClient');
var http = require('http');
var Kuaraymeasure = require('./kuaraymeasure');

var client = new Client();
var httpServer = http.createServer(
    function(request,response) {

    }
);

client.start().then(
    function() {
        console.log('OK callback 2');
        var msg = new Kuaraymeasure('kuaraynode',
                            new Date(),
                            34.50,
                            68,
                            150,
                            -43.123,
                            -22.123
                            );
        console.log(333);
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

