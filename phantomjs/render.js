var page = require("webpage").create();

// Page dimensions
var duration = 2000,
    numFrames = 50,
    currentFrame = 0;

page.open("http://localhost:8888/",function(status) {

  // Match dimensions
  var wh = page.evaluate(function(){ return [width,height]; });
  page.clipRect = { top: 0, left: 0, width: wh[0], height: wh[1] };
  page.viewportSize = { width: wh[0], height: wh[1] };

  // Start animation
  page.evaluate(function(){ ready(); });

  // Get the first frame right away
  getFrame();

  function getFrame() {
    page.render("/dev/stdout", { format: "png" });

    if (currentFrame > numFrames) {
      return phantom.exit();
    }

    setTimeout(getFrame,duration/numFrames);

  }

});
