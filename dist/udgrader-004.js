/***
 *    ______ _____   _____               _ _               _____            _            
 *    |  ___|  ___| |  __ \             | (_)             |  ___|          (_)           
 *    | |_  | |__   | |  \/_ __ __ _  __| |_ _ __   __ _  | |__ _ __   __ _ _ _ __   ___ 
 *    |  _| |  __|  | | __| '__/ _` |/ _` | | '_ \ / _` | |  __| '_ \ / _` | | '_ \ / _ \
 *    | |   | |___  | |_\ \ | | (_| | (_| | | | | | (_| | | |__| | | | (_| | | | | |  __/
 *    \_|   \____/   \____/_|  \__,_|\__,_|_|_| |_|\__, | \____/_| |_|\__, |_|_| |_|\___|
 *                                                  __/ |              __/ |             
 *                                                 |___/              |___/              
 */
/*                    Udacity's library for immediate front-end feedback.

                  Version:      0.4
                  Tech:         HTML Imports,
                                Custom Elements,
                                gulp
                  url:          http://github.com/udacity/frontend-grading-engine
                  author:       Cameron Pittman
                              
                              New for version 0.4!
                                * Now a Chrome Extension!
                                * Editable tests! (inluding totally rewritten view logic)
          
                              New for version 0.3!
                                * Better security!
                                * Better encapsulation!
                                * Chaining test methods

Lexicon:
  * Active Test:    A test running against the page. Some logic returns true/false.
                    There are many different kind of active tests.
                    
  * Test Suite:     A collection of active tests that displays a code when appropriate.

  * Widget:         A collection of Test Suites.
                    Lives as a shadow DOM that exists as a child on the body.

  * Engine:         The logic used to compare some active tests with the document.
*/

/**
 * Exposes GE (Grading Engine) interface
 * @return {Object} exports - the functions on the exports object
 */
;var GE = (function( window, undefined ){
  'use strict';
  var exports = {};
  var debugMode = false;

/***
 *     _   _      _                     
 *    | | | |    | |                    
 *    | |_| | ___| |_ __   ___ _ __ ___ 
 *    |  _  |/ _ \ | '_ \ / _ \ '__/ __|
 *    | | | |  __/ | |_) |  __/ |  \__ \
 *    \_| |_/\___|_| .__/ \___|_|  |___/
 *                 | |                  
 *                 |_|                  
 */
 /*
    Wonderful functions to make life easier.
 */

// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
function arrEquals(array1, array2) {
  if (!array1 || !array2)
    return false;
  if (array1.length != array2.length)
    return false;
  for (var i = 0, l=array1.length; i < l; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!array1[i].equals(array2[i]))
        return false;       
    } else if (array1[i] != array2[i]) { 
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;   
    }           
  }       
  return true;
}

/**
 * Creates an Array of DOM nodes that match the selector
 * @param  {string} CSS selector - selector to match against
 * @param  {DOM node} parent - parent for starting point
 * @return {array} Array of DOM nodes
 */
function getDomNodeArray(selector, parent) {
  parent = parent || document;
  var nodes = Array.prototype.slice.apply(parent.querySelectorAll(selector));
  if (debugMode) {
    nodes.forEach(function (elem) {
      elem.classList.add('GE-test');
    });
  }
  return nodes;
}

// modified from http://stackoverflow.com/questions/7960335/javascript-is-given-function-empty
Function.prototype.getBody = function() {
  // Get content between first { and last }
  var m = this.toString().match(/\{([\s\S]*)\}/m)[1];
  // strip whitespace http://stackoverflow.com/questions/14540094/javascript-regular-expression-for-removing-all-spaces-except-for-what-between-do
  m = m.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
    if ($1) {
        return $1.replace(/\s/g, '');
    } else {
        return $2; 
    } 
  });
  // Strip comments
  return m.replace(/^\s*\/\/.*$/mg,'');
};

// http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
// Use only if necessary...
function executeFunctionByName(functionName, context) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for(var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(this, args);
}
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

/***
 *      _______                   _   
 *     |__   __|                 | |  
 *        | | __ _ _ __ __ _  ___| |_ 
 *        | |/ _` | '__/ _` |/ _ \ __|
 *        | | (_| | | | (_| |  __/ |_ 
 *        |_|\__,_|_|  \__, |\___|\__|
 *                      __/ |         
 *                     |___/          
 
An instance of a Target represents a piece of information about the page.

Targets are:
  * nested into a tree-like structure called a bullseye
  * usually mapped 1:1 with DOM elements

The top-level target living directly on the TA will not map to any element. But it contains children which do map 1:1 with elements.
*/

/**
 * Target constructor sets the target defaults. It includes a unique id number for private tracking.
 */
function Target() {
  this.id = parseInt(Math.random() * 1000000);
  this.element = null;
  this.value = null;
  this.operation = null;
  this.children = [];
  this.index = null;
};

Object.defineProperties(Target.prototype, {
  hasChildren: {
    /**
     * Public method for determining if a Target has child Targets.
     * @return {Boolean} hasKids - true if there are chldren, false otherwise.
     */
    get: function() {
      var hasKids = false;
      if (this.children.length > 0) {
        hasKids = true;
      };
      return hasKids;
    }
  },
  hasValue: {
    /**
     * Public method for determining if a value exists on a Target.
     * @return {Boolean} somethingThere - true if a value exists, false otherwise.
     */
    get: function() {
      var somethingThere = false;
      if (this.value !== null && this.value !== undefined) {
        somethingThere = true;
      };
      return somethingThere;
    }
  },
  hasGrandkids: {
    /**
     * Public method for determining if a Target's children have children.
     * @return {Boolean} hasGrandKids - true if there are grandchildren, false otherwise.
     */
    get: function() {
      var gotGrandKids = false;
      gotGrandKids = this.children.some(function (kid) {
        return kid.hasChildren;
      });
      return gotGrandKids;
    }
  }
});

/***
 *       _____               _      ____              _    
 *      / ____|             | |    |  _ \            | |   
 *     | |  __ _ __ __ _  __| | ___| |_) | ___   ___ | | __
 *     | | |_ | '__/ _` |/ _` |/ _ \  _ < / _ \ / _ \| |/ /
 *     | |__| | | | (_| | (_| |  __/ |_) | (_) | (_) |   < 
 *      \_____|_|  \__,_|\__,_|\___|____/ \___/ \___/|_|\_\
 *                                                         
 *                                                         

The GradeBook maintains and reports on the state of a set of questions registered by the TA. The GradeBook reports out on the final state of each active_test.
*/

/**
 * The GradeBook constructor sets questions and passed to default values.
 */
function GradeBook () {
  this.questions = [];
  this.passed = false;
};

Object.defineProperties(GradeBook.prototype, {
  numberOfQuestions: {
    /**
     * Private use only. Find the number of questions.
     * @return {Number} number of questions
     */
    get: function () {
      return this.questions.length;
    }
  },
  numberCorrectQuestions: {
    /**
     * Private use only. Find the number of questions evaluated as correct.
     * @return {Number} numberCorrect - number of correct questions.
     */
    get: function () {
      var numberCorrect = 0;
      this.questions.forEach(function (question) {
        if (question.correct) {
          numberCorrect +=1;
        }
      })
      return numberCorrect;
    }
  },
  allCorrect: {
    /**
     * Private use only. Compares the total questions to total questions correct.
     * @return {Boolean} isAllGood - true if all are correct and false otherwise.
     */
    get: function () {
      var isAllGood = false;
      if (this.numberOfQuestions === this.numberCorrectQuestions && this.numberOfQuestions > 0) {
        isAllGood = true;
      }
      return isAllGood;
    }
  },
  numberWrongQuestions: {
    /**
     * Private use only. Find the number of wrong questions.
     * @return {Number} numberWrong - the number of wrong questions.
     */
    get: function () {
      var numberWrong = 0;
      numberWrong = numberOfQuestions - numberCorrectQuestions;
      return numberWrong;
    }
  },
  report: {
    /**
     * Private use only. Returns all questions and the overall correctness of the active_test. Note: this is the data returned to the active_test component.
     * @return {Object} - contains a boolean indicating whether the test passes and an array of all questions.
     */
    get: function () {
      return {
        isCorrect: this.passed,
        questions: this.questions
      };
    }
  }
});

/**
 * Takes in a set of values from the target. Adds to gradebook.
 * @param {object} target - only what the GradeBook needs to know about the Target
 */
GradeBook.prototype.recordQuestion = function (target) {
  target.correct = false;
  this.questions.push(target);
};

/**
 * Empties the questions array and ensures that the test hasn't passed prematurely. Called each time a new question is registered.
 */
GradeBook.prototype.reset = function () {
  this.questions = [];
  this.passed = false;
};

GradeBook.prototype.fireFinished = function () {

};

/**
 * Will iterate through all the questions and return if they meet grade criteria
 * @param  {Object} config - {string} config.strictness, {boolean} config.not, {function} config.callback
 * @return {Object} the report from the gradebook instance containing whether the test passed and all of the questions in consideration.
 */
GradeBook.prototype.grade = function (config) {
  var strictness, not, callback;
  strictness = config.strictness;
  not = config.not;
  callback = config.callback; // expect that the callback encapsulates any comparison values from us

  this.questions.forEach(function (question) {
    question.correct = callback(question);
    if (not) {
      question.correct = !question.correct;
    }
  });

  switch (strictness) {
    case 'someOf':
      if (this.numberCorrectQuestions < this.numberOfQuestions && this.numberCorrectQuestions > 0) {
        this.passed = true;
      };
      break;
    case 'onlyOneOf':
      if (this.numberCorrectQuestions === 1) {
        this.passed = true;
      };
      break;
    default:
      this.passed = this.allCorrect;
      break;
  };

  // one last check to make sure there actually were questions
  if (this.numberOfQuestions === 0 && not) {
    this.passed = !this.passed;
  };
  return this.report;
};

/***
 *      _______                   _____      _ _           _                 
 *     |__   __|/\               / ____|    | | |         | |                
 *        | |  /  \     ______  | |     ___ | | | ___  ___| |_ ___  _ __ ___ 
 *        | | / /\ \   |______| | |    / _ \| | |/ _ \/ __| __/ _ \| '__/ __|
 *        | |/ ____ \           | |___| (_) | | |  __/ (__| || (_) | |  \__ \
 *        |_/_/    \_\           \_____\___/|_|_|\___|\___|\__\___/|_|  |___/
 *                                                                           
 *                                                                                   

The Teaching Assistant (TA) is responsible for:
  * collecting data from the page and creating a tree of Targets (called a bullseye) representing the information
  * traverseing the bullseye and reporting relevant data from Targets and grading instructions into a GradeBook.
  * All collectors return the instance of the TA object for chaining.
  * Collectors register their operations with the GradeBook, which actually checks the results of the tests.
*/

/**
 * The TA constructor sets default values and instantiates a GradeBook.
 */
function TA() {
  this.target = null;
  this.gradebook = new GradeBook();
  this.operations = [];
  this.gradeOpposite = false;
  this.picky = false;
  this.queue = new Queue();
};

Object.defineProperties(TA.prototype, {
  childPosition: {
    /**
     * To find a child node's index in relation to its immediate siblings
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self._runAgainstBottomTargets(function (target) {
          var elem = target.element;
          var position = null;
          // TODO: correct for other non-normal DOM elems?
          var ignoreTheseNodes = 0;
          Array.prototype.slice.apply(target.element.parentNode.children).forEach(function(val, index, arr) {
            if (val.nodeName === '#text') {
              ignoreTheseNodes += 1;
            }
            if (val === elem) {
              position = index - ignoreTheseNodes;
            }
          });
          return position;
        });
      });

      return this;
    }
  },
  count: {
    /**
     * To count the number of children at the bottom level of the bullseye
     * @return {object} TA - the TA instance for chaining.
     */
    get: function() {
      var self = this;
      this.queue.add(function () {
        // doing more than accessing a property on existing target because counting can move up the bullseye to past Targets. Need to reset operations
        self._registerOperation('count');
        self._runAgainstNextToBottomTargets(function (target) {
          return target.children.length;
        });
      });
      return this;
    }
  },
  index: {
    /**
     * To find the index of a target from when it was created.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self._registerOperation('index');
        self._runAgainstBottomTargets(function (target) {
          return target.index;
        });
      });
      return this;
    }
  },
  innerHTML: {
    /**
     * To pull the innerHTML of a DOM node.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self._registerOperation('innerHTML');
        self._runAgainstBottomTargetElements(function (element) {
          return element.innerHTML;
        });
      });
      return this;
    }
  },
  not: {
    /**
     * Not a collector! Used by the GradeBook to negate the correctness of a test.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self.gradeOpposite = true;
      });
      return this;
    }
  },
  numberOfTargets: {
    /**
     * Not a collector! Private use only. Find the total number of targets in the bullseye.
     * @return {integer} - the number of targets
     */
    get: function () {
      return this._targetIds.length;
    }
  },
  onlyOneOf: {
    /**
     * Not a collector! Used by the GradeBook to set a threshold for number of questions to pass in order to count the whole test as correct.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self.picky = 'onlyOneOf';
      });
      return this;
    }
  },
  someOf: {
    /**
     * Not a collector! Used by the GradeBook to set a threshold for number of questions to pass in order to count the whole test as correct.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self.picky = 'someOf';
      });
      return this;
    }
  },
  _targetIds: {
    /**
     * Not a collector! Private use only. Get an array of all target ids.
     * @return {array} ids of all targets in the bullseye.
     */
    get: function () {
      var ids = [];
      this._traverseTargets(function (target) {
        ids.push(target.id);
      });
      return ids;
    }
  },
  UAString: {
    /**
     * Get the User-Agent string of the browser.
     * @return {object} TA - the TA instance for chaining.
     */
    get: function () {
      var self = this;
      this.queue.add(function () {
        self.operations = navigator.userAgent;
        self.documentValueSpecified = navigator.userAgent;
      });
      return this;
    }
  }
})

/**
 * Initialized for async call later.
 */
TA.prototype.onresult = function (testResult) {};

/**
 * Let the TA know this just happened and refresh the questions in the GradeBook.
 * @param {string} operation - the thing that just happened
 */
TA.prototype._registerOperation = function (operation) {
  this.operations.push(operation);
  this.gradebook.reset();
};

/**
 * Private method to traverse all targets in the bullseye.
 * @param  {Function} callback - method to call against each target
 */
TA.prototype._traverseTargets = function (callback) {
  // http://www.timlabonne.com/2013/07/tree-traversals-with-javascript/

  /**
   * Recursively dive into a tree structure from the top. Used on the Target structure here.
   * @param  {object} node - a target of bullseye. Start with the top.
   * @param  {function} func - function to run against each node
   */
  function visitDfs (node, func) {
    if (func) {
      func(node);
    }
 
    node.children.forEach(function (child, index, arr) {
      visitDfs(child, func);
    });
  };
  visitDfs(this.target, callback);
};

/**
 * Private use only! Run a function against the top-level Target in the bullseye
 * @param  {function} callback - the function to run against specified Targets
 */
TA.prototype._runAgainstTopTargetOnly = function (callback) {
  var self = this;
  this.target.value = callback(this.target);

  if (this.target.value) {
    self.gradebook.recordQuestion(this.target);
  } else {
    this.target.children.forEach(function (kid) {
      self.gradebook.recordQuestion(kid);
    })
  }
};

/**
 * Private use only! Run a function against bottom targets in the bullseye
 * @param  {function} callback - the function to run against specified Targets
 */
TA.prototype._runAgainstBottomTargets = function (callback) {
  var self = this;

  var allTargets = this._targetIds;

  this._traverseTargets(function (target) {
    if (!target.hasChildren && allTargets.indexOf(target.id) > -1) {
      target.value = callback(target);
      
      if (target.value) {
        self.gradebook.recordQuestion(target);
      } else {
        target.children.forEach(function (kid) {
          self.gradebook.recordQuestion(kid);
        })
      }
    };
  });
};

/**
 * Private use only! Run a function against the elements of the bottom targets in the bullseye
 * @param  {function} callback - the function to run against specified elements
 */
TA.prototype._runAgainstBottomTargetElements = function (callback) {
  var self = this;

  var allTargets = this._targetIds;

  this._traverseTargets(function (target) {
    if (!target.hasChildren && allTargets.indexOf(target.id) > -1) {
      target.value = callback(target.element);
      
      if (target.value) {
        self.gradebook.recordQuestion(target);
      } else {
        target.children.forEach(function (kid) {
          self.gradebook.recordQuestion(kid);
        })
      }
    };
  })
};

/**
 * Private use only! Run a function against the next to bottom targets in the bullseye
 * @param  {function} callback - the function to run against specified elements
 */
TA.prototype._runAgainstNextToBottomTargets = function (callback) {
  var self = this;

  this._traverseTargets(function (target) {
    if (target.hasChildren && !target.hasGrandkids) {
      target.value = callback(target);
      
      if (target.value) {
        self.gradebook.recordQuestion(target);
      } else {
        target.children.forEach(function (kid) {
          self.gradebook.recordQuestion(kid);
        })
      }
    };
  });
};

/**
 * Generates the top-level target. Matched elements end up as children targets. It will not have a element.
 * @param  {string} CSS selector - the selector of the elements you want to query
 * @return {object} TA - the TA instance for chaining.
 */
TA.prototype.theseElements = function (selector) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('gatherElements');

    self.target = new Target();

    self._runAgainstTopTargetOnly(function (topTarget) {
      getDomNodeArray(selector).forEach(function (elem, index, arr) {
        var target = new Target();
        target.element = elem;
        target.index = index;
        topTarget.children.push(target);
      });
    });
  });
  return this;
}
// for legacy quizzes
TA.prototype.theseNodes = TA.prototype.theseElements;

/**
 * Will run a query against the lowest level targets in the Target tree. Note it will traverse all the way down the DOM.
 * @param  {string} CSS selector - the selector of the children you want to query
 * @return {object} TA - the TA instance for chaining.
 */
TA.prototype.deepChildren = function (selector) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('gatherDeepChildElements');

    self._runAgainstBottomTargets(function (target) {
      getDomNodeArray(selector, target.element).forEach(function (newElem, index) {
        var childTarget = new Target();
        childTarget.element = newElem;
        childTarget.index = index;
        target.children.push(childTarget);
      });
    });
  });

  return this;
};
// for alternate syntax options
TA.prototype.children = TA.prototype.deepChildren;

// TODO: broken :(
TA.prototype.shallowChildren = function (selector) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('gatherShallowChildElements');

    self._runAgainstBottomTargets(function (target) {
      getDomNodeArray(selector, target.element).forEach(function (newElem, index) {
        var childTarget = new Target();
        childTarget.element = newElem;
        childTarget.index = index;
        target.children.push(childTarget);
      });
    });

  });
  return this;
};

/**
 * Get any CSS style of any element.
 * @param  {string} property - the CSS property to examine. Should be camelCased.
 * @return {object} TA - the TA instance for chaining.
 */
TA.prototype.cssProperty = function (property) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('cssProperty');

    self._runAgainstBottomTargetElements(function (elem) {
      var styles = getComputedStyle(elem);
      // TODO: this is causing a FSL that could affect framerate
      return styles[property];
    });
  });
  return this;
}

/**
 * Get any attribute of any element.
 * @param  {string} attribute - the attribute under examination.
 * @return {object} TA - the TA instance for chaining.
 */
TA.prototype.attribute = function (attribute) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('attribute')

    self._runAgainstBottomTargetElements(function (elem) {
      var attrValue = elem.getAttribute(attribute);
      if (attrValue === '') {
        attrValue = true;
      }
      return attrValue;
    });
  });
  return this;
}

/**
 * Get the position of one side of an element relative to the viewport
 * @param  {string} side - the side of the element in question
 * @return {object} TA - the TA instance for chaining.
 */
TA.prototype.absolutePosition = function (side) {
  var self = this;
  this.queue.add(function () {
    self._registerOperation('absolutePosition');
    // http://stackoverflow.com/questions/2880957/detect-inline-block-type-of-a-dom-element
    function getDisplayType (element) {
      var cStyle = element.currentStyle || window.getComputedStyle(element, ""); 
      return cStyle.display;
    };

    var selectorFunc = function () {};
    switch (side) {
      case 'top':
        var selectorFunc = function (elem) {
          var displayType = getDisplayType(elem);
          var value = NaN;
          if (displayType === 'block') {
            value = elem.offsetTop;
          } else if (displayType === 'inline') {
            value = elem.getBoundingClientRect()[side];
          };
          return value;
        };
        break;
      case 'left':
        var selectorFunc = function (elem) {
          var displayType = getDisplayType(elem);
          var value = NaN;
          if (displayType === 'block') {
            value = elem.offsetLeft;
          } else if (displayType === 'inline') {
            value = elem.getBoundingClientRect()[side];
          };
          return value;
        };
        break;
      case 'bottom':
        var selectorFunc = function (elem) {
          var displayType = getDisplayType(elem);
          var value = NaN;
          if (displayType === 'block') {
            value = elem.offsetTop + elem.offsetHeight;
          } else if (displayType === 'inline') {
            value = elem.getBoundingClientRect()[side];
          };
          if (value === Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) {
            value = 'max';
          };
          return value;
        };
        break;
      case 'right':
        var selectorFunc = function (elem) {
          var displayType = getDisplayType(elem);
          var value = NaN;
          if (displayType === 'block') {
            value = elem.offsetLeft + elem.offsetWidth;
          } else if (displayType === 'inline') {
            value = elem.getBoundingClientRect()[side];
          };
          if (value === Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) {
            value = 'max';
          };
          return value;
        };
        break;
      default:
        selectorFunc = function () {
          console.log("You didn't pick a side for absolutePosition! Options are 'top', 'left', 'bottom' and 'right'.");
          return NaN;
        };
        break;
    };

    self._runAgainstBottomTargetElements(function (elem) {
      return selectorFunc(elem);
    });
  });
  return this;
};

/***
 *      _______                  _____                       _                
 *     |__   __|/\              |  __ \                     | |               
 *        | |  /  \     ______  | |__) |___ _ __   ___  _ __| |_ ___ _ __ ___ 
 *        | | / /\ \   |______| |  _  // _ \ '_ \ / _ \| '__| __/ _ \ '__/ __|
 *        | |/ ____ \           | | \ \  __/ |_) | (_) | |  | ||  __/ |  \__ \
 *        |_/_/    \_\          |_|  \_\___| .__/ \___/|_|   \__\___|_|  |___/
 *                                         | |                                
 *                                         |_|                                
 
Reporters live on the TA and are responsible for:
  * giving the GradeBook instructions for evaluating the questions it has collected.
  * instantiating the grading process by calling gradebook.grade()

 */

Object.defineProperties(TA.prototype, {
  toExist: {
    /**
     * Checks that either values or elements exist on questions in GradeBook.
     * @return {object} result - the GradeBook's list of questions and overall correctness.
     */
    get: function() {
      var self = this;
      this.queue.add(function () {
        var typeOfOperation = self.operations[self.operations.length - 1];

        var doesExistFunc = function () {};
        switch (typeOfOperation) {
          case 'gatherElements':
            doesExistFunc = function (topTarget) {
              console.log('hi')
              return topTarget.children.length > 0;
            };
            break;
          case 'gatherDeepChildElements':
            doesExistFunc = function (target) {
              var hasElement = false;
              if (target.element) {
                hasElement = true;
              }
              return hasElement;
            };
            break;
          default:
            doesExistFunc = function (target) {
              var doesExist = false;
              if (target.value || target.element) {
                doesExist = true;
              }
              return doesExist
            }
            break;
        }

        var testResult = self.gradebook.grade({
          callback: doesExistFunc,
          not: self.gradeOpposite,
          strictness: self.picky
        });
        self.onresult(testResult);
      });
    }
  },
  value: {
    /**
     * Use for debug purposes only. Returns the first value found on the bullseye.
     * @return {*} value - the value retrieved.
     */
    // TODO: see if this is broken now that async tests run
    get: function () {
      // TA returns a single value from the first Target hit with a value. Used to create vars in active_tests.
      var value = null;
      this._runAgainstBottomTargets(function (target) {
        if (target.value) {
          value = target.value
        };
        return target.value;
      });
      return value;
    }
  },
  values: {
    /**
     * Use for debug purposes only. Returns all values found on the bullseye.
     * @return {[]} values - all the values retrieved.
     */
    // TODO: see if this is broken now that async tests run
    get: function () {
      var self = this;
      this.queue.add(function () {
        // TA returns a flat array of values. Used to create vars in active_tests.
        var values = [];
        self._runAgainstBottomTargets(function (target) {
          if (target.value) {
            values.push(target.value);
          };
          return target.value;
        });
        return values;
      });
    }
  }
})

/**
 * Check that question values match an expected value.
 * @param  {*} expected - any value to match against, but typically a string or int.
 * @param  {boolean} noStrict - check will run as === unless noStrict is true.
 */
TA.prototype.toEqual = function (expected, noStrict) {
  var self = this;
  this.queue.add(function () {
    noStrict = noStrict || false;
    
    var equalityFunc = function() {};
    switch (noStrict) {
      case true:
        equalityFunc = function (target) {
          return target.value == expected;
        };
        break;
      case false:
        equalityFunc = function (target) {
          return target.value === expected;
        };
        break;
      default:
        equalityFunc = function (target) {
          return target.value === expected;
        };
        break;
    }

    var testResult = self.gradebook.grade({
      callback: equalityFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

/**
 * Check that the target value is greater than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as >= instead of >
 */
TA.prototype.toBeGreaterThan = function (expected, orEqualTo) {
  var self = this;
  this.queue.add(function () {
    orEqualTo = orEqualTo || false;

    var greaterThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        greaterThanFunc = function (target) {
          var isGreaterThan = false;
          if (target.value >= expected) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
      case false:
        greaterThanFunc = function (target) {
          var isGreaterThan = false;
          if (target.value > expected) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
      default:
        greaterThanFunc = function (target) {
          var isGreaterThan = false;
          if (target.value > expected) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
    }

    var testResult = self.gradebook.grade({
      callback: greaterThanFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

/**
 * Check that the target value is less than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as <= instead of <
 */
TA.prototype.toBeLessThan = function(expected, orEqualTo) {
  var self = this;
  this.queue.add(function () {
    orEqualTo = orEqualTo || false;

    var lessThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        lessThanFunc = function (target) {
          var isLessThan = false;
          if (target.value <= expected) {
            isLessThan = true;
          }
          return isLessThan;
        }
      case false:
        lessThanFunc = function (target) {
          var isLessThan = false;
          if (target.value < expected) {
            isLessThan = true;
          }
          return isLessThan;
        }
      default:
        lessThanFunc = function (target) {
          var isLessThan = false;
          if (target.value < expected) {
            isLessThan = true;
          }
          return isLessThan;
        }
    }

    var testResult = self.gradebook.grade({
      callback: lessThanFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the target value is between upper and lower.
 * @param  {Number} lower - the lower bounds of the comparison
 * @param  {Number} upper - the upper bounds of the comparison
 * @param  {Boolean} lowerInclusive - if true, run lower check as >= instead of >
 * @param  {Boolean} upperInclusive - if true, run upper check as <= instead of <
 */
TA.prototype.toBeInRange = function(lower, upper, lowerInclusive, upperInclusive) {
  var self = this;
  this.queue.add(function () {
    lowerInclusive = lowerInclusive || true;
    upperInclusive = upperInclusive || true;

    // just in case someone screws up the order
    if (lower > upper) {
      var temp = lower;
      lower = upper;
      upper = temp;
    };

    var xIsLessThan = function () {};
    switch (upperInclusive) {
      case true:
        xIsLessThan = function (target) {
          var isInRange = false;
          if (target.value <= upper) {
            isInRange = true;
          }
          return isInRange;
        }
      case false:
        xIsLessThan = function (target) {
          var isInRange = false;
          if (target.value < upper) {
            isInRange = true;
          }
          return isInRange;
        }
      default:
        xIsLessThan = function (target) {
          var isInRange = false;
          if (target.value < upper) {
            isInRange = true;
          }
          return isInRange;
        }
    }

    var xIsGreaterThan = function () {};
    switch (lowerInclusive) {
      case true:
        xIsGreaterThan = function (target) {
          var isInRange = false;
          if (target.value >= lower) {
            isInRange = true;
          }
          return isInRange;
        }
      case false:
        xIsGreaterThan = function (target) {
          var isInRange = false;
          if (target.value > lower) {
            isInRange = true;
          }
          return isInRange;
        }
      default:
        xIsGreaterThan = function (target) {
          var isInRange = false;
          if (target.value > lower) {
            isInRange = true;
          }
          return isInRange;
        }
    }

    var inRangeFunc = function (target) {
      var isInRange = false;
      target.value = target.value.replace('px', '');
      target.value = target.value.replace('%', '');
      if (xIsLessThan(target) && xIsGreaterThan(target)) {
        isInRange = true;
      }
      return isInRange;
    }

    var testResult = self.gradebook.grade({
      callback: inRangeFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the value includes at least one of the given expected values.
 * @param  {Array} expectedValues - search for one of the values in the array
 * @param  {Object} config - includes: nValues, minValues, maxValues. Designate the number of values in expectedValues expected to be found in the target value. Defaults to at least one value needs to be found.
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toHaveSubstring = function (expectedValues, config) {
  var self = this;
  this.queue.add(function () {
    config = config || {};

    // make sure expectedValues are an array
    if (!(expectedValues instanceof Array)) {
      expectedValues = [expectedValues];
    };

    var nInstances   = config.nInstances || false,   // TODO: not being used (is there a good use case?)
        minInstances = config.minInstances || 1,     // TODO: not being used
        maxInstances = config.maxInstances || false, // TODO: not being used
        nValues      = config.nValues || false,
        minValues    = config.minValues || 1,
        maxValues    = config.maxValues || 'all';

    if (maxValues === 'all') {
      maxValues = expectedValues.length;
    };

    /**
     * Is there a substring in a string? This will answer that question.
     * @param  {object} target - the Target in question
     * @return {boolean} - whether or not expected substring is in target.value
     */
    var substringFunc = function (target) {
      var hasNumberOfValsExpected = false;
      var hits = 0;
      expectedValues.forEach(function(val, index, arr) {
        if (target.value.search(val) > -1) {
          hits+=1;
        };
      });

      if (nValues) {
        (hits === nValues) ? hasNumberOfValsExpected = true : hasNumberOfValsExpected = false;
      } else if (hits >= minValues && hits <= maxValues) {
        hasNumberOfValsExpected = true;
      };
      return hasNumberOfValsExpected;
    };

    var testResult = self.gradebook.grade({
      callback: substringFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

// get all the exposed methods so that the translator knows what's acceptable
var taAvailableMethods = Object.getOwnPropertyNames(TA.prototype).filter(function (key) {
  return key.indexOf('_') === -1 && key !== 'constructor';
});
function ActiveTest(rawTest) {
  var description = rawTest.description;
  var activeTest = rawTest.activeTest;
  var flags = rawTest.flags || {};
  var id = parseInt(Math.random() * 1000000);

  // this specific validation is probably less than useful...
  if (flags.alwaysRun === undefined) {
    flags.alwaysRun = false;
  }

  // TODO: move this out of here
  // validate the description.
  if (typeof description !== 'string') {
    throw new TypeError('Every suite needs a description string.');
  }

  // validate the activeTest
  if (typeof activeTest !== 'function') {
    throw new TypeError('Every suite needs an activeTest function.');
  }

  // validate the flags
  if (typeof flags !== 'object') {
    throw new TypeError('If assigned, flags must be an object.');
  }

  this.description = description;
  this.activeTest = activeTest;
  this.flags = flags;
  this.id = id;
  this.testPassed = false;
  this.optional = flags.optional;
  this.gradeRunner = function() {};

  this.iwant = new TA();
};

/**
 * Set off the fireworks! A test passed! Assumes you mean test passed unless didPass is false.
 * @param  {Boolean}  didPass unless didPass === false, method assumes it to be true.
 * @return {Boolean}         [description]
 */
ActiveTest.prototype.hasPassed = function (didPass) {
  var attribute = null;
  if (!didPass) {
    attribute = false;
  } else {
    attribute = true;
    this.testPassed = true;
    
    if (!this.flags.alwaysRun || this.flags.noRepeat) {
      this.stopTest();
    };
  }
  this.element.setAttribute('test-passed', attribute);
  this.suite.checkTests();
};


// TODO: move this to the sandbox
ActiveTest.prototype.runTest = function () {
  /*
  Run a synchronous activeTest every 1000 ms
  @param: none
  */
  var self = this;

  /*
  Optional flags specific to the test
  */
  var noRepeat = this.flags.noRepeat || false; // run only once on load
  var alwaysRun = this.flags.alwaysRun || false; // keep running even if test passes
  var optional = this.flags.optional || false; // test does not affect code display

  var testRunner = function () {
    // run the test
    var promise = new Promise(function (resolve, reject) {
      // resolve when the test finishes
      self.iwant.onresult = function (result) {
        resolve(result);
      };
      // clean out the queue from the last run
      self.iwant.queue.clear();

      self.activeTest(self.iwant);
    }).then(function (resolve) {
      var testCorrect = resolve.isCorrect || false;
      var testValues = '';
      resolve.questions.forEach(function (val) {
        testValues = testValues + ' ' + val.value;
      });

      self.hasPassed(testCorrect);
    });
  };

  // clearInterval(this.gradeRunner);
  this.gradeRunner = setInterval(testRunner, 1000);
};

ActiveTest.prototype.stopTest = function () {
  clearInterval(this.gradeRunner);
};

ActiveTest.prototype.update = function (config) {
  // TODO: need to convert config.activeTest into a function
  var description = config.description || false;
  var activeTest = config.activeTest || false;
  var flags = config.flags || false;

  if (description) {
    this.description = description;
    this.element.setAttribute('description', this.description);
  };
  if (activeTest) {
    this.activeTest = activeTest;
  };
  if (flags) {
    this.flags = flags;
  };

  this.runTest();
};
function Suite(rawSuite) {
  var name = rawSuite.name;
  var code = rawSuite.code;
  var activeTests = [];
  var id = parseInt(Math.random() * 1000000);

  // validate the name
  if (typeof name !== 'string') {
    throw new TypeError('Every suite needs a name string.');
  }

  // validate the code
  if (typeof code !== 'string') {
    throw new TypeError('Every suite needs a code string.');
  }

  this.name = name;
  this.code = code;
  this.activeTests = [];
  this.id = id;
  this.suitePassed = false; // put a setter on this to emit an event.
};

Object.defineProperties(Suite.prototype, {
  numberOfTests: {
    get: function () {
      return this.activeTests.length || 0;      
    }
  },
  numberOfCorrectTests: {
    get: function () {
      var numberCorrect = 0;
      this.activeTests.forEach(function (test) {
        if (test.testPassed) {
          numberCorrect += 1;
        }
      })
      return numberCorrect;
    }
  },
  numberOfCorrectOrOptionalTests: {
    get: function () {
      var numberCorrectOrOptional = 0;
      this.activeTests.forEach(function (test) {
        if (test.optional || test.testPassed) {
          numberCorrectOrOptional += 1;
        }
      })
      return numberCorrectOrOptional;
    }
  },
  numberOfOptionalTests: {
    get: function () {
      var numberOptional = 0;
      this.activeTests.forEach(function (test) {
        if (test.optional) {
          numberOptional += 1;
        }
      })
    }
  },
  allCorrect: {
    get: function () {
      var allGood = false;
      if (this.numberOfTests - this.numberOfCorrectOrOptionalTests <= 0) {
        allGood = true;
      }
      return allGood;
    }
  }
})

Suite.prototype.createTest = function (rawTest) {
  var test = new ActiveTest(rawTest);
  test.suite = this;

  function createTestElement(newTest) {
    var activeTestElement = document.createElement('active-test');
    
    // find the suite element to which the test belongs
    var activeTestsContainer = test.suite.element.shadowRoot.querySelector('.active-tests');
    // attributes get applied to the view
    activeTestElement.setAttribute('description', newTest.description);
    activeTestElement.setAttribute('test-passed', newTest.testPassed);
    // give the element access to the actual test
    // activeTestElement.activeTest = newTest.activeTest;
    
    // let the Test know which element belongs to it
    test.element = activeTestElement;
    
    activeTestsContainer.appendChild(activeTestElement);
    return activeTestElement;
  }

  test.element = createTestElement({
    description: test.description,
    passed: test.testPassed
    // activeTest: test.activeTest
  });
  // can't do this here because it needs to happen in the widget
  test.runTest();
  this.activeTests.push(test);
};

Suite.prototype.checkTests = function () {
  var passed = this.allCorrect;
  this.suitePassed = passed;
  this.element.suitePassed = passed;
  this.element.setAttribute('suite-passed', passed);
};

/***
*    ______           _     _                  
*    | ___ \         (_)   | |                 
*    | |_/ /___  __ _ _ ___| |_ _ __ __ _ _ __ 
*    |    // _ \/ _` | / __| __| '__/ _` | '__|
*    | |\ \  __/ (_| | \__ \ |_| | | (_| | |   
*    \_| \_\___|\__, |_|___/\__|_|  \__,_|_|   
*                __/ |                         
*               |___/                          
*/
/*
  Expose functions that create and monitor tests.
*/

/*
The hotel simply changes the attributes on each web component
 */
var hotel = {
  occupiedSuites: [],
  createSuite: function (rawSuite) {
    var suite = new Suite(rawSuite);

    // pass the whole suite to the testResults so you can modify it there later.
    suite.element = testResults.buildSuiteElement(suite);
    this.occupiedSuites.push(suite);
    return suite;
  }
};

Object.defineProperties(hotel, {
  numberOfPassedSuites: {
    get: function () {
      var numberPassed = 0;
      this.occupiedSuites.forEach(function (suite, index, arr) {
        if (suite.suitePassed) {
          numberPassed += 1;
        }
      })
      return numberPassed;
    }
  },
  numberOfSuites: {
    get: function () {
      return this.occupiedSuites.length;
    }
  },
  allCorrect: {
    get: function () {
      var allCorrect = false;
      (this.numberOfSuites === this.numberOfPassedSuites) ? allCorrect = true : allCorrect = false;
      // TODO: maybe emit an event if all of them pass?
      return allCorrect;
    }
  }
})

/**
 * Register a suite of tests with the grading engine.
 * @param  {Object} _suite - contains a test's name and code to display upon completion.
 * @return {Function} registerTest - a method to register a single test with the grading engine.
 */
function registerSuite(rawSuite) {
  var self = this;

  var newSuite = hotel.createSuite(rawSuite);

  /**
   * Register a new test on a specific suite. The test will contain an activeTest. Each active test much return a boolean called isCorrect and an array of the targets in question.
   * @param  {Object} _test - contains a description, activeTest and flags.
   * @return {Object} self - for chaining tests registrations together (if you're into that sort of syntax.)
   */
  function registerTest(_test) {
    newSuite.createTest({
      description: _test.description,
      activeTest: _test.active_test || _test.activeTest, // accounts for old API
      flags: _test.flags,
      iwant: new TA()
    })
    return self;
  }
  return {
    registerTest: registerTest
  }
}

function createWorkerPayload (type, data) {
  return {
    type: type,
    activeTest: data,
    methods: taAvailableMethods
  }
};

var sanitizer = new Worker('/frontend-grading-engine/src/js/sanitizerWorker.js');

// basically for use only when loading a new JSON with suites
function registerSuites(suitesJSON) {
  var suites = JSON.parse(suitesJSON);
  suites.forEach(function (suite, index, arr) {
    var newSuite = registerSuite({
      name: suite.name,
      code: suite.code
    });

    suite.tests.forEach(function (test) {
      var promise = new Promise(function (resolve, reject) {
        var payload = createWorkerPayload('activeTestString', test.activeTest || test.active_test);
        sanitizer.postMessage(payload);
        sanitizer.onmessage = function (e) {
          resolve(e.data.activeTest/*, suite*/); // TODO: might be able to do without suite here
        };
      }).then(function (resolve) {
        console.log(resolve);
        newSuite.registerTest({
          description: test.description,
          activeTest: resolve, // TODO: resolve should be the clean test component array?
          flags: test.flags
        });
      });
    });
  });
};

exports.registerSuite = registerSuite;
exports.registerSuites = registerSuites;

/***
 *     _____ _            _____          _   
 *    |_   _| |          |  ___|        | |  
 *      | | | |__   ___  | |__ _ __   __| |  
 *      | | | '_ \ / _ \ |  __| '_ \ / _` |  
 *      | | | | | |  __/ | |__| | | | (_| |_ 
 *      \_/ |_| |_|\___| \____/_| |_|\__,_(_)
 *                                           
 *                                           
 */
 /*
    Why an IIFE? All the encapsulated goodness.
 */
function debugMode() {
  debugMode = !debugMode;
};
exports.debugMode = debugMode;

// TODO
function pause() {
};
// exports.pause = pause;

return exports;
}( window ));