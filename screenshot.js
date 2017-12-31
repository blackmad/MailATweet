module.exports = {
  screenshotAndResizeSocialIdForLob: screenshotAndResizeSocialIdForLob
};

const puppeteer = require('puppeteer');
const tmp = require('tmp');
const sharp = require('sharp');

async function screenshotInstagram ({url, errorHandler}) {
  console.log(`loading: ${url}`)
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  //await page.setViewport({width: 1280, height: 2000, deviceScaleFactor: 2})
  await page.setViewport({width: 700, height: 2000, deviceScaleFactor: 2})
  await page.emulateMedia('screen')
  await page.goto(url, {"waitUntil" : "networkidle0"})

  page.on('error', (e) => {
    console.log('error from chrome');
    errorHandler(e.message);
  })

  const clip = await page.evaluate(() => {
      // // Anonymous "self-invoking" function
      // (function() {
      //     // Load the script
      //     // This is a race, need to fix
      //     var script = document.createElement("SCRIPT");
      //     script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
      //     script.type = 'text/javascript';
      //     script.onload = function() {
      //       document.getElementsByTagName("head")[0]
      //         var $ = window.jQuery;
      //         // Use $ here...
      //         $('nav').remove();
      //         $('footer').remove();
      //     };
      //     document.getElementsByTagName("head")[0].appendChild(script);
      // })();

      var elem = document.getElementsByTagName('article')[0];
      // elem.style.border = 'none';
      return {
        'width': elem.scrollWidth + 2,
        'height': elem.scrollHeight + 2,
        'x': elem.getBoundingClientRect().left,
        'y': elem.getBoundingClientRect().top
      }
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

// give it a tweet url and it returns the tweet detail frame rendered
async function screenshotTweet ({url, maxPreviousTweets, errorHandler}) {
  console.log(`loading: ${url}`)
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.setViewport({width: 1280, height: 2000, deviceScaleFactor: 2})
  await page.emulateMedia('screen')
  await page.goto(url, {waitUntil: 'networkidle0'})

  if (maxPreviousTweets == null) {
    maxPreviousTweets = 1;
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
    $('.follow-bar').remove()

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
      console.log(`height: ${info['height']} - width: ${info['width']}`)
      if (info['height'] > info['width']) {
        console.log('h > w - rotating')
        imageSharp = imageSharp.rotate(270)
      }

      // var tmpFileName = tmp.tmpNameSync() + '.png';
      console.log('max: 1875 x 1275')

      // safe area of 5.875 x 3.875 @ 300dpi is roughly this
      return imageSharp
        .resize(1762, 1162)
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

async function screenshotAndResizeSocialIdForLob({namespace, url, maxPreviousTweets, errorHandler}) {
  console.log('got maxPreviousTweets ' + maxPreviousTweets)
  console.log(namespace)
  console.log(url)

  var screenshotFunc = null;
  if (namespace == 'instagram') {
    screenshotFunc = screenshotInstagram;
  } else if (namespace === 'twitter') {
    screenshotFunc = screenshotTweet;
  }

  return screenshotFunc({
    url: url,
    maxPreviousTweets,
    errorHandler
  }).then((fileName) => {
    return resizeForPostcard(fileName)
  })
}