// Load express module with `require` directive
const express = require('express')
const app = express()
const screenshot = require('./screenshot')
const gcloudStorage = require('./gcloud-storage')
const path = require('path');
const storageLayer = gcloudStorage

var secrets = require('load-secrets')
console.log('secrets')
console.log(secrets)

const STRIPE_KEY = process.env.NODE_ENV === 'production'
  ? secrets.STRIPE_PROD_SECRET_KEY
  : secrets.STRIPE_TEST_SECRET_KEY;

const stripe = require('stripe')(STRIPE_KEY)

// TODO: oh, these should all be POSTs
// TODO: learn express routes, decompose into multiple files

const TestLob = require('lob')(secrets.LOB_TEST_KEY)
const ProdLob = require('lob')(secrets.LOB_PROD_KEY)

const FRONTEND_DEV_URLS = [ 'http://localhost:3000' ];

const FRONTEND_PROD_URLS = [
  'https://mail-a-tweet.appspot.com/',
  'https://mail-a-tweet.blackmad.com/',
  'https://post-a-tweet.blackmad.com/',
  'https://mailatweet.blackmad.com/',
  'https://postatweet.blackmad.com/'
];

const CORS_WHITELIST = process.env.NODE_ENV === 'production'
  ? FRONTEND_PROD_URLS
  : FRONTEND_DEV_URLS;

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Define request response in root URL (/)
app.get('/api', function (req, res) {
  res.send('Hello World!')
})

const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    console.log('stripe error')
    console.log(stripeErr)
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
}

app.post('/api/payAndSendTweet', (req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
});

app.get('/api/previewTweet', function (req, res) {
  console.log(req.query.id)
  const tweetId = req.query.id;
  screenshot.screenshotAndResizeTweetIdForLob(tweetId).then((fileBuffer) => {
    console.log('uploading')
    storageLayer.uploadFile(fileBuffer, (resp) => res.send(resp))
  })
})

function getImageFromId (id) {
  // for now, nothing fancy
  return storageLayer.makePath(id)
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
  var sendFunc = previewPostcard;
  if (req.params.test) {
    console.log('sending prod postcard for reals')
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

const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) =>
    (CORS_WHITELIST.indexOf(origin) !== -1)
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'))
};

app.use(cors());

// Serve static assets
app.use(express.static(path.resolve(__dirname, 'client', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

console.log(`node env: ${process.env.NODE_ENV}`)

// Launch listening server on port 8081
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`app listening on port ${PORT}!`)
})
