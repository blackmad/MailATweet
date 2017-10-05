const puppeteer = require('puppeteer');
const tmp = require('tmp');
const sharp = require('sharp');
var Lob = require('lob')('test_d3321edead8cc2596b15cdd9765f20c5f6d');
const child_process = require('child_process')

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
function resizeForPostcard(imagePath) {
  var imageSharp = sharp(imagePath)

  return imageSharp
    .metadata()
    .then(info => {
      if (info['height'] > info['width']) {
        console.log('h > w - rotating')
        imageSharp = imageSharp.rotate(270);
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


function sendPostcard({frontFilePath, address, message}) {
  return Lob.postcards.create({
    description: 'My First Postcard',
    to: address,
    front: frontFilePath,
    message: message,
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
  const s3cmd = `s3cmd put ${newFileName} s3://serverlessimageresize-imagebucket-bu77xeh018n8`;
  console.log(s3cmd)
  console.log(child_process.execSync(s3cmd));
  const path = require('path');
  const s3path = 'http://serverlessimageresize-imagebucket-bu77xeh018n8.s3.amazonaws.com/' + path.basename(newFileName);
  console.log(s3path);
  sendPostcard({
    frontFilePath: s3path,
    address: {
      name: 'David Blackman',
      address_line1: '52 Ten Eyck St',
      address_line2: 'Apt 3B',
      address_city: 'Brooklyn',
      address_state: 'NY',
      address_zip: '11206',
      address_country: 'US'
    },
    message: 'this is a test message!'
  }).then(function (res) {
    console.log(res.data);
  })
  .catch(function (e) {
    console.log(e);
  });
})();