const AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = "PartOrders";
exports.handler = (event, context, callback) => {
var params = {
    TableName : tableName,
    IndexName : "jobName-index",
    KeyConditionExpression: 'jobName = :jobname',
      ExpressionAttributeValues: {
        ':jobname': event.jobName,
      }
};
docClient.query(params, function(err, data){
callback(err, data);
});
};