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
 *     _____ _            _____            _            
 *    |_   _| |          |  ___|          (_)           
 *      | | | |__   ___  | |__ _ __   __ _ _ _ __   ___ 
 *      | | | '_ \ / _ \ |  __| '_ \ / _` | | '_ \ / _ \
 *      | | | | | |  __/ | |__| | | | (_| | | | | |  __/
 *      \_/ |_| |_|\___| \____/_| |_|\__, |_|_| |_|\___|
 *                                    __/ |             
 *                                   |___/              
 */
 /*
    Returns the Tester object, which is responsible for querying the DOM and performing tests.

    Each active_test creates its own instance of Tester, referenced in active_test as `iwant`.

    Bullseye: Target tree
 */


  /*
  TODO:
  Breadth traversal spawns depth traversal

  Traveral operations carry function to evaluate.

  Report back to some kind of state manager object that records which tests were run and the results.

  When all tests have reported back, the manager object outputs state of the test as a whole.

  if debug mode, attach a unique class to each element as it gets targeted

  */

  /*
  TODO:
  error messages all over this bitch
  documentation
  */


  function Target(topLevel) {
    // TODO: keep innerHTML too? each target should have one.
    // this.elements = [];
    this.id = parseInt(Math.random() * 1000000);
    this.thisElement = null;
    this.value = null;
    this.operation = null;
    this.children = [];
    this.parent = null;
  };

  Object.defineProperties(Target, {
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
    isGrandparent: {
      get: function() {
        var gotGrandKids = false;
        gotGrandKids = this.children.some(function (kid) {
          return kid.hasChildren;
        });
        return gotGrandKids;
      }
    }
  });

  function Tester() {
    this.target = null;
    this.needToIterate = false;
    this.lastOperation = null;
    this.gradeOpposite = false;
    this.testingExistence = false;
    this.picky = false;
    this.activeTargets = null;   // a reference to the last target(s) created
  };

  Tester.traverseTargets = function (callback, config) {
    // traverse through the entire Target tree
    // use config to determine if all targets should be traversed or if it, for instance, breaks after the first value gets hit.

    // http://www.timlabonne.com/2013/07/tree-traversals-with-javascript/
    function visitDfs (node, func) {
      if (func) {
        func(node);
      }
   
      node.children.forEach(function (child, index, arr) {
        visitDfs(child, func);
      });
    };
    // don't really need this
    function visitBfs (node, func) {
      var q = [node];
      while (q.length > 0) {
        node = q.shift();
        if (func) {
          func(node);
        }
 
        node.children.forEach(function (child, index, arr) {
          q.push(child);
        });
      }
    };
    visitDfs(this.target, callback);
  };

  // Tester.expandTree = function (selector, parent) {
  //   // go to bottom level Targets and create new children
  // };

  Tester.wrapUpAndReturn = function (passed) {
    // last work to be done before returning result
    var singleVal = this.documentValueSpecified;
    var multiVal = this.targeted; // probably just want their values, not the nodes

    if (!(this.lastOperation instanceof Array)) {
      this.lastOperation = [this.lastOperation];
    }
    return {
      isCorrect: passed,
      actuals: this.lastOperation
    };
  };

  Tester.generateValues = function (callback, expectedVal) {
    // to adjust for 'not'
    var self = this;
    callback = (function(self, callback) {
      var cbFunc = function() {};
      if (self.gradeOpposite) {
        cbFunc = function(x,y) {
          var result = callback(x,y);
          return !result;
        }
      } else {
        cbFunc = function(x,y) {
          var result = callback(x,y);
          return result;
        }
      }
      return cbFunc;
    })(self, callback);

    this.traverseTargets(function (target) {
      callback(target.value, expectedVal);
    });
  };

  Tester.gradeResults = function () {
    var isCorrect = false;
    var permanentlyWrong = false;

    // technically a helper function, but it's only used here
    function genIsCorrect(currCorrect, config) {
      var callback      = config.callback,
          index         = config.index,
          expectedVal   = config.expectedVal || false,
          elem          = config.elem || false,
          currVal       = elem.valueSpecified || config.currVal || config.elem || false;

      var thisIterationIsCorrect = false;

      switch (self.picky) {
        case 'onlyOneOf':
          thisIterationIsCorrect = callback(currVal, expectedVal);
          if (thisIterationIsCorrect && currCorrect) {
            permanentlyWrong = true;
          } else {
            thisIterationIsCorrect = currCorrect || thisIterationIsCorrect;
          }
          break;
        case 'someOf':
          if (index === 0) {
            thisIterationIsCorrect = callback(currVal, expectedVal);
          } else {
            thisIterationIsCorrect = currCorrect || callback(currVal, expectedVal);
          };
          break;
        default:
          if (index === 0) {
            thisIterationIsCorrect = callback(currVal, expectedVal);
          } else {
            thisIterationIsCorrect = currCorrect && callback(currVal, expectedVal);
          };
          break;
      }

      return thisIterationIsCorrect;
    };
  };

  Tester.runAgainstTopTargetOnly = function (callback) {};
  Tester.runAgainstBottomTargets = function (callback) {};
  Tester.runAgainstNextToBottomTargets = function (callback) {};

  Tester.grade = function(callback, expectedVal) {
    // var self = this;
    // var isCorrect = false;
    // var permanentlyWrong = false;

    // // technically a helper function, but it's only used here
    // function genIsCorrect(currCorrect, config) {
    //   var callback      = config.callback,
    //       index         = config.index,
    //       expectedVal   = config.expectedVal || false,
    //       elem          = config.elem || false,
    //       currVal       = elem.valueSpecified || config.currVal || config.elem || false;

    //   var thisIterationIsCorrect = false;

    //   switch (self.picky) {
    //     case 'onlyOneOf':
    //       thisIterationIsCorrect = callback(currVal, expectedVal);
    //       if (thisIterationIsCorrect && currCorrect) {
    //         permanentlyWrong = true;
    //       } else {
    //         thisIterationIsCorrect = currCorrect || thisIterationIsCorrect;
    //       }
    //       break;
    //     case 'someOf':
    //       if (index === 0) {
    //         thisIterationIsCorrect = callback(currVal, expectedVal);
    //       } else {
    //         thisIterationIsCorrect = currCorrect || callback(currVal, expectedVal);
    //       };
    //       break;
    //     default:
    //       if (index === 0) {
    //         thisIterationIsCorrect = callback(currVal, expectedVal);
    //       } else {
    //         thisIterationIsCorrect = currCorrect && callback(currVal, expectedVal);
    //       };
    //       break;
    //   }

    //   return thisIterationIsCorrect;
    // };

    // // to adjust for 'not'
    // callback = (function(self, callback) {
    //   var cbFunc = function() {};
    //   if (self.gradeOpposite) {
    //     cbFunc = function(x,y) {
    //       var result = callback(x,y);
    //       return !result;
    //     }
    //   } else {
    //     cbFunc = function(x,y) {
    //       var result = callback(x,y);
    //       return result;
    //     }
    //   }
    //   return cbFunc;
    // })(self, callback);



    // if (this.documentValueSpecified !== undefined) {
    //   isCorrect = callback(this.documentValueSpecified, expectedVal);
    // } else if (this.needToIterate && !this.testingExistence) {
    //   this.targeted.forEach(function(elem, index, arr) {
    //     isCorrect = genIsCorrect(isCorrect, {
    //       callback: callback,
    //       index: index,
    //       expectedVal: expectedVal,
    //       elem: elem
    //     })
    //   })
    // } else if (this.testingExistence) {
    //   this.lastOperation.forEach(function(val, index, arr) {
    //     isCorrect = genIsCorrect(isCorrect, {
    //       callback: callback,
    //       index: index,
    //       currVal: val
    //     })
    //   })
    // } else {
    //   isCorrect = callback();
    // }
    // return isCorrect && !permanentlyWrong;
  };

  Object.defineProperties(Tester, {
    count: {
      get: function() {
        // if (this.targeted[0].valueSpecified instanceof Array) {
        //   this.targeted.forEach(function(targetedObj, index, arr) {
        //     var tl = targetedObj.valueSpecified.length || -1;
        //     targetedObj.valueSpecified = tl; // TODO: this seems problematic
        //   });
        // } else {
        //   this.documentValueSpecified = this.targeted.length;
        // }
        
        // var self = this;

        // this.traverseTargets(function (node) {
        //   if (node.children.length === 0) {
        //     node.value = node.elements.length;
        //   }
        // })
        // return this;
        return 1;
      }
    },
    toExist: {
      get: function() {
        this.testingExistence = true;
        var lastOperation = this.lastOperation || [];
        
        var doesExist = false;
        
        // typeof null === "object", for some insane reason. This is to correct for it.
        if (lastOperation === null) {
          lastOperation = false;
        }
        var typeOfOperation = typeof lastOperation;
        if (typeOfOperation === "object" && lastOperation instanceof Array) {
          typeOfOperation = "array";
        }

        if (typeOfOperation !== "array") {
          this.lastOperation = [lastOperation]
        }

        var doesExistFunc = function () {};
        var subDoesExist = false;

        switch (typeOfOperation) {
          case "number":
            doesExistFunc = function (x) {
              var subDoesExist = false;
              if (x > 0) {
                subDoesExist = true;
              }
            }
            break;
          case "string":
            doesExistFunc = function (x) {
              var subDoesExist = false;
              if (x.length > 0) {
                subDoesExist = true;
              }
            }
            break;
          case "array":
            doesExistFunc = function (x) {
              if (x) {
                return true;
              } else {
                return false;
              }
            }
            break;
          case "object":
            doesExistFunc = function (x) {
              var subDoesExist = false;
              if (Object.keys(x).length > 0) {
                subDoesExist = true;
              }
            }
            break;
          case "function":
            doesExistFunc = function (x) {
              var subDoesExist = false;
              if (x.getBody().length > 0) {
                subDoesExist = true;
              }
            }
            break;
          default:
            // good for booleans or undefined
            doesExistFunc = function (x) {
              var subDoesExist = false;            
              if (x) {
                subDoesExist = true;
              }
            }
            break;
        }

        doesExist = this.grade(doesExistFunc);
        return this.wrapUpAndReturn(doesExist);
      }
    },
    onlyOneOf: {
      get: function () {
        this.picky = 'onlyOneOf';
        return this;
      }
    },
    not: {
      get: function () {
        this.gradeOpposite = true;
        return this;
      }
    },
    pageImageBytes: {
      get: function () {
        // TODO
      }
    },
    someOf: {
      get: function () {
        this.picky = 'someOf';
        return this;
      }
    },
    UAString: {
      get: function () {
        this.lastOperation = navigator.userAgent;
        this.documentValueSpecified = navigator.userAgent;
        return this;
      }
    },
    value: {
      get: function () {
        // TODO: Tester returns a single value from the first Target hit with a value. Used to create vars in active_tests.
        // return this.documentValueSpecified;
        // var self = this;
        // return self.visitDfs(function() {
        //   console.log(this.value);
        // });
        var value = null;
        this.traverseTargets(function (node) {
          if (node.value) {
            value = node.value
          };
        });
        return value;
      }
    },
    values: {
      get: function () {
        // TODO: Tester returns a <no>flat array of Targets </no>with non-null values. Used to create vars in active_tests.
        var values = [];
        this.traverseTargets(function (node) {
          if (node.hasValue) {
            values.push(node.value);
          };
        });
        return values;
      }
    }
  })

  /**
   * Generates the top-level target. Matched elements end up as children targets. It will not have a thisElement.
   * @param  {string} CSS selector - the selector of the elements you want to query
   * @return {object} this - the Tester object
   */
  Tester.theseNodes = function (selector) {
    var operation = 'gatherElements';
    this.lastOperation = operation;

    this.target = new Target();
    this.target.operation = operation;

    var self = this;

    getDomNodeArray(selector).forEach(function (elem, index, arr) {
      var target = new Target();
      target.thisElement = elem;
      self.target.children.push(target);
    });

    this.activeTargets = [this.target];

    return this;
  }
  Tester.theseElements = Tester.theseNodes;

  /**
   * Will run a query against the lowest level targets in the Target tree
   * @param  {string} CSS selector - the selector of the children you want to query
   * @return {object} this - the Tester object
   */
  Tester.deepChildren = function (selector) {
    var operation = 'gatherDeepChildElements';
    this.lastOperation = operation;
    this.activeTargets = [];

    var self = this;

    // to keep track of children that were just created and don't need to be traversed
    var newChildrenIds = [];

    this.traverseTargets(function (node) {
      if (!node.hasChildren && newChildrenIds.indexOf(node.id) === -1) {      
        getDomNodeArray(selector, node.thisElement).forEach(function (newElem) {

          var childTarget = new Target();
          childTarget.operation = operation;
          childTarget.thisElement = newElem;
          node.children.push(childTarget);

          // to register that this child was just created and doesn't need to be traversed
          newChildrenIds.push(childTarget.id);
          self.activeTargets.push(childTarget);
        })
      };
    });
    return this;
  };
  Tester.children = Tester.deepChildren;

  Tester.shallowChildren = function (selector) {
    var operation = 'gatherChildElements';
    this.lastOperation = operation;

    var self = this;
    getDomNodeArray(selector, parent).forEach(function (elem, index, arr) {
      self.target.elements.push(elem);
    });
    return this;
  };

  Tester.cssProperty = function (property) {
    var self = this;
    this.needToIterate = true;
    this.lastOperation = [];
    this.targeted.forEach(function (targetObj, index, arr) {
      var styles = getComputedStyle(targetObj.elem);
      targetObj.valueSpecified = styles[property];
      self.lastOperation.push(targetObj.valueSpecified);
    });
    return this;
  }

  Tester.attribute = function (attr) {
    var self = this;
    this.needToIterate = true;
    this.lastOperation = [];
    this.targeted.forEach(function (targetObj, index, arr) {
      var attrValue = targetObj.elem.getAttribute(attr);
      if (attrValue === "") {
        attrValue = true;
      }
      targetObj.valueSpecified = attrValue;
      self.lastOperation.push(targetObj.valueSpecified);
    });
    return this;
  }

  Tester.absolutePosition = function (side) {
    var self = this;
    this.needToIterate = true;
    this.lastOperation = [];

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
        };
        break;
    }

    this.targeted.forEach(function(targetObj, index, arr) {
      targetObj.valueSpecified = selectorFunc(targetObj.elem);
      self.lastOperation.push(targetObj.valueSpecified);
      if (index === 0) {
        self.documentValueSpecified = targetObj.valueSpecified;
      }
    })
    return this;
  };

  /*
    @param: y* (any value)
    @param: noStrict/ (default: false)
  */
  Tester.toEqual = function(y, noStrict) {
    noStrict = noStrict || false;
    
    var isEqual = false;
    var equalityFunc = function() {};
    switch (noStrict) {
      case true:
        equalityFunc = function(x, y) {
          return x == y;
        };
        break;
      case false:
        equalityFunc = function(x, y) {
          return x === y;
        };
        break;
      default:
        equalityFunc = function(x, y) {
          return x === y;
        };
        break;
    }

    isEqual = this.grade(equalityFunc, y);
    return this.wrapUpAndReturn(isEqual);
  }

  Tester.toBeGreaterThan = function(y, orEqualTo) {
    orEqualTo = orEqualTo || false;
    var isGreaterThan = false;

    var greaterThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        greaterThanFunc = function (x, y) {
          var isGreaterThan = false;
          if (x >= y) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
      case false:
        greaterThanFunc = function (x, y) {
          var isGreaterThan = false;
          if (x > y) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
      default:
        greaterThanFunc = function (x, y) {
          var isGreaterThan = false;
          if (x > y) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
    }

    isGreaterThan = this.grade(greaterThanFunc, y);
    return this.wrapUpAndReturn(isGreaterThan);
  }

  Tester.toBeLessThan = function(y, orEqualTo) {
    orEqualTo = orEqualTo || false;
    var isLessThan = false; // TODO: delete?

    var lessThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        lessThanFunc = function (x, y) {
          var isLessThan = false;
          if (x <= y) {
            isLessThan = true;
          }
          return isLessThan;
        }
      case false:
        lessThanFunc = function (x, y) {
          var isLessThan = false;
          if (x < y) {
            isLessThan = true;
          }
          return isLessThan;
        }
      default:
        lessThanFunc = function (x, y) {
          var isLessThan = false;
          if (x < y) {
            isLessThan = true;
          }
          return isLessThan;
        }
    }

    isLessThan = this.grade(lessThanFunc, y);
    return this.wrapUpAndReturn(isLessThan);
  };
  
  Tester.toBeInRange = function(lower, upper, lowerInclusive, upperInclusive) {
    lowerInclusive = lowerInclusive || true;
    upperInclusive = upperInclusive || true;
    var isInRange = false;

    var xIsLessThan = function () {};
    switch (lowerInclusive) {
      case true:
        xIsLessThan = function (x, y) {
          var isInRange = false;
          if (x <= y) {
            isInRange = true;
          }
          return isInRange;
        }
      case false:
        xIsLessThan = function (x, y) {
          var isInRange = false;
          if (x < y) {
            isInRange = true;
          }
          return isInRange;
        }
      default:
        xIsLessThan = function (x, y) {
          var isInRange = false;
          if (x < y) {
            isInRange = true;
          }
          return isInRange;
        }
    }

    var xIsGreaterThan = function () {};
    switch (upperInclusive) {
      case true:
        xIsGreaterThan = function (x, y) {
          var isInRange = false;
          if (x >= y) {
            isInRange = true;
          }
          return isInRange;
        }
      case false:
        xIsGreaterThan = function (x, y) {
          var isInRange = false;
          if (x > y) {
            isInRange = true;
          }
          return isInRange;
        }
      default:
        xIsGreaterThan = function (x, y) {
          var isInRange = false;
          if (x > y) {
            isInRange = true;
          }
          return isInRange;
        }
    }

    var inRangeFunc = function (x, y) {
      var isInRange = false;
      x = x.replace('px', '');
      x = x.replace('%', '');
      if (xIsLessThan(x, range.upper) && xIsGreaterThan(x, range.lower)) {
        isInRange = true;
      }
      return isInRange;
    }

    var range = {upper: upper, lower: lower}; // this is a hack because genIsCorrect expects only one comparison value
    isInRange = this.grade(inRangeFunc, range);
    return this.wrapUpAndReturn(isInRange);
  };

  Tester.toHaveSubstring = function (values, config) {
    var self = this;
    config = config || {};
    this.needToIterate = true;
    // make sure values are an array
    if (!(values instanceof Array)) {
      values = [values];
    };
    var hasRightNumberOfSubstrings = false;

    var nInstances            = config.nInstances || false,   // TODO: not being used (Is there a good use case?)
        minInstances          = config.minInstances || 1,     // TODO: not being used
        maxInstances          = config.maxInstances || false, // TODO: not being used
        nValues               = config.nValues || false,
        minValues             = config.minValues || 1,
        maxValues             = config.maxValues || 'all';

    if (maxValues === 'all') {
      maxValues = values.length;
    };

    // TODO: refactor functionally?
    var substringFunc = function (targetedObj, values) {
      var string = '';
      if (targetedObj instanceof Node) {
        string = targetedObj.innerHTML;
      } else if (targetedObj.elem) {
        string = targetedObj.elem.innerHTML;
      } else {
        string = targetedObj;
      };
      var hasNumberOfValsExpected = false;
      var hits = 0;
      values.forEach(function(val, index, arr) {
        if (string.search(val) > -1) {
          hits+=1;
        };
      });

      if (nValues) {
        (hits === nValues) ? hasNumberOfValsExpected = true : hasNumberOfValsExpected = false;
      } else if (hits >= minValues && hits <= maxValues) {
        hasNumberOfValsExpected = true;
      };
      self.lastOperation = [hasNumberOfValsExpected];
      return hasNumberOfValsExpected;
    };
    hasRightNumberOfSubstrings = this.grade(substringFunc, values);
    return this.wrapUpAndReturn(hasRightNumberOfSubstrings);
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
            iwant: Object.create(Tester)
          })
        }
      })
      if (!hit) {
        console.log("Suite " + suiteName + " was not registered. Could not add tests.");
      }
      _test.iwant = Object.create(Tester);
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
  
  return exports;
}( window ));