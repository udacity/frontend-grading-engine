/**
The Teaching Assistant (TA) is responsible for:
  * collecting data from the page and creating a tree of Targets (called a bullseye) representing the information
  * traverseing the bullseye and reporting relevant data from Targets and grading instructions into a GradeBook.
  * All collectors return the instance of the TA object for chaining.
  * Collectors register their operations with the GradeBook, which actually checks the results of the tests.
*/

/**
 * The TA constructor sets default values and instantiates a GradeBook.
 */
function TA(description) {
  this.target = null;
  this.gradebook = new GradeBook();
  this.operations = [];
  this.gradeOpposite = false;
  this.picky = false;
  this.queue = new Queue();
  this.description = description;
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
          Array.prototype.slice.apply(target.element.parentNode.children).forEach(function (val, index) {
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
          var length = null;
          try {
            length = target.children.length;
          } catch (e) {
            length = 0;
          }
          return length;
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
          var index = null;
          try {
            index = target.index;
          } catch (e) {
            self.onerror('Cannot get index. Elements probably don\'t exist.');
          }
          return index;
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
          var html = '';
          try {
            html = element.innerHTML;
          } catch (e) {
            self.onerror('Cannot get innerHTML. Element probably doesn\'t exist.', true);
          }
          return html;
        });
      });
      return this;
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
        self._registerOperation('gatherElements');
        self.target = new Target();
        self._runAgainstTopTargetOnly(function (topTarget) {
          var ua = '';
          try {
            ua = navigator.userAgent;
          } catch (e) {
            self.onerror('Can\'t find a user agent string.', true);
          }
          return ua;
        })
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
   * @param  {function} callback - function to run against each node
   */
  function visitDfs (node, callback) {
    if (callback) {
      callback(node);
    }

    node.children.forEach(function (child, index, arr) {
      visitDfs(child, callback);
    });
  };
  visitDfs(this.target, callback);
};

/**
 * Run a function against the top-level Target in the bullseye
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
 * Run a function against bottom targets in the bullseye
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
 * Run a function against the elements of the bottom targets in the bullseye
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
 * Run a function against the next to bottom targets in the bullseye
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
      var elems = getDomNodeArray(selector);

      if (!selector) {
        self.onerror('Cannot find elements without a selector.', true);
      } else if (elems.length > 0) {
        elems.forEach(function (elem, index, arr) {
          var target = new Target();
          target.element = elem;
          target.index = index;
          topTarget.children.push(target);
        });
      }
    });
  });
  return this;
}
// for legacy quizzes
TA.prototype.nodes = TA.prototype.theseElements;

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
      var elems = getDomNodeArray(selector, target.element);

      if (!selector) {
        self.onerror('Cannot find elements without a selector.', true);
        throw new Error();
      } else if (target.element) {
        elems.forEach(function (newElem, index) {
          var childTarget = new Target();
          childTarget.element = newElem;
          childTarget.index = index;
          target.children.push(childTarget);
        });
      }
    });
  });
};
// for alternate syntax options
TA.prototype.children = TA.prototype.deepChildren;

TA.prototype.get = function (typeOfValue) {
  var self = this;
  switch (typeOfValue) {
    case 'count':
      self.count;
      break;
    case 'childPosition':
      self.childPosition;
      break;
    case 'innerHTML':
      self.innerHTML;
      break;
    case 'UAString':
      self.UAString;
      break;
    case 'index':
      self.index;
      break;
    default:
      self.onerror("Cannot 'get': '" + typeOfValue + "'. Options include: 'count', 'childPosition', innerHTML', and 'UAString'.")
      throw new Error();
      break;
  }
};

TA.prototype.limit = function (byHowMuch) {
  var self = this;
  switch (byHowMuch) {
    case 1:
      self.onlyOneOf;
      break;
    case 'some':
      self.someOf;
      break;
    default:
      self.onerror("Illegal 'limit'. Options include: 1 or 'some'.");
      throw new Error();
      break;
  }
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
      var styles = {};
      var style = null;
      try {
        styles = window.getComputedStyle(elem);
        style = styles[property];
      } catch (e) {
        self.onerror("Cannot get CSS property: '" + property + "'.", true);
      }
      // TODO: this is causing a FSL that could affect framerate?
      return style;
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
      var attrValue = null;
      try {
        attrValue = elem.getAttribute(attribute);
      } catch (e) {
        self.onerror("Cannot get attribute '" + attribute + "'.", true);
      }
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
      var cStyle = element.currentStyle || window.getComputedStyle(element, '');
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
      var absPos = null;
      try {
        absPos = selectorFunc(elem);
      } catch (e) {
        self.onerror("Cannot get absolute position of '" + side + "'.", true);
      }
      return absPos;
    });
  });
  return this;
};

/**
 * Must be used with noRepeat: true
 * Waits for an event. Grades against event.detail
 * @param  {String} eventName - custom event to listen for
 * @return {Object} TA for chaining
 */
TA.prototype.waitForEvent = function (eventName) {
  var self = this;
  self.queue.block();
  window.addEventListener(eventName, function (e) {
    self.queue.unblock();
    self._runAgainstTopTargetOnly(function (topTarget) {
      return e.detail;
    });
  });
  this.queue.add(function () {
    self._registerOperation('gatherElements');
    self.target = new Target();
  });
  return this;
};
