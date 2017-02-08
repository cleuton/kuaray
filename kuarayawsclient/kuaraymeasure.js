var uuid = require('uuid/v4');
function Record(nodeName,date,temperature,humidity,quality,latitude,longitude) {
    console.log(444);
    this.id = uuid();
    this.nodeName = nodeName;
    this.date = date;
    this.temperature = temperature;
    this.humidity = humidity;
    this.quality = quality;
    this.latitude = latitude;
    this.longitude = longitude;
    console.log(555);
}

module.exports = Record;