var rpio = require('rpio');
var sleep = require('sleep');

rpio.spiBegin();
//rpio.spiChipSelect(0);				/* Chip select: use CE0 (default) */
//rpio.spiSetCSPolarity(0, rpio.LOW)	/* Commonly chip enable (CE) pins are active low, and this is the default. */
//rpio.spiSetClockDivider(256)			/* MCP3008 max is ~1MHz, 256 == 0.98MHz */
//rpio.spiSetDataMode(0);

// Prepare TX buffer [trigger byte = 0x01] [channel 0 = 0x80 (128)] [placeholder = 0x01]
var sendBuffer = new Buffer([0x01, (8 + 0 << 4), 0x01]); 

// Send TX buffer to SPI MOSI and recieve RX buffer from MISO
var receiveBuffer = new Buffer(sendBuffer.length);

// Timer
var intervaloSegundos = process.argv[2];
console.log('Seconds: ' + intervaloSegundos);

while(true) {
	getData();
	sleep.sleep(Number(intervaloSegundos));
}

rpio.spiEnd();

function getData() {
	console.log("Reading values...");
	rpio.spiTransfer(sendBuffer, receiveBuffer, sendBuffer.length); 

	// Extract value from output buffer. Ignore first byte. 
	var junk = receiveBuffer[0],
		MSB = receiveBuffer[1],
		LSB = receiveBuffer[2];

	// Ignore first six bits of MSB, bit shift MSB 8 positions and 
	// finally add LSB to MSB to get a full 10 bit value
	var value = ((MSB & 3) << 8) + LSB; 

	console.log('ch' + ((sendBuffer[1] >> 4) - 8), '=', value);
} 

