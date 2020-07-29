import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
   
    ## get connection
    dynamodb = boto3.resource('dynamodb')
    
    orders = event["orders"]
    success = False
    
    for order in orders:
        
        qoh = 0 # to have local starage
    
        ## get specific part row
        part = get_part(order["partId"], dynamodb)
        if part:
            qoh = part['qoh']
    
 ################# Updating item ############################
 
        table = dynamodb.Table('Parts')
        
        ## update item logic
        response = table.update_item(
            Key={
                'partId': order["partId"],
            },
            UpdateExpression="set qoh=:qty",
            ExpressionAttributeValues={
                ':qty': qoh - order["qty"]
            },
            ReturnValues="UPDATED_NEW"
        )
        
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            success = True
        else :
            success = False
        
    if success == True:
        return 200
    else:
        return 500
    
############################################################

##################### Fetching item #######################

def get_part(part, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource('dynamodb')

    
    table = dynamodb.Table('Parts')
    try:
        response = table.get_item(Key={'partId': part})
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        return response['Item']
        
############################################################