/*
Kuaray Sensor test script v 0.2

http://kuaray.org

The MIT License (MIT)

Copyright (c) 2016 Cleuton Sampaio

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.          
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
        
