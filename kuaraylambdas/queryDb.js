console.log('Loading function');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
var table = "kuaraymeasures";

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));
   
    var params = {
        TableName : "kuaraymeasures"
    };

    docClient.query(params, function(err, data) {
        if (err) {
            context = "Unable to query. Error: " + "\n" + JSON.stringify(err, undefined, 2;
        } else {
             context = "Querying for movies from 1985: " + "\n" + JSON.stringify(data, undefined, 2);
        }
    });   

}