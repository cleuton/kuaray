//arn:aws:iam::002744765652:role/kuarayLambdaDynamoRole
console.log('Loading function');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB.DocumentClient();
var table = "kuaraymeasures";

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));
   var params = {
        TableName:table,
        Item: event
    };

    console.log("Adding a new measure...");
    dynamo.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add measure. Error JSON:", JSON.stringify(err, null, 2));
            context.fail();
        } else {
            console.log("Added measure:", JSON.stringify(data, null, 2));
            context.succeed();
        }
    });
}