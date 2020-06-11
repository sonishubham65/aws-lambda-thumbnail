var AWS = require('aws-sdk');
var S3 = new AWS.S3();
let sharp = require('sharp');
async function resize(bucket, originalKey, width, height) {
    let format = originalKey.split('.').pop();
    let split = originalKey.split('/');
    let folder = split.splice(0, split.length - 1)[0];
    let key = split.pop();
    let writeKey = `${folder}-${width}x${height}/${key}`
    let quality = 100;

    console.log("****Function Entered****", writeKey, format)
    let image = await S3.getObject({ Bucket: bucket, Key: originalKey }).promise()
    console.log("****File read****")
    let buffer = await sharp(image.Body).resize({
        width: width,
        height: height,
        fit: sharp.fit.cover
    }).toFormat(format, { quality: quality }).toBuffer()
    console.log("****File buffered****")
    let result = await S3.putObject({
        Body: buffer,
        Bucket: bucket,
        ACL: 'public-read',
        ContentType: 'image/' + format,
        Key: writeKey,
    }).promise();
    console.log("****File put****")
    console.log(result);
}
exports.handler = async (event) => {
    try {
        console.log("****Started****")
        console.log(event.Records[0])
        let bucket = event.Records[0].s3.bucket.name;
        let originalKey = event.Records[0].s3.object.key;
        // let bucket = "sonishubham-s3-3";
        // let originalKey = "images/e799508d-7d96-4b29-a260-29875e1db04b-Main-Banner-1.jpg";
        console.log(bucket, originalKey);
        console.log("****Function called****");
        let result = await resize(bucket, originalKey, 100, 100);
        console.log(result);
        console.log("****Ended****")
    } catch (e) {
        console.log(e)
    }
    return 1;
};