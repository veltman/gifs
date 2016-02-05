Similar to this [transition hacking example](http://bl.ocks.org/veltman/d1b8c76c16ceab5d3b45), this turns an asynchronous d3 transition into something that can be paused/fast-forwarded/rewound while still using the nice syntax, easing, interpolation, etc. of `d3.transition`.

This version respects chained transitions and delays by expecting an absolute time value in milliseconds rather than a relative time value between 0 and 1.

Caveat #1: This doesn't yet work if you have multiple transitions in a chain modifying the same property.

Caveat #2: this is probably a pretty bad idea! Maybe it can be done by tinkering directly with the internal timer instead?
