const { Chromeless } = require('chromeless')

async function run() {
  const chromeless = new Chromeless({
    remote: {
      endpointUrl: 'https://15af9hbbeg.execute-api.us-east-1.amazonaws.com/dev',
      apiKey: 'ZuOKb1o6s313iiLatLigM6RMBzDGzFn42BfZB2LP'
    },
    viewport: {width: 1440, height: 2000, scale: 1}
})

  await chromeless.goto('https://twitter.com/Bodegacats_/status/914092267983589376')
  await chromeless.wait('.permalink')
  const clip = await chromeless.evaluate(() => {
    // in .permalink remove every node after .permalink-tweet-container
    $('.permalink-tweet-container').nextAll('div').remove();
    $('.permalink').nextAll('div').remove();

    // need to fix the rounded corners too
    $('.permalink').css('border', '0px');
    $('.permalink').css('border-radius', '0px');

    $('.permalink').attr('id', 'permalink')
  });


  const screenshot = await chromeless.screenshot('#permalink', { filePath: 'twitter.png' })

  console.log(screenshot) // prints local file path or S3 url

  await chromeless.end()
}

run().catch(console.error.bind(console))
