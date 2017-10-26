const screenshot = require('./screenshot')
const tmp = require('tmp');
var tmpFileName = tmp.tmpNameSync() + '.png';

function extractTweetId(string) {
  if (string === null) { return null; }
  if (string.match(/^[0-9]+$/)) { return string; }
  const testUrl = string.match(/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?(?:mobile\.)?twitter\.com\/\w+\/status\/(\d+)(?:\?.*)?$/i);
  if (testUrl) { return testUrl[2]; }
  return null;
}

var myArgs = process.argv.slice(2);
console.log(myArgs[0])
console.log(extractTweetId(myArgs[0]))

var future = null;

if (myArgs[0].includes('twitter.com')) {
  future = screenshot.screenshotAndResizeTweetIdForLob({
    tweetId: extractTweetId(myArgs[0]),
    maxPreviousTweets: 2
  })
} else {
  future = screenshot.screenshotAndResizeInstagramForLob({
    instagramUrl: myArgs[0],
    maxPreviousTweets: 2
  })
}

future.then((fileBuffer) => {
  var fs = require('fs');
  var wstream = fs.createWriteStream(tmpFileName);

  wstream.write(fileBuffer);

  wstream.end();

  wstream.on('finish', function () {
    const { exec } = require('child_process');
    exec(`open ${tmpFileName}`)
    console.log('file has been written');
  });

})