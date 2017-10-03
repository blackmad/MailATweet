module.exports = {
  uploadToS3: uploadToS3
}

var randomstring = require("randomstring");
var aws = require('aws-sdk');
var s3 = new aws.S3();

const bucketName = 'serverlessimageresize-imagebucket-bu77xeh018n8'

function uploadToS3(fileBuffer, callback) {
  // var fileBuffer = fs.readFileSync(localFilePath);
  // var metaData = getContentTypeByFile(fileName);
  const key = randomstring.generate();

  const remoteFilename = key + ".png";
  const remotePath = `http://${bucketName}.s3.amazonaws.com/${remoteFilename}`

  console.log('putting on s3 at ' + remotePath);

  return s3.putObject({
    ACL: 'public-read',
    Body: fileBuffer,
    Key: remoteFilename,
    Bucket: bucketName,
    ContentType: 'image/png'
    // ContentType: metaData
  }, function(error, response) {
    // console.log('uploaded file[' + fileName + '] to [' + remoteFilename + '] as [' + metaData + ']');
    // console.log(arguments);
    console.log('error: ' + error)
    console.log(response)
    callback({
      id: key,
      path: remotePath
    });
  });
}
