# Animation Tests

Miscellaneous experiments with automatically rendering gifs from data-driven JavaScript animations.

## Why?

Interactive visualizations are cool, but sometimes a gif or a video tells the story pretty well by itself.  Gifs have the advantage of being easy to save, easy to share, and easy to view on pretty much any device.

Even if you're going to publish a whole interactive shebang, odds are you'll want something like a gif for social sharing or for demonstrating particular aspects of the data.

The current state-of-the-art for rendering a gif from your in-browser animation still mostly seems to be screen capture, which is easy but not very repeatable or configurable.  I was curious to explore other options.

## How?

Here's an overview of some different techniques for creating a gif of a cool JavaScript animation you wrote, with pros and cons of each.

### QuickTime + FFmpeg

As [outlined by Mike Bostock](http://bl.ocks.org/mbostock/4b88b250bc4439289d94), you can create a gif of your animation by taking a screen recording of your browser with QuickTime, converting the movie to frames with [FFmpeg](https://www.ffmpeg.org/), and combining them with [gifsicle](https://www.lcdf.org/gifsicle/).

#### Pros

* Relatively straightforward process
* Works on any kind of animation
* Can show user interactions (like a button being clicked)

#### Cons

* Manual recording means you have to redo the whole process for any change
* Hard to precisely crop the screen area and start/end times
* Lack of fast visual feedback for tweaking
* Requires command-line tools and comfort with them

### QuickTime + Photoshop

As [outlined by Lena Groeger](http://lenagroeger.s3.amazonaws.com/talks/nicar-2015/loops-nicar/gif-tutorials/screengif.html) you can create a gif by taking a screen recording of your browser with QuickTime, converting the movie to frames with Photoshop's "Video Frames To Layers" function, and saving the result as an animated gif.

#### Pros

* Relativelystraightforward process
* Works on any kind of animation
* Can show user interactions (like a button being clicked)
* Easy to tweak individual frames

#### Cons

* Manual recording means you have to redo the whole process for any change
* Requires Photoshop license
* Requires comfort with Photoshop, especially for cropping or tweaking frames

http://lenagroeger.s3.amazonaws.com/talks/nicar-2015/loops-nicar/gif-tutorials/screengif.html

### LICEcap

You can create a gif using [LICEcap](https://github.com/lepht/licecap) by taking a screen recording of your browser and saving it directly as a gif.

#### Pros

* Straightforward process with very few steps
* Works on any kind of animation
* Can show user interactions (like a button being clicked)
* You can move the window while it's recording
* Easy control over framerate

#### Cons

* Manual recording means you have to redo the whole process for any change
* Hard to precisely crop the screen area and start/end times
* Tweaking requires adding in other tools

### Node + canvas

As [described by Tom MacWright](https://github.com/tmcw/node-canvas-animation-example/), you can use the [canvas](https://www.npmjs.com/package/canvas) module to write JavaScript for an animation the same way you would for a browser and then run a node script to spit out all the frames as images.

To compile the frames into a gif, you can either use command line tools or do it within your script using modules like [node-gif](https://github.com/pkrumins/node-gif) or [gifencoder](https://www.npmjs.com/package/gifencoder).

#### Pros

* All code, not manual - can make this part of an automated pipeline, or quickly get a new gif when you tweak something in your code
* Detailed control over size, start/end, and framerate

#### Cons

* All code, not manual - higher barrier to entry
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* Only works with a `<canvas>`-based animation, not `<svg>` or anything else. That means no styling with CSS, no SVG-specific features, etc.
* No access to browser APIs or features that aren't supported by the `canvas` module.
* Lots of image library dependencies
* Requires [Node.js](https://nodejs.org/en/) and some comfort level with it
* Requires command-line tools and some comfort with them

### Web workers + canvas

Demo: http://bl.ocks.org/veltman/03edaa335f93b5a9ee57

The basic idea here is to write in-browser code similar to the "Node + canvas" approach above, where you update a `<canvas>` element frame-by-frame.  You combine the frames into a gif in the background using [gif.js](https://jnordberg.github.io/gif.js/) web workers.  This is relatively slow, but you get visual feedback and there are no dependencies besides the gif.js library.  You only need some JavaScript and a web browser.

TK FILL THIS IN MORE

#### Pros

* Code-based - easy to get a new gif when you tweak something in your code
* Detailed control over size, start/end, and framerate
* Can access browser APIs and non-canvas features. For example, [this demo](http://bl.ocks.org/veltman/b100d04bda697f95f246) creates a dummy SVG to calculate the length of a path before adding it to a canvas.
* No node scripts or command line required
* I assume you could use this with WebGL to make a 3D gif?

#### Cons

* You still need to execute the code in a browser and save the result manually; it's better for an internal tool than for any sort of automated pipeline.
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* The animation itself ultimately has to be done with a `<canvas>` element; you can't really manipulate things as DOM elements or style them with CSS without some insane hacks
* Rendering takes a non-trivial amount of time, something like 5 or 10 seconds of render time per 1 second of animation
* Doesn't work in every browser

### Web workers + SVG

Demo: http://bl.ocks.org/veltman/1071413ad6b5b542a1a3

The basic idea here is similar to the "Web workers + canvas" approach above, but using an SVG instead.  With a little trickery involving a Blob and a dummy image element, you can render the contents of an SVG as an image and turn that into an animation frame.  Unlike the canvas approach, this gives you full access to SVG elements, attributes, and techniques.  It still kind of seems like black magic.

TK FILL THIS IN MORE

#### Pros

* Code-based - easy to get a new gif when you tweak something in your code
* Detailed control over size, start/end, and framerate
* Can make full use of SVG goodness and style things with CSS
* No node scripts or command line required

#### Cons

* You still need to execute the code in a browser and save the result manually; it's better for an internal tool than for any sort of automated pipeline.
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* Rendering is slower than the `<canvas>` version
* No 3D
* Doesn't work in every browser

### PhantomJS

One of the big downsides to the two in-browser approaches above is that you have to structure your code in a particular way.  It has to explicitly set the current frame based on how far along it is, like:

```js

  // Do a bunch of initialization

  // Loop through the number of frames you want
  for (var i = 0; i < numFrames; i++) {

    bar.attr("width",maxBarWidth * i / numFrames);

    // save the frame

  }

```

For a simple animation this is feasible, but once it gets more complex it really sucks.  Your normal code is more likely to look like:

```js
// d3
allTheBars.transition()
  .duration(2000)
  .ease("some-weird-easing-function")
  .attr("width",someComplicatedFunction);
```

or maybe

```js
// jQuery
$(".bar").animate({
  width: 100
},2000);
```

One way to capture that programmatically while still leveraging browser goodness is with [PhantomJS](http://phantomjs.org/), a headless web browser.  Using a variation of [this technique](http://mindthecode.com/recording-a-website-with-phantomjs-and-ffmpeg/), you can screen capture your page every few milliseconds and get your frames that way.

For example, if you have the following page, where the function `ready()` kicks off the animation:

```html
<!DOCTYPE html>
<meta charset="utf-8">
<style>

body {
  margin: 0;
  padding: 0;
}

rect {
    fill: #e51133;
}

</style>
<body>
<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.10/d3.min.js"></script>
<script>

  var width = 600,
      height = 600;

  var svg = d3.select("body").append("svg")
      .attr("width",width)
      .attr("height",height);

  var y = d3.scale.ordinal()
      .domain(d3.range(6))
      .rangeRoundBands([0,height],0.1);

  var bars = svg.selectAll("rect")
      .data(y.domain())
      .enter()
      .append("rect")
      .attr("y",y)
      .attr("width",0)
      .attr("height",y.rangeBand());

  function ready() {

    bars.transition()
        .duration(2000)
        .attr("width",function(d){
          return width / (d+1);
        });

  }

</script>
```

You could capture it and pipe it to stdout with this script:

```js
var page = require("webpage").create();

// Page dimensions
var url = "http://localhost:8888/", // URL of your page
    duration = 2000,
    numFrames = 50,
    currentFrame = 0;

page.open(url,function(status) {

  // Update page dimensions
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
```

And save that output as an mp4 using FFmpeg:

```
$ phantomjs render.js | ffmpeg -y -c:v png -f image2pipe -r 25 -t 2  -i - -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart movie.mp4
```

Then you've still got to convert your movie into a gif.

TK FILL THIS IN MORE

#### Pros

* Can use anything that works in a webkit browser
* Detailed control over size, start/end, and framerate

#### Cons

* Syncing things between your browser code and your PhantomJS script is pretty annoying and is hard to do without lots of exposed global variables; timing is especially tricky
* PhantomJS, FFmpeg, gifsicle dependencies
* PhantomJS gets weird about certain things like webfonts sometimes
* Probably the slowest option
* Seems like a very convoluted hack!

### The next frontier: hacking d3 transitions

As noted in the "PhantomJS" section above, there's a frustrating tradeoff between the sort of animation code you might naturally write and the way you have to write it to save out a gif.  Wouldn't it be nice if you could still make use of abstractions like `d3.transition` but also say "while you're doing all that transitioning, stop every few milliseconds and save a frame for a gif"?


```js

allTheBars.transition()
  .duration(2000)
  .ease("some-weird-easing-function")
  .attr("width",someComplicatedFunction);
  .frames(50)
  .on("frame",function(f){
    // f is image data for the next frame, add it to a gif
  });

```

Because these transitions are asynchronous and use `requestAnimationFrame`, they're hard to tap into, and they don't even step through the animation at totally predictable intervals.  If your browser got distracted by a bird, it might be a while before the next animation update happens.  So we need a way to tell d3: "Here's the transition I want; now you know all the math to calculate any arbitrary point along the way; let me have the remote and press play/pause/stop/fast-forward and jump to arbitrary time t."

```js
// The normal transition
var transition = allTheBars.transition()
  .duration(2000)
  .ease("some-weird-easing-function")
  .attr("width",someComplicatedFunction);

// A ghost transition that internalizes all the transition math
// Knows what value to set for each element at any time t but
// doesn't actually run
var ghostTransition = transition.ghost();

saveAllTheFrames(ghostTransition,50);

function saveAllTheFrames(ghost,numFrames) {

  for (var i = 0; i < numFrames; i++) {
    // synchronously update attributes of elements in the transition
    // to match a given percentage progress in time
    ghost.progress(i / numFrames);

    //save the frame here
  }

}
```

This seems mildly insane but let's give it a shot.

TK FILL THIS IN

#### Pros

* Can use pretty much anything that works in a browser
* Can use declarative syntax for your animations (i.e. less math)
* Detailed control over size, start/end, and framerate

#### Cons

* Still doesn't work with things like d3 axes, which have very specific and complicated behavior around transitions
* Seems like an even more convoluted hack!



## Notes

Gifs, especially long ones, have plenty of downsides. Files can get huge and performance can be sluggish. Color palette limitations can produce grainy gifs, especially if photos or gradients are involved.  Always gif responsibly.

## Other resources

* [gif.js](https://jnordberg.github.io/gif.js/) - generate gifs in your browser using web workers (related: [gifshot](https://github.com/yahoo/gifshot) and [jsgif](https://github.com/antimatter15/jsgif))
* [Filmstrips](http://blog.apps.npr.org/2014/01/08/animation-with-filmstrips.html) - a technique for a gif-like experience with better performance and timing control (but lacking the universality of an image format)
* [Drawing DOM objects into a canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas) - a variation of this technique works for rendering an SVG straight to an image for giffing purposes
* [Canvas animation basics](http://www.macwright.org/2015/08/14/canvas-animation-methods.html) - a tutorial by Tom MacWright
* [Piping video frames from PhantomJS to FFmpeg](http://mindthecode.com/recording-a-website-with-phantomjs-and-ffmpeg/)
* [Pausing and resuming d3 transitions](http://xaedes.de/dev/transitions/) - some technique like this becomes necessary if you want to manually tween a d3 transition between frames using nonlinear easing
* [canvid](https://github.com/gka/canvid) - for embedding short pseudo-gifs without the compromise in image quality
* [libgif-js](https://github.com/buzzfeed/libgif-js) - A gif manipulation library from BuzzFeed
* [Datagifs](https://www.pinterest.com/jsvine/datagifs/) - A Pinterest board curated by Jeremy Singer-Vine
* [The Power of Loops](https://www.youtube.com/watch?v=zd0YQAgu3dI) - Lena Groeger's 2015 OpenVis Conf talk on the narrative potential of loops
* [Disney's 12 Basic Principles of Animation](https://en.wikipedia.org/wiki/12_basic_principles_of_animation)
