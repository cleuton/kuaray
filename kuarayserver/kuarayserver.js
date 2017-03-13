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

// To start use: sudo node kuarayserver <latitude> <longitude>

var Client = require('../kuarayawsclient/awsClient');
var http = require('http');
var Kuaraymeasure = require('../kuarayawsclient/kuaraymeasure');
var Assure = require('../util/assure');
var client = new Client();
var lastMeasure = initMeasure();
var storedMeasure = {};
var stats = {};
var gotTemp = false;
var gotHum = false;

var rpio = require('rpio');
var sleep = require('sleep');
var RaspiSensors = require('raspi-sensors');

var sendBuffer = new Buffer([0x01, (8 + 0 << 4), 0x01]); 
var receiveBuffer = new Buffer(sendBuffer.length);
var latitude = 0;
var longitude = 0;

/* Callback de processamento de request de status via Web */

var httpServer = http.createServer(
    function(request,response) {
        response.write(JSON.stringify(storedMeasure));
        response.end();
    }
);

var DHT22 = new RaspiSensors.Sensor({
    type: "DHT22",
    pin: 0x7
});

/* Init last measure variable. Each time we have all 3 data */

function initMeasure() {
    // Temos que alterar isso depois, quando estivermos usando AWS: 
    latitude = process.argv[2];
    longitude = process.argv[3];
    lastMeasure = new Kuaraymeasure("Kuaray01", 
    new Date(), null, null, null, latitude,longitude);
}

/* 
    This inits stats variable 
    which will be sent to backend
*/

function initStats() {
    stats = {};
    stats.acumTemp = 0.0;
    stats.contaTemp = 0;
    stats.acumUmid = 0.0;
    stats.contaUmid = 0;
    stats.acumQuali = 0.0;
    stats.contaQuali = 0;
    stats.data = new Date();
}


/* 
 This will send data to backend using AWS 
 Invoked at intervals controlled by config.json "sendIntervalSeconds"
*/

var sendToBackend = function(lastMeasure) {
    Assert.exists(global.config.clientId);
    var msg = new Kuaraymeasure(global.config.clientId, stats.data, 
        stats.acumTemp / stats.contaTemp, 
        stats.acumUmid / stats.contaUmid, 
        stats.acumQuali / stats.contaQuali, 
        latitude, longitude);
    client.send(msg);
    // Last command:
    initStats();
}

/* Callback de coleta */

var callback = function(err, data) {
console.log("#1 callback " + JSON.stringify(data));    
    if(err) {
        console.error("An error occured!"); 
        console.error(err.cause);   
		rpio.spiEnd();    
        return;
    }
    getData(data);

console.log("#2 callback " + JSON.stringify(data));    
    
    if(lastMeasure.temperature != null 
       && lastMeasure.humidity != null
       && lastMeasure.quality != null) {
           storedMeasure = lastMeasure;
           lastMeasure = initMeasure();
    }
    if(data.type == "Humidity") {
        lastMeasure.humidity = data.value;
        stats.contaUmid++;
        stats.acumUmid += data.value;
console.log("#3 callback " + JSON.stringify(lastMeasure));    

    }
    else if(data.type == "Temperature") {
        lastMeasure.temperature = data.value;
        stats.contaTemp++;
        stats.contaTemp += data.value;        
console.log("#4 callback " + JSON.stringify(lastMeasure));    
    }
    if(data.quality != "undefined" && data.quality != null) {
        lastMeasure.quality = data.quality;
        stats.contaQuali++;
        stats.acumQuali += data.value;        
console.log("#5 callback " + JSON.stringify(lastMeasure));    
        
    }
};

/* Start background collect services */

var startServices = function() {
    rpio.spiBegin();
    Assure.exists(global.config.measureIntervalSeconds,'global.config.measureIntervalSeconds NE')
    .number(global.config.measureIntervalSeconds,'global.config.measureIntervalSeconds invalido');
    DHT22.fetchInterval(callback, global.config.measureIntervalSeconds);
    initStats();
    Assure.exists(global.config.sendIntervalSeconds,'global.config.sendIntervalSeconds NE')
    .number(global.config.sendIntervalSeconds,'global.config.sendIntervalSeconds inválido');
    setInterval(sendToBackend(), global.config.sendIntervalSeconds * 1000);
}

/* Gets RPIO data */

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

// START THE AWS CLIENT AND SERVICES: *********************

client.start().then(
    function() {
        startServices();
    },
    function(error) {
        console.log('ERROR1: ' + error.message);
    }
);


/* Make the server listen to connections */

httpServer.listen(3000, function(){
    console.log("Kuaray server listening on 3000");
});

