// Load express module with `require` directive
var express = require('express')
var app = express()
var screenshot = require('./screenshot')
var s3 = require('./s3')
const secrets = require('load-secrets')

console.log('secrets')
console.log(secrets)

var stripe = require('stripe')(secrets.STRIPE_TEST_SECRET_KEY)

// TODO: oh, these should all be POSTs
// TODO: learn express routes, decompose into multiple files

var TestLob = require('lob')(secrets.LOB_TEST_KEY)
var ProdLob = require('lob')(secrets.LOB_PROD_KEY)

// Define request response in root URL (/)
app.get('/api', function (req, res) {
  res.send('Hello World!')
})

const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
}

app.post('/payAndSendTweet', (req, res) => {
  stripe.charges.create(req.body, postStripeCharge(req, res));
});

app.get('/api/previewTweet', function (req, res) {
  console.log(req.query.id)
  const tweetId = req.query.id;
  screenshot.screenshotAndResizeTweetIdForLob(tweetId).then((fileBuffer) => {
    console.log('sending to s3')
    s3.uploadToS3(fileBuffer, (resp) => res.send(resp))
  })
})

function getImageFromId (id) {
  // for now, nothing fancy
  return s3.makePath(id)
}

function previewPostcard({frontFilePath, address, message}) {
  return TestLob.postcards.create({
    description: 'My First Postcard',
    to: address,
    front: frontFilePath,
    message: message
  })
}

function sendPostcard({frontFilePath, address, message}) {
  return ProdLob.postcards.create({
    description: 'My First Postcard',
    to: address,
    front: frontFilePath,
    message: message
  })
}

app.get('/api/sendTweet', async function (req, res) {
  const s3path = getImageFromId(req.query.id)
  console.log(s3path)
  console.log(req.params)
  console.log(req.params.message)

  var sendFunc = sendPostcard;
  if (req.params.test) {
    sendFunc = previewPostcard;
  }

  await sendFunc({
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
    message: req.query.message || 'Tweet for you.'
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