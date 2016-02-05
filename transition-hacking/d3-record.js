d3.selection.prototype.record = function(realtime) {

  var self = this,
      tweeners = [];

  // Get tweeners on each element in the selection
  self.each(function(d,i){

    // using .count should work as long as it's called right after the transition is created?
    // can use .active if you wait for the "start" event
    var node = this,
        pending = getTransitions.call(this);

    pending.forEach(function(transition){

      // Probably unnecessary?
      var ease = transition.ease || id;

      transition.tween.values().forEach(function(tween){
        // Create a tweener with the tween function and the element's datum and index
        // Tweens with no change return false
        var tweener = (tween.call(node,d,i) || noop).bind(node);

        // Function that calls the tweener with an eased time value
        tweeners.push(function(t){

          if (realtime) {
              t = relativeTime(t,transition.duration,transition.delay);
          }

          tweener(ease(t));

        });

      });

    });

  });

  // Return a function that takes relative time between 0 and 1,
  // or an absolute number of ms
  return function(t){

    // Interrupt any active transitions on the selection
    // Cancel any scheduled transitions
    self.interrupt().transition();

    // Apply every tweener function with the provided value t
    // TODO: only call one tweener per attribute based on the time
    tweeners.forEach(function(tweener){
      tweener(t);
    });

  };

  function getTransitions(){
    return d3.entries(this.__transition__)
      .filter(function(tr){
        return tr.key !== "active" && tr.key !== "count";
      })
      .map(function(tr){
        return tr.value;
      });
  }

  function relativeTime(ms,duration,delay) {

    return Math.min(1,Math.max(0,(ms - delay)/duration));

  }

  function noop() {}
  function id(d) { return d; }

}
