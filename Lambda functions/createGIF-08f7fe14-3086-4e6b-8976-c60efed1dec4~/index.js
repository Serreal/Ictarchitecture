const fetch = require('node-fetch');
const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION })

const s3 = new AWS.S3();

exports.handler = async(event) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    console.log(key)

    const params = {
      Bucket: bucket,
      Key: key
    }
    const metadata = await s3.getObject(params).promise();
    const email = metadata.Metadata.email;
    const test = metadata.Metadata.trigger;


    // Verkrijg de signed upload url om de gif naar de gif bucket te kunnen uploaden.
    let actionId = Date.now()
    const uploadBucket = 'ap-ictarchitecture-groep4-gifs'

    var s3Params = {
      Bucket: uploadBucket,
      Key: `${email}.gif`,
      ContentType: 'image/gif',
      Metadata: {
        'email': `${email}`
      },
    };
    let uploadURL = s3.getSignedUrl('putObject', s3Params)

    // Verkijg alle objecten binnen de rawimages bucket
    var params2 = {
      Bucket: bucket
    }

    let s3Objects = null;

    try {
      s3Objects = await s3.listObjects(params2).promise();
      console.log(s3Objects)
    }
    catch (e) {
      console.log(e)
    }

    let arrayOfObjects = s3Objects.Contents

    // Filter de objecten uit de raw images bucket die hetzelde email adres hebben

    let arrayOfKeys = new Array();

    for (var i = 0; i < arrayOfObjects.length; i++) {
      const metadata1 = await s3.getObject({ Bucket: bucket, Key: arrayOfObjects[i].Key }).promise();
      const email2 = metadata1.Metadata.email;
      const endofupload = metadata1.Metadata.trigger;
      if (email2 == email && endofupload != 'EndOfUpload') {
        arrayOfKeys.push(arrayOfObjects[i].Key)
      }
    }

    let arrayOfURL = new Array();
    for (var i = 0; i < arrayOfKeys.length; i++) {
      let url = s3.getSignedUrl('getObject', { Bucket: bucket, Key: arrayOfKeys[i] })
      arrayOfURL.push(url)
    }
    
    console.log(arrayOfURL)

  console.log(arrayOfURL)
    const data = {
      //Input alle objecten van de bucket in .extension
      "inputImageUrls": arrayOfURL,
      "outputImageUrl": uploadURL //Output -> presigned url voor uploaden met email als metadata
      
    }

    const response = await fetch('https://msw31oj97f.execute-api.eu-west-1.amazonaws.com/Prod/generate/gif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'SIdHi3lzwma61h4GeBGR96ZD4rpsa3mb6iKVlMG7'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.text())
      //.then(() => {deletes3();})
      .catch(error => console.error(error));
    console.log(response);


    };
