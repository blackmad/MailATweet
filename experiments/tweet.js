var page = require('webpage').create();
page.open('https://twitter.com/Bodegacats_/status/914092267983589376', function() {
var clipRect = document.querySelector('permalink-tweet-container').getBoundingClientRect();
page.clipRect = {
    top:    clipRect.top,
    left:   clipRect.left,
    width:  clipRect.width,
    height: clipRect.height
};
page.render('capture.png');
  phantom.exit();
});
