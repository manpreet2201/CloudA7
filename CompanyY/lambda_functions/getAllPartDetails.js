const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

var table = "Parts";


exports.handler = async (event, context, callback) => {
    let params = { 
        TableName: table
    };

    let parts = [];
    let items;

    do {
        items = await docClient.scan(params).promise();
        items.Items.forEach((item) => parts.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    callback(null, parts);
};