const AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = "Parts";
exports.handler = (event, context, callback) => {
var params = {
TableName : tableName,
Key : {
"partId" : event.partId
}
};
docClient.get(params, function(err, data){
callback(err, data);
});
};