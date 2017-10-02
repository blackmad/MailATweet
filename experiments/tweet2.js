var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'

page.viewportSize = {
  width: 1600,
  height: 1600
};

page.open('https://twitter.com/Bodegacats_/status/914092267983589376', function() {
      page.render('capture.png');
            phantom.exit();
});
