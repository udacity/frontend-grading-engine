// Inspired by http://www.dustindiaz.com/async-method-queues
// also helpful http://www.mattgreer.org/articles/promises-in-wicked-detail/

function Queue() {
  this._methods = [];
  this._flushing = false;
}

Queue.prototype = {
  add: function(fn) {
    this._methods.push(fn);
    if (!this._flushing) {
      this.step();
    }
  },

  clear: function() {
    this._flushing = false;
    this._methods = [];
  },

  step: function(resp) {
    var self = this;

    if (!this._flushing) {
      this._flushing = true;
    }
    
    function executeInPromise (fn) {
      return new Promise(function (resolve, reject) {
        if (fn) {
          var ret = fn();
        }
        resolve(ret);
      });
    }

    executeInPromise(this._methods.shift()).then(function (resolve) {
      if (self._methods.length > 0) {
        self.step();
      }
    })
  }
};