# Animation Tests

Miscellaneous experiments with automatically rendering gifs from data-driven JavaScript animations.

## Why?

Interactive visualizations are cool, but sometimes a gif or a video tells the story pretty well by itself.  Gifs have the advantage of being easy to save, easy to share, and easy to view on pretty much any device.

Even if you're going to publish a whole interactive whatever, odds are you'll want something like a gif for social sharing or for demonstrating particular aspects of the data.

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

* Relatively straightforward process
* Works on any kind of animation
* Can show user interactions (like a button being clicked)
* Easy to tweak individual frames

#### Cons

* Manual recording means you have to redo the whole process for any change
* Requires Photoshop license
* Requires comfort with Photoshop, especially for cropping or tweaking frames
* Rendering can be a drag with a long animation or a slow computer

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

As [described by Tom MacWright](https://github.com/tmcw/node-canvas-animation-example/), you can use the [canvas](https://www.npmjs.com/package/canvas) module to write JavaScript for an animation the same way you would for a browser and then run a Node script to spit out all the frames as images.

To compile the frames into a gif, you can either use command line tools or do it within your script using modules like [node-gif](https://github.com/pkrumins/node-gif) or [gifencoder](https://www.npmjs.com/package/gifencoder).

#### Pros

* All code, not manual - can make this part of an automated pipeline, or quickly get a new gif when you tweak something in your code
* Detailed control over size, start/end, and framerate

#### Cons

* All code, not manual - higher barrier to entry
* Only works with code that generates frames from scratch one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* Only works with a canvas-based animation. That means no styling with CSS, no SVG-specific features, etc. without extra stuff.
* No access to browser APIs or features that aren't supported by the `canvas` module (e.g. `Path2D`).
* Lots of image library dependencies
* Requires [Node.js](https://nodejs.org/en/) and some comfort with it
* Requires command line tools and some comfort with them

### Web workers + canvas

Demo: http://bl.ocks.org/veltman/03edaa335f93b5a9ee57

The basic idea here is to write in-browser code similar to the "Node + canvas" approach above, where you update a canvas element frame-by-frame.  You combine the frames into a gif in the background using [gif.js](https://jnordberg.github.io/gif.js/) web workers. This is relatively slow, but you get visual feedback and there are no dependencies besides the gif.js library.  You only need some JavaScript and a web browser.

#### Pros

* Code-based - easy to get a new gif when you tweak something in your code
* Quick visual feedback
* Detailed control over size, start/end, and framerate
* Can access browser APIs and non-canvas features. For example, [this demo](http://bl.ocks.org/veltman/b100d04bda697f95f246) creates a dummy SVG to calculate the length of a path before adding it to a canvas.
* No Node scripts or command line required
* I assume you could use this with WebGL to make a 3D gif? That would be pretty cool.

#### Cons

* You still need to execute the code in a browser and save the result manually; it's better for an internal tool than for any sort of automated pipeline
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* The animation itself ultimately has to be done with a `<canvas>` element; you can't really manipulate things as DOM elements or style them with CSS without some insane hacks
* Rendering takes a non-trivial amount of time, something like 5 or 10 seconds of render time per 1 second of animation
* Doesn't work in every browser

### Web workers + SVG

Demo: http://bl.ocks.org/veltman/1071413ad6b5b542a1a3

The basic idea here is similar to the "Web workers + canvas" approach above, but using an SVG instead.  With a little trickery involving a Blob and a dummy image element, you can render the contents of an SVG as an image and turn that into an animation frame.  Unlike the canvas approach, this gives you full access to SVG elements, attributes, and techniques.  The one catch is that you have to make sure any stylesheets that affect the SVG are copied into the SVG element itself.

#### Pros

* Code-based - easy to get a new gif when you tweak something in your code
* Detailed control over size, start/end, and framerate
* Can make full use of SVG goodness and style things with CSS
* No Node scripts or command line required

#### Cons

* You still need to execute the code in a browser and save the result manually; it's better for an internal tool than for any sort of automated pipeline.
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* Rendering is even slower than the `<canvas>` version
* No 3D :(
* Doesn't work in every browser

### PhantomJS

One of the big downsides to the all the frame-by-frame approaches above is that you have to structure your code in a particular way.  It has to explicitly set the current frame based on how far along it is, like:

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

    // Get a new frame every ___ milliseconds
    setTimeout(getFrame,duration/numFrames);

  }

});
```

And save that output as an mp4 using FFmpeg:

```
$ phantomjs render.js | ffmpeg -y -c:v png -f image2pipe -r 25 -t 2  -i - -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart movie.mp4
```

Then you've still got to convert your movie into a gif, but you're most of the way there.

The main problem with this approach in my experience is that the `page.render()` call is synchronous and takes enough time to complete that you can't actually sample the animation at a consistent interval.  Each frame ends up being recorded later than it's supposed to be, and the longer the animation is, the more out of sync the end results will be.

As a compromise, you could instead use PhantomJS to step through the frames by calling a stepper function repeatedly and rendering that way, but then we're basically back to where we were with the other approaches.

#### Pros

* Can use anything that works in a vanilla Webkit browser

#### Cons

* Syncing things between your browser code and your PhantomJS script is pretty annoying and is hard to do without lots of exposed global variables
* Timing is unreliable
* Still need several steps to actually end up with a gif
* PhantomJS, FFmpeg, gifsicle dependencies
* PhantomJS gets weird about certain things like webfonts sometimes
* Probably the slowest option
* Seems like a very convoluted hack!

### Web workers + PhantomJS

Demo: https://github.com/veltman/headless-gif

One slight variation on the above is using the technique from one of the web worker examples to generate your entire gif, but encoding the result as a Base64 string so that you can grab it with PhantomJS.  This is a nice compromise because you can create/debug your gifmaker in a browser and then use PhantomJS to crank out gifs server-side, potentially supplying custom options for each.

1. PhantomJS requests `gifmaker.html`.
2. `gifmaker.html` creates a gif with web workers. When it's done, it encodes the result as a Base64 string and saves it as  a global variable.
3. Meanwhile, PhantomJS is checking periodically to see whether the gif is done.  When it's done, it gets the content of that global variable.
4. Decode the Base64 string into the `.gif`.

#### Pros

* Can automate server-side gifs but still use a lot of browser-specific goodness

#### Cons

* PhantomJS dependency
* PhantomJS gets weird about certain things like webfonts sometimes
* Only works with code that generates frames one at a time, not something declarative like `$.animate`, `d3.transition`, or a CSS animation
* Still very convoluted (but in a good way maybe?)

### The next frontier: hacking d3 transitions

Demo: https://bl.ocks.org/veltman/23460413ea085c024bf8

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

Because these transitions are asynchronous and use `requestAnimationFrame`, they're hard to tap into, and they don't even step through the animation at totally predictable intervals.  If your browser got distracted by a bird, it might be a while before the next frame happens and the animation will be jumpy.  So we need a way to tell d3: "Here's the transition I want; now you know all the math to calculate any arbitrary point along the way; let me have the remote and press play/pause/stop/fast-forward and jump to arbitrary time t."

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

This seems mildly insane but I gave it a shot. `d3-record.js` in [this demo](https://bl.ocks.org/veltman/23460413ea085c024bf8) is a proof of concept that mostly works. It takes every element in a selection, and gets the easing function and list of tweens that d3 is storing internally. Then, when it's called, it loops through each element, and applies each tween with the appropriate adjusted time value.

TODO: write some sort of `d3-animator` module that has the same API as `d3.transition` but is for synchronous updates instead of a background transition.

#### Pros

* Can use pretty much anything that works in a browser
* Can use declarative syntax for your animations (i.e. a lot less math)
* Detailed control over size, start/end, and framerate

#### Cons

* Still doesn't work with things like d3 axes, which have specific behavior around transitions
* Seems like an even more convoluted hack!

### Automate QuickTime screen recording

Same as the "Quicktime + FFmpeg" or "Quicktime + Photoshop" approaches, but automate the actual screen recording.  Automatically get the screen x, y, width, and height of the `<body>` element in an open browser and capture a screen recording of it. You'd still need a way to specify the duration and start it at the right time. This could probably be done with AppleScript but I wouldn't wish that task on my worst enemy.

#### Pros

* Slightly more automated

#### Cons

* Completely insane

## Summary

If you just want a quick demo of your animated thing to post on Twitter, screen recording probably makes more sense and you should ignore all of this. But these techniques can be pretty useful in other situations.

If you want to automatically produce a bunch of animated gifs or videos on a server and your animation is pretty simple, "Node + canvas" is a good option. If your animation is complicated and needs browser stuff, but you still want an automated generator, "Web workers + PhantomJS" could suit you well.

If you want to produce on-demand gifs without any server-side code, the web workers techniques listed above all work pretty well.  They're not instantaneous and they're a bit clunky but on the other hand you can let users generate totally custom gifs and do all the work in their browsers.

Another nice thing about these techniques is that they can all be put towards videos, not just gifs.  Any mechanism that generates a stack of images, one frame at a time, can be put through `ffmpeg` or something similar to create a video instead, so you could potentially create nice data-driven animations in videos without mastering After Effects or whatever.

What did I miss? Do you know a better way? [Get in touch](https://twitter.com/veltman)!

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
