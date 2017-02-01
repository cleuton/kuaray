var config = require("./config");
var Promise = require("promise");
var awsIot = require("aws-iot-device-sdk");

function client() {
    var selfRef = this;
    selfRef.device = null;
    selfRef.start = function() {
        return new Promise(
            function (fulfill, reject) {
                console.log('Invoking config.start()');
                config.start().then(
                    function(config) {
                        console.log('Ok callback');
                        console.log(JSON.stringify(global.config.keyPath));
                        console.log(JSON.stringify(global.config.certPath));
                        console.log(JSON.stringify(global.config.caPath));
                        console.log(JSON.stringify(global.config.clientId));
                        console.log(JSON.stringify(global.config.region));

                         selfRef.device = awsIot.device({
                            keyPath: global.config.keyPath,
                            certPath: global.config.certPath,
                            caPath: global.config.caPath,
                            clientId: global.config.clientId,
                            region: global.config.region
                        });
                        console.log(selfRef);

                        selfRef.device
                        .on('connect', function() {
                            console.log('connect');
                            selfRef.device.subscribe('kuaraytopic');
                            fulfill();
                            });

                        selfRef.device
                        .on('message', function(topic, payload) {
                            console.log('message', topic, payload.toString());
                        });
                        console.log('exiting ok callback');
                    },
                    function(error) {
                        console.log('ERROR: ' + error.message);
                        reject();
                    }
                );
            }
        ); 
    }
    selfRef.send = function(data) {
        var stringmsg = JSON.stringify(data);
        console.log('publishing: ' + stringmsg);
        selfRef.device.publish('kuaraytopic',stringmsg);
    }
}

module.exports = client;