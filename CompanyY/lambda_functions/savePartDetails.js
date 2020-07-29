var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient(); 
exports.handler = function(event, context) 
{
    var responseCode = 200;
    var userTableName = "Parts";
    var requestBody = event;
    var pathParams = event.path;
    var httpMethod = event.httpMethod;  
    var partId;
    var partName;
    var qoh;
    var params;

       
         //Set variables
        partId  =  requestBody.partId;
        partName = requestBody.partName;
        qoh=       requestBody.qoh;
       

        params = {
            TableName:userTableName,
            Item:{
                "partId": partId,
                "partName": partName,
                "qoh": qoh
            }
        };
        dynamodb.put(params, function(err, data) 
            { if (err) {
                    console.log(err);
                    context.done(err);
                } else {
                    var response = 
                    {
                        statusCode: responseCode,
                        headers: 
                        {
                            "x-custom-header" : "custom header value"
                        },
                        //body: JSON.stringify(partId)
                    };
                    console.log('great success: %j',data);
                    context.succeed(response);
                }
            });


};