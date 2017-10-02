var casper = require('casper').create({
  viewportSize: {width: 1280, height: 1500}
});


casper.start('https://twitter.com/Bodegacats_/status/914092267983589376', function() {
      //this.captureSelector('tweet.png', '.permalink-tweet-container');
    this.captureSelector('tweet-select.png', '.permalink-tweet-container');
       this.capture('tweet.png')
});

casper.run();
