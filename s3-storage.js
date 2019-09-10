module.exports = {
  uploadFile: uploadToS3,
  makePath: makePath
}

var randomstring = require('randomstring')
var aws = require('aws-sdk')
const secrets = require('load-secrets')

var s3 = new aws.S3({
  accessKeyId: secrets.AWS_ACCESS_KEY_ID,
  secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY
});

const bucketName = 'mail-a-tweet'

function makePath (path) {
  if (!path.endsWith('.png')) {
    path += '.png';
  }
  return `http://${bucketName}.s3.amazonaws.com/${path}`
}

function uploadToS3 (fileBuffer, callback) {
  // var fileBuffer = fs.readFileSync(localFilePath);
  // var metaData = getContentTypeByFile(fileName);
  const key = randomstring.generate()

  const remoteFilename = key + '.png'
  const remotePath = makePath(remoteFilename)

  console.log('putting on s3 at ' + remotePath)

  return s3.putObject({
    ACL: 'public-read',
    Body: fileBuffer,
    Key: remoteFilename,
    Bucket: bucketName,
    ContentType: 'image/png'
    // ContentType: metaData
  }, function (error, response) {
    // console.log('uploaded file[' + fileName + '] to [' + remoteFilename + '] as [' + metaData + ']');
    // console.log(arguments);
    console.log('error: ' + error)
    console.log(response)
    callback({
      id: key,
      path: remotePath
    })
  })
}
