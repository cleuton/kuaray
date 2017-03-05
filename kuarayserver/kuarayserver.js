/*
Kuaray Server script v 0.1

http://kuaray.org

   Copyright 2016 Cleuton Sampaio de Melo Junior.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var Client = require('../kuarayawsclient/awsClient');
var http = require('http');
var Kuaraymeasure = require('../kuarayawsclient/kuaraymeasure');

//var client = new Client();
var lastMeasure = initMeasure();
var stats = {};
var gotTemp = false;
var gotHum = false;

var rpio = require('rpio');
var sleep = require('sleep');
var RaspiSensors = require('raspi-sensors');

var sendBuffer = new Buffer([0x01, (8 + 0 << 4), 0x01]); 
var receiveBuffer = new Buffer(sendBuffer.length);

var httpServer = http.createServer(
    function(request,response) {
        response.write(JSON.stringify(lastMeasure));
        response.end();
    }
);

var DHT22 = new RaspiSensors.Sensor({
    type: "DHT22",
    pin: 0x7
});

function initMeasure() {
    // Temos que alterar isso depois, quando estivermos usando AWS: 
    var obj = new Kuaraymeasure("Kuaray01", 
    new Date(), null, null, null, 0,0);
    return obj;
}

var sendToBackend = function(lastMeasure) {

}

var callback = function(err, data) {
console.log("#1 callback " + JSON.stringify(data));    
    if(err) {
        console.error("An error occured!"); 
        console.error(err.cause);   
		rpio.spiEnd();    
        return;
    }
    getData(data);
    // Primeiro vem a temperatura, podemos ver a qualidade do ar em separado,
    // depois vem a umidade. Só depois de termos as 3 medidas é que 
    // podemos calcular a média  

console.log("#2 callback " + JSON.stringify(data));    
    
    if(lastMeasure.temperature != null 
       && lastMeasure.humidity != null
       && lastMeasure.quality != null) {
           lastMeasure.date = new Date();
           sendToBackend(lastMeasure);
           stats = lastMeasure;
           lastMeasure = initMeasure();
    }
    if(data.type == "Humididy") {
        lastMeasure.humidity = data.value;
console.log("#3 callback " + JSON.stringify(lastMeasure));    

    }
    else if(data.type == "Temperature") {
        lastMeasure.temperature = data.value;
console.log("#4 callback " + JSON.stringify(lastMeasure));    
    }
    if(data.quality != "undefined" && data.quality != null) {
        lastMeasure.quality = data.quality;
console.log("#5 callback " + JSON.stringify(lastMeasure));    
        
    }


};

var startServices = function() {
    rpio.spiBegin();
    DHT22.fetchInterval(callback, 5/*global.config.measureIntervalSeconds*/);
}

function getData(data) {
    rpio.spiTransfer(sendBuffer, receiveBuffer, sendBuffer.length);
    var junk = receiveBuffer[0],
            MSB = receiveBuffer[1],
            LSB = receiveBuffer[2];
    var value = ((MSB & 3) << 8) + LSB; 
    if(value != null && value != 0) {
        data.quality = value;
    }
} 


// msg = Kuaraymeasure
/*
var sendMsg = function(msg) {
    client.send(msg);
}

client.start().then(
    function() {
        startServices();
    },
    function(error) {
        console.log('ERROR1: ' + error.message);
    }
);
*/
httpServer.listen(3000, function(){
    console.log("Kuaray server listening on 3000");
});
startServices(); // Retirar essa linha quando o AWS estiver ok

