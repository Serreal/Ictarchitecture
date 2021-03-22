import json
import boto3


def lambda_handler(event, context):
    # TODO implement
    
    bucket_name =  'ap-ictarchitecture-groep4-rawimages'
    s3 = boto3.client('s3')
   
    
    objects = list_bucket_objects(bucket_name)
    
    for obj in objects:
        s3.delete_object(Bucket=bucket_name, Key=obj["Key"])
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

def list_bucket_objects(bucket_name):
    # Retrieve the list of bucket objects
    s3 = boto3.client('s3')
    try:
        response = s3.list_objects_v2(Bucket=bucket_name)
    except ClientError as e:
        logging.error(e)
        return None
    return response['Contents']