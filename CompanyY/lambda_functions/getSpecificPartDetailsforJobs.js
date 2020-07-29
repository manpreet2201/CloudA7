const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

var table = "Parts";


exports.handler = async (event, context, callback) => {

	var Parts = event.partId;
    var result = [];
    
   for (const part of Parts) {
    var params = {
        TableName: "Parts",
         Key: {
           "partId": part
        } 
     };
	 
	const items = await docClient.get(params).promise();
	result.push(items.Item)
	}
    callback(null, result);
};