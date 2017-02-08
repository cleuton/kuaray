/*
Kuaray Sensor test script v 0.2

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

// Attention: use sudo node teste1 <times | 0>
// Times to repeat check. If forever, then use ZERO.
// example: sudo node teste1 0
// DHT22 must be connected to pin 0x7 - GPIO4

var rpio = require('rpio');
var sleep = require('sleep');
var RaspiSensors = require('raspi-sensors');

var sendBuffer = new Buffer([0x01, (8 + 0 << 4), 0x01]); 
var receiveBuffer = new Buffer(sendBuffer.length);
var times = process.argv[2];

if(times == undefined) {
	   console.error("You must provide <times> or 0");
	   process.exit();
}

var count = 0;

console.log('Measuring ' + times + ' times.');


var DHT22 = new RaspiSensors.Sensor({
      type: "DHT22",
      pin: 0x7
});

rpio.spiBegin();

var callback = function(err, data) {
    if(err) {
        console.error("An error occured!"); 
        console.error(err.cause);   
		rpio.spiEnd();    
        return;
    }
    getData(data);
	if (times > 0) {
		count++;
		if (count >= times) {
			DHT22.fetchClear();
			rpio.spiEnd();
		}
	}	
};

DHT22.fetchInterval(callback,5);


function getData(data) {
        rpio.spiTransfer(sendBuffer, receiveBuffer, sendBuffer.length);
        var junk = receiveBuffer[0],
                MSB = receiveBuffer[1],
                LSB = receiveBuffer[2];
        var value = ((MSB & 3) << 8) + LSB; 
        data.airQuality =  value;
        console.log(data);
} 
        
