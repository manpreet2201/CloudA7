var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient(); 

exports.handler = function(event, context) 
{
    console.log(requestBody);
    var responseCode = 200;
    var userTableName = "PartOrders";
    var requestBody = event;
    var pathParams = event.path;
    var httpMethod = event.httpMethod;  

    var i = 0;
    requestBody.forEach(element => {
            const userid = element.userId;
            const jobName = element.jobName;
            const partid = parseInt(element.partId);
            const qty = parseInt(element.qty);
            i = i + 1;
            var params = {
            TableName:userTableName,
            Item:{
                "oid": context.awsRequestId + i,
                "jobName": jobName,
                "partId": partid,
                "userId": userid,
                "qty":qty
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
                    };
                    console.log('great success: %j',data);
                    context.succeed(response);
                }
            });
    });
};