const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3();

const uploadBucket = 'ap-ictarchitecture-groep4-rawimages'   // << LOOK!


exports.handler = async (event) => {
  var myObj = event.headers.metadata;
  var endofupload = event.headers.trigger;
  const result = await getUploadURL(myObj,endofupload)
  console.log('Result: ', result)
  console.log(myObj);
  return result
};


const getUploadURL = async function(myObj,endofupload) {
  console.log('getUploadURL started')
  console.log(myObj)
  let actionId = Date.now()
  
  if (endofupload == "EndOfUpload") {
    var s3Params = {
    Bucket: uploadBucket,
    Key:  `${actionId}.txt`,
    ContentType: 'image',
    Metadata: {
    'email': `${myObj}`,
    'trigger' : `${endofupload}`
  },
  };
    
  } else {
      var s3Params = {
    Bucket: uploadBucket,
    Key:  `${actionId}.jpg`,
    ContentType: 'image',
    Metadata: {
    'email': `${myObj}`
  },
  };

    
  }

  return new Promise((resolve, reject) => {
    let uploadURL = s3.getSignedUrl('putObject', s3Params)
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
          "uploadURL": uploadURL,
          "photoFilename": `${actionId}.jpg`
      })
    })
  })
}