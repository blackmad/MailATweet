module.exports = {
  screenshotAndResizeTweetIdForLob: screenshotAndResizeTweetIdForLob
}

const puppeteer = require('puppeteer')
const tmp = require('tmp')
const sharp = require('sharp')

// give it a tweet url and it returns the tweet detail frame rendered
async function screenshotTweet ({tweetUrl, maxPreviousTweets, errorHandler}) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.setViewport({width: 1280, height: 2000, deviceScaleFactor: 2})
  await page.emulateMedia('screen')
  await page.goto(tweetUrl, {waitUntil: 'networkidle'})

  if (maxPreviousTweets == null) {
    maxPreviousTweets = 5;
  }

  page.on('error', (e) => {
    console.log('error from chrome');
    errorHandler(e.message);
  })

  console.log('max prev tweets ' + maxPreviousTweets)

  const clip = await page.evaluate(({maxPreviousTweets}) => {
    // in .permalink remove every node after .permalink-tweet-container
    $('.permalink-tweet-container').nextAll('div').remove()
    $('.permalink').nextAll('div').remove()
    $('.PermalinkProfile-dismiss').remove()

    // if there are too many tweets before this, kill them
    let priorTweets = $('.ThreadedConversation-tweet');
    if (priorTweets.length > maxPreviousTweets) {
      for (let i = 0; i < priorTweets.length - maxPreviousTweets; i++) {
        console.log('removing prior tweet: ' + i)
        $(priorTweets[i]).remove();
      }
    }

    // need to fix the rounded corners too
    $('.permalink').css('border', '0px')
    $('.permalink').css('border-radius', '0px')

    return {
      'width': $('.permalink').width(),
      'height': $('.permalink').height(),
      'x': $('.permalink').offset()['left'],
      'y': $('.permalink').offset()['top']
    }
  }, {
    maxPreviousTweets
  })

  var tmpFileName = tmp.tmpNameSync() + '.png'

  await page.screenshot({
    path: tmpFileName,
    clip: clip
  })

  await browser.close()

  console.log('got the screenshot ' + tmpFileName)

  return tmpFileName
};

//     /* If using an image, the background image should have dimensions of 1875x1275 pixels. */
// YES THIS WORKS
// given an image, max resize it for LOB at 1875x1275
function resizeForPostcard (imagePath) {
  var imageSharp = sharp(imagePath)

  return imageSharp
    .metadata()
    .then(info => {
      if (info['height'] > info['width']) {
        console.log('h > w - rotating')
        imageSharp = imageSharp.rotate(270)
      }

      // var tmpFileName = tmp.tmpNameSync() + '.png';

      return imageSharp
        .resize(1875, 1275)
        .max()
        .toBuffer()
        .then(outputBuffer => {
          console.log('resizing second pass')
          // the prior code only maximizes one dimension, now we need to resize it again without max()
          // this is a dumb hack
          return sharp({
            create: {
              width: 1875,
              height: 1275,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          })
          .overlayWith(outputBuffer)
          .png()
          .toBuffer()
        })
    })
}

async function screenshotAndResizeTweetIdForLob ({tweetId, maxPreviousTweets, errorHandler}) {
  console.log('got maxPreviousTweets ' + maxPreviousTweets)
  // twitter doesn't care what user is in this path
  return screenshotTweet({
    tweetUrl: `https://twitter.com/Bodegacats_/status/${tweetId}`,
    maxPreviousTweets,
    errorHandler
  }).then((fileName) => {
    return resizeForPostcard(fileName)
  })
}
