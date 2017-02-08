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

var client = new Client();
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
        response.write(JSON.stringify(stats));
    }
);

var DHT22 = new RaspiSensors.Sensor({
    type: "DHT22",
    pin: 0x7
});

var callback = function(err, data) {
    if(err) {
        console.error("An error occured!"); 
        console.error(err.cause);   
		rpio.spiEnd();    
        return;
    }
    getData(data);
    stats.date = new Date();
    // Primeiro vem a temperatura, podemos ver a qualidade do ar em separado,
    // depois vem a umidade. Só depois de termos as 3 medidas é que 
    // podemos calcular a média  
};

var startServices = function() {
    rpio.spiBegin();
    DHT22.fetchInterval(callback,global.config.measureIntervalSeconds);
}

function getData(data) {
    rpio.spiTransfer(sendBuffer, receiveBuffer, sendBuffer.length);
    var junk = receiveBuffer[0],
            MSB = receiveBuffer[1],
            LSB = receiveBuffer[2];
    var value = ((MSB & 3) << 8) + LSB; 
    data.airQuality =  value;
} 


// msg = Kuaraymeasure
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

httpServer.listen(3000, function(){
    console.log("Kuaray server listening on 3000");
});

