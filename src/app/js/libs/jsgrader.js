/**
 * @fileOverview This file contains the JSGrader library to test the JavaScript context.
 * @name jsgrader.js<libs>
 * @author Cameron Pittman
 * @license GPLv3
 */
var Grader = (function() {

  // http://stackoverflow.com/questions/1068834/object-comparison-in-javascript?lq=1
  function deepCompare () {
    var i, l, leftChain, rightChain;

    function compare2Objects (x, y) {
      var p;

      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
      }

      // Compare primitives and functions.
      // Check if both arguments link to the same object.
      // Especially useful on step when comparing prototypes
      if (x === y) {
        return true;
      }

      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
          return x.toString() === y.toString();
      }

      // At last checking prototypes as good a we can
      if (!(x instanceof Object && y instanceof Object)) {
        return false;
      }

      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
      }

      if (x.constructor !== y.constructor) {
        return false;
      }

      if (x.prototype !== y.prototype) {
        return false;
      }

      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
      }

      // Quick checking of one object beeing a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
          return false;
        }
      }

      for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
          return false;
        }

        switch (typeof (x[p])) {
          case 'object':
          case 'function':
            leftChain.push(x);
            rightChain.push(y);

            if (!compare2Objects (x[p], y[p])) {
              return false;
            }

            leftChain.pop();
            rightChain.pop();
            break;

          default:
            if (x[p] !== y[p]) {
              return false;
            }
            break;
        }
      }

      return true;
    }

    if (arguments.length < 1) {
      return true; //Die silently? Don’t know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
        return false;
      }
    }
    return true;
  }

  function Queue (grader) {
    this.grader = grader;
    this.gradingSteps = [];
    this.flushing = false;
    this.alwaysGo = false;
  };

  Queue.prototype = {
    add: function(callback, messages, keepGoing) {
      if (keepGoing !== false) {
        keepGoing = true;
      }

      if (!callback) {
        throw new Error("Every test added to the queue must have a valid function.");
      }

      this.gradingSteps.push({
        callback: callback,
        isCorrect: false,
        wrongMessage: messages.wrongMessage || null,
        comment: messages.comment || null,
        category: messages.category || null,
        keepGoing: keepGoing
      });
    },

    _flush: function () {
      if (!this.flushing) {
        this.flushing = true;
      }
      this.step();
    },

    clear: function () {
      this.flushing = false;
      this.gradingSteps = [];
      this.grader.endTests();
    },

    step: function () {
      var self = this;
      if (this.gradingSteps.length === 0) {
        this.clear();
      }

      function executeInPromise (fn) {
        return new Promise(function (resolve, reject) {
          if (fn) {
            try {
              var result = fn();
            } catch (e) {
              self.clear();
              console.log(e);
            }
          }
          resolve(result);
        });
      };

      function takeNextStep (test, result) {
        test.isCorrect = result;

        self.registerResults(test);

        if (test.isCorrect || test.keepGoing || self.alwaysGo) {
          self.step();
        } else {
          self.clear();
        }
      };

      if (this.flushing) {
        var test = this.gradingSteps.shift();

        if (this.grader.async) {
          executeInPromise(test.callback).then(function (resolve) {
            takeNextStep(test, resolve);
          });
        } else if (!this.grader.async) {
          try {
            var result = test.callback();
          } catch (e) {
            console.log(e);
            throw new Error();
          }
          takeNextStep(test, result);
        }

      }
    },

    registerResults: function (test) {
      this.grader.registerResults(test);
    }
  };

  function Grader (type, categoryMessages) {
    var self = this;
    this.specificFeedback = [];
    this.comments = [];
    this.isCorrect = false;
    this.correctHasChanged = false;
    this.queue = new Queue(self);
    this.async = false;
    this.categoryMessages = null;
    this.generalFeedback = [];
    this.onresult = function () {};

    for (n in arguments) {
      switch (typeof arguments[n]) {
        case 'string':
          if (arguments[n] === 'async') {
            this.async = true;
          } else if (arguments[n] === 'sync') {
            this.async = false;
          } else {
            throw new Error("Invalid type argument in Grader constructor");
          }
          break;
        case 'object':
          this.categoryMessages = arguments[n];
          break;
        default:
          throw new TypeError("Invalid argument in Grader constructor");
          break;
      }
    }
  };

  Grader.prototype = {
    addTest: function (callback, messages, keepGoing) {
      this.queue.add(callback, messages, keepGoing);
    },

    runTests: function (options) {
      if (options) {
        this.queue.alwaysGo = options.ignoreCheckpoints || false;
      }
      this.queue._flush();
    },

    endTests: function () {
      if (this.queue.flushing) {
        this.queue.clear();
      } else {
        var results = this.gatherResults();
        this.onresult(results);
      }
    },

    registerResults: function (test) {
      this.generateSpecificFeedback(test);
      this.generateGeneralFeedback(test);
      this.setCorrect(test);
    },

    generateSpecificFeedback: function (test) {
      if (!test.isCorrect && test.wrongMessage) {
        this.addSpecificFeedback(test.wrongMessage);
      } else if (test.isCorrect && test.comment) {
        this.addComment(test.comment);
      }
    },

    generateGeneralFeedback: function (test) {
      if (!test.isCorrect && test.category) {
        if (this.generalFeedback.indexOf(this.categoryMessages[test.category]) === -1) {
          this.generalFeedback.push(this.categoryMessages[test.category]);
        }
      }
    },

    setCorrect: function (test) {
      if (this.correctHasChanged) {
        this.isCorrect = this.isCorrect && test.isCorrect;
      } else {
        this.correctHasChanged = true;
        this.isCorrect = test.isCorrect;
      }
    },

    addSpecificFeedback: function (feedback) {
      this.specificFeedback.push(feedback);
    },

    addComment: function (feedback) {
      this.comments.push(feedback);
    },

    gatherResults: function () {
      var self = this;
      return {
        isCorrect: self.isCorrect,
        testFeedback: self.specificFeedback.concat(self.generalFeedback),
        testComments: self.comments
      };
    },

    getFormattedWrongMessages: function (separator) {
      var allMessages, message;

      allMessages = this.specificFeedback.concat(this.generalFeedback);
      message = allMessages.join(separator);

      return message;
    },

    getFormattedComments: function (separator) {
      return this.comments.join(separator);
    },

    isType: function (value, expectedType) {
      var isCorrect = false;

      if (typeof value !== expectedType) {

        if (typeof value === 'function') {
          value = value.name;
        };

        isCorrect = false;
      } else if (typeof value === expectedType){
        isCorrect = true;
      }
      return isCorrect;
    },

    isInstance: function (value, expectedInstance) {
      var isCorrect = false;

      if (value instanceof expectedInstance !== true) {

        isCorrect = false;
      } else if (value instanceof expectedInstance === true){
        isCorrect = true;
      }
      return isCorrect;
    },

    isValue: function (value1, value2) {
      var isCorrect = false;

      if (!deepCompare(value1, value2)) {
        isCorrect = false;
      } else if (deepCompare(value1, value2)) {
        isCorrect = true;
      }
      return isCorrect;
    },

    isInRange: function (value, lower, upper) {
      var isCorrect = false;

      if (typeof value !== 'number' || isNaN(value)) {
        isCorrect = false;
      } else if (value > upper || value < lower) {
        isCorrect = false;

      } else if (value < upper || value > lower) {
        isCorrect = true;
      }
      return isCorrect;
    },

    isSet: function (value) {
      var isCorrect = false;

      if (value === undefined) {
        isCorrect = false;

      } else {
        isCorrect = true;
      }
      return isCorrect;
    },

    isjQuery: function (elem) {
      // could use obj.jquery, which will only return true if it is a jquery object
      var isjQ = false;
      if (elem instanceof $) {
        isjQ = true;
      }
      return isjQ;
    },

    hasCorrectTag: function (elem, tag) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var hasTag = false;
      if (elem.is(tag)) {
        hasTag = true;
      }
      return hasTag;
    },

    hasCorrectClass: function (elem, className) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var hasClass = false;
      if (elem.hasClass(className)) {
        hasClass = true;
      }
      return hasClass;
    },

    hasCorrectId: function (elem, id) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      if (elem.is('#' + id)) return true;
      return false;
    },

    hasCorrectText: function (elem, text) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var hasText = false;
      var re = new RegExp(text);
      if (elem.text().match(re)) {
        hasText = true;
      }
      return hasText;
    },

    hasAttr: function (elem, attrName, correctAttr) {
      var isCorrect = false;
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      if (correctAttr && elem.attr(attrName) === correctAttr) {
        isCorrect = true;
      } else if (!correctAttr && elem.attr(attrName)) {
        isCorrect = true;
      }
      return isCorrect;
    },

    hasCorrectLength: function (elems, _length) {
      if (!this.isjQuery(elems)) {
        elems = $(elems);
      }
      var correctLength = false;
      var cLength = elems.length;
      if (cLength === _length) {
        correctLength = true;
      }
      return correctLength;
    },

    isCorrectElem: function (elem, correctElem) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var is = false;
      if (elem.is(correctElem)) {
        is = true;
      }
      return is;
    },

    isCorrectCollection: function (collection, correctCollection) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var is = false;
      if (collection.is(correctCollection)) {
        is = true;
      }
      return is;
    },

    hasCorrectStyle: function (elem, cssProperty, _correctStyle) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var hasCorrectStyle = false;
      var currentStyle = elem.css(cssProperty);
      if (currentStyle  === _correctStyle) {
        hasCorrectStyle = true;
      }
      return hasCorrectStyle;
    },

    doesExistInParent: function (elem, parentElem) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      if (!this.isjQuery(parentElem)) {
        parentElem = $(parentElem);
      }
      var inParent = false;
      if (parentElem.find(elem).length > 0) {
        inParent = true;
      }
      return inParent;
    },

    elemDoesExist: function (elem) {
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      var exists = false;
      if (elem.length > 0) {
        exists = true;
      }
      return exists;
    },

    areSiblings: function (elem1, elem2) {
      if (!this.isjQuery(elem1)) {
        elem1 = $(elem1);
      }
      if (!this.isjQuery(elem2)) {
        elem2 = $(elem2);
      }
      var siblingLove = false;
      if (elem1.siblings(elem2).length > 0) {
        siblingLove = true;
      }
      return siblingLove;
    },

    isImmediateChild: function (elem, parentElem) {
      var isCorrect = false;
      if (this.isjQuery(elem)) {
        throw new Error("elem needs to be a string for Grader.isImmediateChild()");
      }
      if (!this.isjQuery(parentElem)) {
        parentElem = $(parentElem);
      }
      if (parentElem.children(elem).length > 0) {
        isCorrect = true;
      }
      return isCorrect;
    },

    hasParent: function (elem, parentElem) {
      var isCorrect = false;
      if (this.isjQuery(parentElem)) {
        throw new Error("parentElem needs to be a string for Grader.hasParent()");
      }
      if (!this.isjQuery(elem)) {
        elem = $(elem);
      }
      if (elem.closest(parentElem).length > 0) {
        isCorrect = true;
      }
      return isCorrect;
    },

    sendResultsToExecutor: function () {
      var output = {
        isCorrect: false,
        test_feedback: "",
        test_comments: "",
        congrats: ""
      };

      for (arg in arguments) {
        var thisIsCorrect = arguments[arg].isCorrect;
        var thisTestFeedback = arguments[arg].getFormattedWrongMessages();
        var thisTestComment = arguments[arg].getFormattedComments();
        if (typeof thisIsCorrect !== 'boolean') {
          thisIsCorrect = false;
        }

        switch (arg) {
          case '0':
            output.congrats = arguments[arg];
          case '1':
            output.isCorrect = thisIsCorrect;
            output.test_feedback = thisTestFeedback;
            output.test_comments = thisTestComment;
            break;
          default:
            output.isCorrect = thisIsCorrect && output.isCorrect;
            if (output.test_feedback !== "") {
              output.test_feedback = [output.test_feedback, thisTestFeedback].join('\n');
            } else {
              output.test_feedback = thisTestFeedback;
            }

            if (output.test_comments !== "") {
              output.test_comments = [output.test_comments, thisTestFeedback].join('\n');
            } else {
              output.test_comments = thisTestComment;
            }
            break;
        }
      }
      output = JSON.stringify(output);
      console.info("UDACITY_RESULT:" + output);
    }
  };
  return Grader;
})();

// jsgrader.js<libs> ends here
