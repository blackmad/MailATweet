//Load express module with `require` directive
var express = require('express')
var app = express()
var screenshot = require('./screenshot');
var s3 = require('./s3');

// TODO: env variable
// TODO: reasonable return from /tweet
// TODO: commit
// TODO: deploy to docker

var Lob = require('lob')('test_d3321edead8cc2596b15cdd9765f20c5f6d');

//Define request response in root URL (/)
app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/tweet', function (req, res) {
  console.log(req.query.id)
  const tweetId = '446452341475409921'
  screenshot.screenshotAndResizeTweetIdForLob(tweetId).then((fileBuffer) => {
    console.log('sending to s3')
    s3.uploadToS3(fileBuffer, (resp) => res.send(resp))
  })
})

//Launch listening server on port 8081
app.listen(8081, function () {
    console.log('app listening on port 8081!')
})
