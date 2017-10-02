const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 2000, deviceScaleFactor: 1});
  await page.emulateMedia('screen');
  await page.goto('https://twitter.com/Bodegacats_/status/914092267983589376', {waitUntil: 'networkidle'});
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

  await page.screenshot({
    path: 'tweet.png',
    clip: clip
  });
  //await page.pdf({path: 'hn.pdf', format: 'A4'});

  await browser.close();
})();
