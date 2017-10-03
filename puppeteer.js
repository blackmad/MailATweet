const puppeteer = require('puppeteer');
const tmp = require('tmp');
const sharp = require('sharp');

async function screenshotTweet(tweetUrl) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 2000, deviceScaleFactor: 2});
  await page.emulateMedia('screen');
  await page.goto(tweetUrl, {waitUntil: 'networkidle'});
  const clip = await page.evaluate(() => {
    // in .permalink remove every node after .permalink-tweet-container
    $('.permalink-tweet-container').nextAll('div').remove();
    $('.permalink').nextAll('div').remove();
    $('.PermalinkProfile-dismiss').remove();

    // need to fix the rounded corners too
    $('.permalink').css('border', '0px');
    $('.permalink').css('border-radius', '0px');

    return {
      'width': $('.permalink').width(),
      'height': $('.permalink').height(),
      'x': $('.permalink').offset()['left'],
      'y': $('.permalink').offset()['top']
    }
  });

  var tmpFileName = tmp.tmpNameSync() + '.png';

  await page.screenshot({
    path: tmpFileName,
    clip: clip
  });

  await browser.close();

  return tmpFileName;
};

//     /* If using an image, the background image should have dimensions of 1875x1275 pixels. */
// YES THIS WORKS
async function resizeForPostcard(imagePath) {
  var imageSharp = sharp(imagePath)

  return imageSharp
    .metadata()
    .then(info => {
      if (info['height'] > info['width']) {
        console.log('h > w - rotating')
        imageSharp = imageSharp.rotate(90);
      }

      var tmpFileName = tmp.tmpNameSync() + '.png';

      return imageSharp
        .resize(1875, 1275)
        .max()
        .toBuffer()
        .then(outputBuffer => {
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
          .toFile(tmpFileName)
          .then(() => {return tmpFileName;});
        })
    })
}

(async () => {
  const fileName = await screenshotTweet('https://twitter.com/Bodegacats_/status/914092267983589376');
  // const fileName = await screenshotTweet('https://twitter.com/horse_ebooks/status/218439593240956928?lang=en')
  console.log(fileName);
  const newFileName = await resizeForPostcard(fileName);
  console.log(newFileName)
  const { exec } = require('child_process');
  exec(`open ${newFileName}`)
})();


