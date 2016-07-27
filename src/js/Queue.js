/**
 * @fileOverview This file contains a `queue` Data Structure implementation for chaining promises.
 * @see http://www.dustindiaz.com/async-method-queues
 * @see http://www.mattgreer.org/articles/promises-in-wicked-detail/
 * @name Queue.js<js>
 * @author Cameron Pittman
 * @license GPLv3
 */

/**
 * Queue Data Structure implementation to chain promises.
 */
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

// Queue.js<js> ends here
