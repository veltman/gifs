Testing in-browser gif generation straight off an SVG with [gif.js](https://github.com/jnordberg/gif.js/).  Works in recent Chrome/Safari/Firefox.

Runs quite a bit more slowly than the [canvas version](http://bl.ocks.org/veltman/03edaa335f93b5a9ee57).

Process:

1. Create a standard SVG line chart.
2. Step through in-between frames of the line chart: for each one, update the SVG, render to an image, add the image element to a stack of gif frames.
3. Render frames together in the background using gif.js web workers.
4. When rendering's complete, add the blob URL as an image and start the SVG on an infinite loop to match (gratuitous).

See also: [Gif SVG chart](http://bl.ocks.org/veltman/1071413ad6b5b542a1a3), [Gif New Jersey](http://bl.ocks.org/veltman/b100d04bda697f95f246)
