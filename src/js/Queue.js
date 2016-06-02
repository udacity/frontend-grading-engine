// Inspired by http://www.dustindiaz.com/async-method-queues
// also helpful http://www.mattgreer.org/articles/promises-in-wicked-detail/

function Queue() {
  this._methods = [];
  this._flushing = false;
  this._blocked = false;
}

Queue.prototype = {
  add: function(fn) {
    this._methods.push(fn);
    if (!this._flushing && !this._blocked) {
      this.step();
    }
  },

  clear: function() {
    this._flushing = false;
    this._methods = [];
  },

  step: function() {
    var self = this;

    if (!this._flushing) {
      this._flushing = true;
    }

    function executeInPromise(fn) {
      return new Promise(function (resolve, reject) {
        if (fn) {
          try {
            var ret = fn();
          } catch (e) {
            self.block();
          }
        }
        resolve(ret);
      });
    }
    if (!this._blocked) {
      executeInPromise(this._methods.shift()).then(function(resolve) {
        if (self._methods.length > 0) {
          self.step();
        }
      });
    }
  },

  block: function() {
    this._blocked = true;
  },

  unblock: function() {
    this._blocked = false;
    this.step();
  }
};
