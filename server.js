// Load express module with `require` directive
const express = require('express')
const app = express()
const screenshot = require('./screenshot')
const gcloudStorage = require('./gcloud-storage')
const s3Storage = require('./s3-storage')
const path = require('path');
const storageLayer = s3Storage
const model = require('./model-datastore')

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

const postStripeCharge = (res, lobData) => (stripeErr, stripeRes) => {
  if (stripeErr) {
    console.log('stripe error')
    console.log(stripeErr)
    res.status(500).send({ error: stripeErr });
  } else {
    var sendFunc = previewPostcard;
    if (process.env.NODE_ENV === 'production') {
      console.log('sending prod postcard for reals post stripe')
      sendFunc = sendPostcard;
    }

    sendFunc(lobData).then(() =>
      res.status(200).send({ success: stripeRes })
    )
  }
}

app.post('/api/payAndSendTweet', (req, res) => {
  console.log(req.body)
  const data = {
      amount: req.body.amount,
      description: req.body.description,
      currency: req.body.currency,
      source: req.body.source
    }
  const lobData = extractLobParams(req.body);
  stripe.charges.create(data, postStripeCharge(res, lobData));
});

app.get('/api/previewTweet', function (req, res) {
  console.log(req.query.id)
  const tweetId = req.query.id;
  const maxPreviousTweets = req.query.maxPreviousTweets;
  console.log('got maxPreviousTweets ' + maxPreviousTweets)
  const errorHandler = (errorMessage) => {
    res.send({
      error: {
        message: errorMessage
      }
    })
  }

  screenshot.screenshotAndResizeTweetIdForLob({
    tweetId,
    errorHandler,
    maxPreviousTweets: maxPreviousTweets
  }).then((fileBuffer) => {
    console.log('uploading')
    storageLayer.uploadFile(fileBuffer, (resp) => res.send(resp))
  }).catch((error) => {
    console.log(error);
    errorHandler(error.message);
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

function extractLobParams(paramDict) {
  const s3path = getImageFromId(paramDict.id)
  console.log(s3path)

  const data = {
    frontFilePath: s3path,
    email: paramDict.email,
    address: {
      name: paramDict.name,
      address_line1: paramDict.address_line1,
      address_line2: paramDict.address_line2,
      address_city: paramDict.address_city,
      address_state: paramDict.address_state,
      address_zip: paramDict.address_zip,
      address_country: paramDict.address_country
    },
    message: paramDict.message || 'Tweet for you.'
  }

  return data;
}

app.get('/api/sendTweet', async function (req, res) {
console.log(req.query)
  console.log('test? ' + req.query.test)

  var sendFunc = sendPostcard;
  var sendFunc = previewPostcard;
  if (req.query.test === 'true') {
    console.log('generating test postcard')
    sendFunc = previewPostcard;
  } else {
    console.log('sending prod postcard for reals')
    sendFunc = previewPostcard;
  }

  const data = extractLobParams(req.query);
  await sendFunc(data).then(function (resp) {
    console.log(resp['id'])
    // getModel().create(data, (err, savedData) => {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     res.send(resp)
    //   }
    // })
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
