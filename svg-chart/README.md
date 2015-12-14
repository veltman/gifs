Testing in-browser gif generation from an SVG with [gif.js](https://github.com/jnordberg/gif.js/).  Chrome and Firefox only, though it seems like it oughta work in Safari?

Process:

1. Create a standard SVG line chart.
2. Step through in-between frames of the line chart: for each one, update the SVG, render to an image, add the image element to a stack of gif frames.
3. Render frames together in the background using gif.js web workers.
4. When rendering's complete, add the blob URL as an image and start the SVG on an infinite loop with `d3.timer` (gratuitous).

See also: [Gif Globe](http://bl.ocks.org/veltman/03edaa335f93b5a9ee57), [Gif New Jersey](http://bl.ocks.org/veltman/b100d04bda697f95f246)
