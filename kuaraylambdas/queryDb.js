console.log('Loading function');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
var table = "kuaraymeasures";

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));
   
    var params = {
        TableName : "kuaraymeasures"
    };
    
    var response = {
    "statusCode": 200,
    "headers": { "Content-type": "application/json"},
    "body": ""
    }

    dynamo.scan(params, function(err, data) {
        if (err) {
            response.statusCode = 500;
            response.body = {"message" : "Unable to query. Error: " + "\n" + JSON.stringify(err, undefined, 2)};
            context.fail(response);
        } else {
            response.body = data;
             context.succeed(response);
        }
    });   

}