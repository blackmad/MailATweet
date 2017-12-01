import { extractIdFromUrlOrId } from './client/src/utils'
const screenshot = require('./screenshot')
const tmp = require('tmp');

var tmpFileName = tmp.tmpNameSync() + '.png';

var myArgs = process.argv.slice(2);
console.log(myArgs[0])
var socialId = extractIdFromUrlOrId(myArgs[0]);
console.log(socialId);

var future = null;

future = screenshot.screenshotAndResizeSocialIdForLob({
  id: socialId.getId(),
  namespace: socialId.getNamespace(),
  url: socialId.getUrl(),
  maxPreviousTweets: 2
})

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