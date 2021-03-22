const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3();

const uploadBucket = 'ap-ictarchitecture-groep4-gifs'

exports.handler = async (event) => {
    var myObj = event.headers.metadata;
  const result = await getAccessObjectURL(myObj)
  console.log('Result: ', result)
  return result
};

const getAccessObjectURL = async function(myObj) {
  console.log('getAccessObjectURL started')

  var s3Params = {
    Bucket: uploadBucket,
    Key:  `${myObj}.gif`
  };

  return new Promise((resolve, reject) => {
    // Get signed URL
    let accessObjectURL = s3.getSignedUrl('getObject', s3Params)
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
          "previewURL": accessObjectURL,
          "gif": `${myObj}.gif`
      })
    })
  })
}