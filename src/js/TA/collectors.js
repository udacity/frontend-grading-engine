
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
*/

function TA() {
  this.target = null;
  this.gradebook = new GradeBook();
  this.operations = [];
  this.gradeOpposite = false;
  this.picky = false;
};

Object.defineProperties(TA.prototype, {
  not: {
    get: function () {
      this.gradeOpposite = true;
      return this;
    }
  },
  numberOfTargets: {
    get: function () {
      return this.targetIds.length;
    }
  },
  onlyOneOf: {
    get: function () {
      this.picky = 'onlyOneOf';
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
  targetIds: {
    get: function () {
      var ids = [];
      this.traverseTargets(function (target) {
        ids.push(target.id);
      });
      return ids;
    }
  },
  UAString: {
    get: function () {
      this.operations = navigator.userAgent;
      this.documentValueSpecified = navigator.userAgent;
      return this;
    }
  }
})

/**
 * Let the TA know this just happened
 * @param  {string} operation - the thing that just happened
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
TA.prototype.runAgainstTopTargetOnly = function (callback) {
  var self = this;
  this.target.value = callback(this.target);
  self.gradebook.recordQuestion(this.target);
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
      self.gradebook.recordQuestion(target);
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
    getDomNodeArray(selector, target.element).forEach(function (newElem) {
      var childTarget = new Target();
      childTarget.element = newElem;
      target.children.push(childTarget);
    });
  });

  return this;
};
TA.prototype.children = TA.prototype.deepChildren;

// TODO: broken
TA.prototype.shallowChildren = function (selector) {
  var operation = 'gatherChildElements';
  this.operations = operation;

  var self = this;
  getDomNodeArray(selector, parent).forEach(function (elem, index, arr) {
    self.target.elements.push(elem);
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
      };
      break;
  };

  this.runAgainstBottomTargetElements(function (elem) {
    return selectorFunc(elem);
  });
  return this;
};