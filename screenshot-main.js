const screenshot = require('./screenshot')
const tmp = require('tmp');

var tmpFileName = tmp.tmpNameSync() + '.png';

var myArgs = process.argv.slice(2);
console.log(myArgs[0])


class TwitterId {
  constructor(id) {
    this.id = id
  }

  getNamespace() {
    return 'twitter'
  }

  getId() {
    return this.id;
  }

  getUrl() {
    return `https://twitter.com/Bodegacats_/status/${this.id}`;
  }
}

class InstagramId {
  constructor(id) {
    this.id = id
  }

  getUrl() {
    return `https://www.instagram.com/p/${this.id}/`
  }

  getNamespace() {
    return 'instagram'
  }

  getId() {
    return this.id;
  }
}

function extractIdFromUrlOrId(string) {
  if (string === null) { return null; }
  if (string.match(/^[0-9]+$/)) { return new TwitterId(string); }

  var twitterTestUrl = string.match(/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?(?:mobile\.)?twitter\.com\/\w+\/status\/(\d+)(?:\?.*)?$/i);
  if (twitterTestUrl) { return new TwitterId(twitterTestUrl[2]); }

  var instaTestUrl = string.match(/insta.*\/p\/([A-Za-z0-9\-_]+)\/(?:\?.*)$/i);
  if (instaTestUrl) { return new InstagramId(instaTestUrl[1]); }

  return null;
}

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
  var wstream = fs.createWriteStream(socialId.getId() + '.png');

  wstream.write(fileBuffer);

  wstream.end();

  wstream.on('finish', function () {
    const { exec } = require('child_process');
    console.log('file has been written');
  });

})
