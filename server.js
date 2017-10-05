// Load express module with `require` directive
var express = require('express')
var app = express()
var screenshot = require('./screenshot')
var s3 = require('./s3')

// TODO: env variable
// TODO: reasonable return from /tweet
// TODO: commit
// TODO: deploy to docker

var Lob = require('lob')('test_d3321edead8cc2596b15cdd9765f20c5f6d')

// Define request response in root URL (/)
app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/previewTweet', function (req, res) {
  console.log(req.query.tweetId)
  const tweetId = '446452341475409921'
  screenshot.screenshotAndResizeTweetIdForLob(tweetId).then((fileBuffer) => {
    console.log('sending to s3')
    s3.uploadToS3(fileBuffer, (resp) => res.send(resp))
  })
})

function getImageFromId (id) {
  // for now, nothing fancy
  return s3.makePath(id)
}

function sendPostcard ({frontFilePath, address, message}) {
  return Lob.postcards.create({
    description: 'My First Postcard',
    to: address,
    front: frontFilePath,
    message: message
  })
}

app.get('/sendTweet', async function (req, res) {
  const s3path = getImageFromId(req.query.id)
  console.log(s3path)
  console.log(req.params)
  console.log(req.params.message)
  await sendPostcard({
    frontFilePath: s3path,
    address: {
      name: req.query.name,
      address_line1: req.query.address_line1,
      address_line2: req.query.address_line2,
      address_city: req.query.address_city,
      address_state: req.query.address_state,
      address_zip: req.query.address_zip,
      address_country: req.query.address_country
    },
    message: req.query.message
  }).then(function (resp) {
    console.log(resp['id'])
    res.send(resp)
  })
  .catch(function (e) {
    console.log('error')
    console.log(e)
    res.send(e)
  })
})

// Launch listening server on port 8081
app.listen(8081, function () {
  console.log('app listening on port 8081!')
})
