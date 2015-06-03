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

                  Version:      0.3
                  Tech:         HTML Imports,
                                Custom Elements,
                                grunt
                  url:          http://github.com/udacity/frontend-grading-engine
                  author:       Cameron Pittman

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

/*
    Exposes GE (Grading Engine) interface
    
    returns: exports
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

/***
 *     _                     _   _    _ _     _            _   
 *    | |                   | | | |  | (_)   | |          | |  
 *    | |     ___   __ _  __| | | |  | |_  __| | __ _  ___| |_ 
 *    | |    / _ \ / _` |/ _` | | |/\| | |/ _` |/ _` |/ _ \ __|
 *    | |___| (_) | (_| | (_| | \  /\  / | (_| | (_| |  __/ |_ 
 *    \_____/\___/ \__,_|\__,_|  \/  \/|_|\__,_|\__, |\___|\__|
 *                                               __/ |         
 *                                              |___/          
 */
 /*
    Load the HTML template describing the widget.
 */

  (function() {    
    document.body.addEventListener('grader-passed', function (e) {console.log("All tests passed!")}, false)
    
    function supportsImports() {
      return 'import' in document.createElement('link');
    }
    if (supportsImports()) {
      // Cool!
    } else {
      // Use other libraries/require systems to load files.
      alert("You must use the latest version of Google Chrome to get feedback and a code for this quiz. Sorry!");
    }

    // import templates
    var link = document.createElement('link');
    link.rel = 'import';
    link.href = '/frontend-grading-engine/src/webcomponents/test-widget.html';
    document.head.appendChild(link);
    
    link.onload = function(e) {
      console.log('Loaded Udacity Grading Engine');
    }
    link.onerror = function(e) {
      // TODO: pretty sure this never gets called
      link.href = '/frontend-grading-engine/src/webcomponents/test-widget.html';
      document.head.appendChild(link);
    }
  })()

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

function Target() {
  this.id = parseInt(Math.random() * 1000000); // a unique number used only for internal tracking purposes
  this.element = null;
  this.value = null;
  this.operation = null;
  this.children = [];
  this.index = null;
};

Object.defineProperties(Target.prototype, {
  hasChildren: {
    get: function() {
      var hasKids = false;
      if (this.children.length > 0) {
        hasKids = true;
      };
      return hasKids;
    }
  },
  hasValue: {
    get: function() {
      var somethingThere = false;
      if (this.value !== null && this.value !== undefined) {
        somethingThere = true;
      };
      return somethingThere;
    }
  },
  hasGrandkids: {
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

function GradeBook () {
  this.questions = [];
  this.passed = false;
};

Object.defineProperties(GradeBook.prototype, {
  numberOfQuestions: {
    get: function () {
      return this.questions.length;
    }
  },
  numberCorrectQuestions: {
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
    get: function () {
      var isAllGood = false;
      if (this.numberOfQuestions === this.numberCorrectQuestions && this.numberOfQuestions > 0) {
        isAllGood = true;
      }
      return isAllGood;
    }
  },
  numberWrongQuestions: {
    get: function () {
      var numberWrong = 0;
      numberWrong = numberOfQuestions - numberCorrectQuestions;
      return numberWrong;
    }
  },
  report: {
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

GradeBook.prototype.reset = function () {
  this.questions = [];
  this.passed = false;
};

/**
 * Will iterate through all the questions and return if they meet grade criteria
 * @param  {object} config - {string} config.strictness, {boolean} config.not, {function} config.callback
 * @return {boolean} passed - Are enough questions correct to pass the active_test?
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
 *      _______       
 *     |__   __|/\    
 *        | |  /  \   
 *        | | / /\ \  
 *        | |/ ____ \ 
 *        |_/_/    \_\
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
};

Object.defineProperties(TA.prototype, {
  childPosition: {
    /**
     * To find a child node's index in relation to its immediate siblings
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.runAgainstBottomTargets(function (target) {
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
        })
        return position;
      })

      return this;
    }
  },
  count: {
    /**
     * To count the number of children at the bottom level of the bullseye
     * @return {object} TA - the TA instance for chaining
     */
    get: function() {
      // doing more than accessing a property on existing target because counting can move up the bullseye to past Targets. Need to reset operations
      this.registerOperation('count');
      this.runAgainstNextToBottomTargets(function (target) {
        return target.children.length;
      });
      return this;
    }
  },
  index: {
    /**
     * To find the index of a target from when it was created.
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.registerOperation('index');
      this.runAgainstBottomTargets(function (target) {
        return target.index;
      })
      return this;
    }
  },
  innerHTML: {
    /**
     * To pull the innerHTML of a DOM node.
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.registerOperation('innerHTML');
      this.runAgainstBottomTargetElements(function (element) {
        return element.innerHTML;
      })
      return this;
    }
  },
  not: {
    /**
     * Not a collector! Used by the GradeBook to negate the correctness of a test.
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.gradeOpposite = true;
      return this;
    }
  },
  numberOfTargets: {
    /**
     * Not a collector! Private use only. Find the total number of targets in the bullseye.
     * @return {integer} - the number of targets
     */
    get: function () {
      return this.targetIds.length;
    }
  },
  onlyOneOf: {
    /**
     * Not a collector! Used by the GradeBook to set a threshold for number of questions to pass in order to count the whole test as correct.
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.picky = 'onlyOneOf';
      return this;
    }
  },
  someOf: {
    /**
     * Not a collector! Used by the GradeBook to set a threshold for number of questions to pass in order to count the whole test as correct.
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.picky = 'someOf';
      return this;
    }
  },
  targetIds: {
    /**
     * [get description]
     * @return {[type]}
     */
    get: function () {
      var ids = [];
      this.traverseTargets(function (target) {
        ids.push(target.id);
      });
      return ids;
    }
  },
  UAString: {
    /**
     * [get description]
     * @return {object} TA - the TA instance for chaining
     */
    get: function () {
      this.operations = navigator.userAgent;
      this.documentValueSpecified = navigator.userAgent;
      return this;
    }
  }
})

/**
 * Let the TA know this just happened
 * @param {string} operation - the thing that just happened
 */
TA.prototype.registerOperation = function (operation) {
  this.operations.push(operation);
  this.gradebook.reset();
};

// TODO: use config to determine if all targets should be traversed or if it, for instance, breaks after the first value gets hit?
TA.prototype.traverseTargets = function (callback, lastNodeCallback, config) {
  // http://www.timlabonne.com/2013/07/tree-traversals-with-javascript/

  /**
   * Recursively dive into a tree structure from the top. Used on the Target structure here.
   * @param  {object} node - a target of bullseye. Start with the top.
   * @param  {function} func - function to run against each node
   * @param  {function} lastNodeCallback - will be called after the last function has run against the last node. Does not take a parameter! Should be bullseye independent.
   */
  function visitDfs (node, func, lastNodeCallback) {
    if (func) {
      func(node);
    }
 
    node.children.forEach(function (child, index, arr) {
      visitDfs(child, func);
    });
  };
  visitDfs(this.target, callback, lastNodeCallback);
};

/**
 * Run a function against the top-level Target in the bullseye
 * @param  {function} callback - the function to run against the top-level target
 * @param  {boolean} record - whether or not to record the target in the gradebook
 * @return {[type]}
 */

// TODO: refactor different versions of this - one for setting, the other for collecting
TA.prototype.runAgainstTopTargetOnly = function (callback) {
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

TA.prototype.runAgainstBottomTargets = function (callback) {
  var self = this;

  var allTargets = this.targetIds;

  this.traverseTargets(function (target) {
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

TA.prototype.runAgainstBottomTargetElements = function (callback) {
  var self = this;

  var allTargets = this.targetIds;

  this.traverseTargets(function (target) {
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

TA.prototype.runAgainstNextToBottomTargets = function (callback) {
  var self = this;

  this.traverseTargets(function (target) {
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

// TA.prototype.runAsyncAgainstPage = function (callback) {
//   var self = this;

//   var whenFinished = {
//     success: function (data) {
//       console.log("Async test succeeded");
//       var pageBytesCollectionComplete = new CustomEvent('async-end', {'detail': {'data': data}})
//       document.querySelector('test-widget').dispatchEvent(pageBytesCollectionComplete);
//     },
//     error: function () {
//       console.log("Something went wrong with the async test");
//     },
//     update: function () {
//       return self;
//     }
//   };

//   var asyncTest = new Promise(function(resolve, reject) {
//     this.target.value = callback();
//     if (this.target.value) {
//       resolve(this.target.value);
//     } else {
//       reject();
//     };
//   }).then(whenFinished.success, whenFinished.error).then(whenFinished.update);
//   return asyncTest;
// };

TA.prototype.reportAsyncResults = function (callback) {
  this.target.value = callback();
  this.gradebook.recordQuestion(this.target.value);
};

/**
 * Generates the top-level target. Matched elements end up as children targets. It will not have a element.
 * @param  {string} CSS selector - the selector of the elements you want to query
 * @return {object} this - the TA object
 */
TA.prototype.theseNodes = function (selector) {
  this.registerOperation('gatherElements');

  this.target = new Target();

  var self = this;

  this.runAgainstTopTargetOnly(function (topTarget) {
    getDomNodeArray(selector).forEach(function (elem, index, arr) {
      var target = new Target();
      target.element = elem;
      target.index = index;
      topTarget.children.push(target);
    });
  })

  return this;
}
TA.prototype.theseElements = TA.prototype.theseNodes;

/**
 * Will run a query against the lowest level targets in the Target tree
 * @param  {string} CSS selector - the selector of the children you want to query
 * @return {object} this - the TA object
 */
TA.prototype.deepChildren = function (selector) {
  this.registerOperation('gatherDeepChildElements');

  this.runAgainstBottomTargets(function (target) {
    getDomNodeArray(selector, target.element).forEach(function (newElem, index) {
      var childTarget = new Target();
      childTarget.element = newElem;
      childTarget.index = index;
      target.children.push(childTarget);
    });
  });

  return this;
};
TA.prototype.children = TA.prototype.deepChildren;

// TODO: broken
TA.prototype.shallowChildren = function (selector) {
  this.registerOperation('gatherShallowChildElements');

  this.runAgainstBottomTargets(function (target) {
    getDomNodeArray(selector, target.element).forEach(function (newElem, index) {
      var childTarget = new Target();
      childTarget.element = newElem;
      childTarget.index = index;
      target.children.push(childTarget);
    });
  });
  return this;
};

TA.prototype.cssProperty = function (property) {
  this.registerOperation('cssProperty');

  this.runAgainstBottomTargetElements(function (elem) {
    var styles = getComputedStyle(elem);
    return styles[property];
  });
  return this;
}

TA.prototype.attribute = function (attr) {
  this.registerOperation('attr')

  this.runAgainstBottomTargetElements(function (elem) {
    var attrValue = elem.getAttribute(attr);
    if (attrValue === '') {
      attrValue = true;
    }
    return attrValue;
  });
  return this;
}

TA.prototype.absolutePosition = function (side) {
  this.registerOperation('absolutePosition');
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

  this.runAgainstBottomTargetElements(function (elem) {
    return selectorFunc(elem);
  });
  return this;
};

Object.defineProperties(TA.prototype, {
  toExist: {
    get: function() {
      var typeOfOperation = this.operations[this.operations.length - 1];

      var self = this;
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

      return this.gradebook.grade({
        callback: doesExistFunc,
        not: this.gradeOpposite,
        strictness: this.picky
      })
    }
  },
  value: {
    get: function () {
      // TA returns a single value from the first Target hit with a value. Used to create vars in active_tests.
      var value = null;
      this.runAgainstBottomTargets(function (target) {
        if (target.value) {
          value = target.value
        };
        return target.value;
      });
      return value;
    }
  },
  values: {
    get: function () {
      // TA returns a flat array of values. Used to create vars in active_tests.
      var values = [];
      this.runAgainstBottomTargets(function (target) {
        if (target.value) {
          values.push(target.value);
        };
        return target.value;
      });
      return values;
    }
  }
})

/*
  @param: expected* (any value)
  @param: noStrict/ (default: false)
*/
TA.prototype.toEqual = function (expected, noStrict) {
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

  return this.gradebook.grade({
    callback: equalityFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}

TA.prototype.toBeGreaterThan = function (expected, orEqualTo) {
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

  return this.gradebook.grade({
    callback: greaterThanFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}

TA.prototype.toBeLessThan = function(expected, orEqualTo) {
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

  return this.gradebook.grade({
    callback: lessThanFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
};

TA.prototype.toBeInRange = function(lower, upper, lowerInclusive, upperInclusive) {
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

  return this.gradebook.grade({
    callback: inRangeFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
};

TA.prototype.toHaveSubstring = function (expectedValues, config) {
  config = config || {};

  var self = this;
  // make sure expectedValues are an array
  if (!(expectedValues instanceof Array)) {
    expectedValues = [expectedValues];
  };

  var nInstances            = config.nInstances || false,   // TODO: not being used (is there a good use case?)
      minInstances          = config.minInstances || 1,     // TODO: not being used
      maxInstances          = config.maxInstances || false, // TODO: not being used
      nValues               = config.nValues || false,
      minValues             = config.minValues || 1,
      maxValues             = config.maxValues || 'all';

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

  return this.gradebook.grade({
    callback: substringFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}

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

var suites = [];
function registerSuite(_suite) {
  var self = this;
  var thisSuite = _suite.name;
  suites.push({
    name: _suite.name,
    code: _suite.code,
    tests: [],
    id: Date.now()
  })
  function registerTest(_test) {
    var hit = false;
    suites.forEach(function(val, index, arr) {
      if (val.name === thisSuite) {
        hit = true;
        if (!_test.flags) {
          _test.flags = {};
        }
        val.tests.push({
          description: _test.description,
          active_test: _test.active_test,
          flags: _test.flags,
          iwant: new TA()
        })
      }
    })
    if (!hit) {
      console.log("Suite " + suiteName + " was not registered. Could not add tests.");
    }
    // _test.iwant = Object.create(TA);
    return self;
  }
  return {
    registerTest: registerTest
  }
}
exports.registerSuite = registerSuite;
exports.suites = suites;

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

function pause() {
  // TODO
};
exports.pause = pause;

return exports;
}( window ));