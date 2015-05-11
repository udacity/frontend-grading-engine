/*
http://github.com/udacity/frontend-grading-engine

Udacity's library for immediate front-end feedback.

Version 0.2

Built with Web Components (HTML Imports and Custom Elements)

New for version 0.2!
  * Encapsulation

Resources:
http://www.html5rocks.com/en/tutorials/webcomponents/imports/
http://www.html5rocks.com/en/tutorials/webcomponents/customelements/

Cameron Pittman 2015
*/

// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
var suites = [];
function registerSuite(name) {
  suites.push({
    name: name
  })
  function registerTest(description, test, suite) {
    var hit = false;
    suites.forEach(function(val, index, arr) {
      if (val.name === suite) {
        hit = true;
        val.desc = description;
        val.test = test;
      }
    })
  }
  return {
    registerTest: registerTest
  }    
}

/*
Class describes an instance of the Udacity test engine.
*/
var UdaciTests = function(props) {
  this.suites = props.suites;
  
  document.body.addEventListener('grader-passed', function (e) {console.log("All tests passed!")}, false)
  
  function supportsImports() {
    return 'import' in document.createElement('link');
  }
  if (supportsImports()) {
    // Cool!
  } else {
    // Use other libraries/require systems to load files.
    alert("You must use Google Chrome to get feedback and a code for this quiz. Sorry!");
  }

  // import templates
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = 'http://udacity.github.io/frontend-grading-engine/templates/test-widget.html'
  link.onload = function(e) {
    console.log('Loaded Udacity Grading Engine');
  }
  link.onerror = function(e) {
    console.log('Error loading import: ' + e.target.href);
  }
  document.head.appendChild(link);
}

UdaciTests.prototype.testMediaQueries = function(udArr) {
    /*
    This is an insane piece of code that's not quite fully functional.

    To test whether or not breakpoints are set correctly,
    we create an iframe off the viewport containing the current page.
    Then, we resize the iframe's width and query it for styles.

    Seems simple, but it isn't. IFRAMES ARE CRAZY!

    Also, this will need to be refactored for more robustness at
    some point.
    */
    var contentCopy = document.body.parentElement.innerHTML;
    
    // Why all the replaces? To make sure that no JS runs in the iframe.
    // JS in the iframe was an incredibly annoying source of bugs during
    // development.
    contentCopy = contentCopy.replace(/<script/g, "<!-- <script");
    contentCopy = contentCopy.replace(/<\/script>/g, "<\/script> -->");
    contentCopy = contentCopy.replace(/<iframe/g, "<!-- <iframe");
    contentCopy = contentCopy.replace(/<\/iframe>/g, "<\/iframe> -->");

    iframeElem = iframeElem || document.querySelector('iframe.mq-test');
    
    if (!iframeElem) {
      iframeElem = document.createElement('iframe');
      iframeElem.classList.add('mq-test');
      iframeElem.src = 'about:blank';
      document.body.appendChild(iframeElem);
      iframeElem.style.position = 'absolute';
      iframeElem.style.left = '100%';
    }

    function setIframeWidth(_width) {
      iframeElem.style.width = _width;
    }

    // Not sure why, but any selector other than 'body' seems to fail...
    // TODO: make other selectors work
    function getStyleFromIframe(_selector, _property) {
      var computedStyles = getComputedStyle(iframeElem.contentDocument.querySelector(_selector));
      return computedStyles[_property];
    }

    setIframeWidth(udArr[0].width);

    // This is a strange situation. Accessing .innerWidth forces layout... I'm pretty sure.
    // This needs to happen otherwise the iframe width won't resize and everything breaks.
    // Wow. JS is super weird.
    // TODO: find a less janky way to force layout? 
    if (iframeElem.contentWindow.innerWidth === "") {
      console.log(iframeElem.contentWindow.innerWidth);
    }

    var hasCorrectStyles = false;
    // iterate through styles and get values
    udArr.forEach(function(obj, a) {
      obj.styles.forEach(function(sel, b) {
        sel.css.forEach(function(pv, c) {
          var stdValue = getStyleFromIframe(sel.selector, pv.property);
          if (stdValue === pv.value && c === 0) {
            hasCorrectStyles = true;
          } else if (stdValue === pv.value) {
            hasCorrectStyles = hasCorrectStyles && true;
          } else {
            hasCorrectStyles = hasCorrectStyles && false;
          }
        })
      })
    })

    try {
      iframeElem.contentDocument.body.parentElement.innerHTML = contentCopy;
    } catch (e){}

    return hasCorrectStyles;
}
UdaciTests.prototype.testPictureMediaQueries = function(udArr) {
  /*
  This is an insane piece of code that's not fully functional.

  To test whether or not breakpoints are set correctly,
  we create an iframe off the viewport containing the current page.
  Then, we resize the iframe's width and query it for styles.

  Seems simple, but it isn't. IFRAMES ARE CRAZY!

  Also, this will need to be refactored for more robustness at
  some point.
  */
  var contentCopy = document.body.parentElement.innerHTML;
  
  // Why all the replaces? To make sure that no JS runs in the iframe.
  // JS in the iframe was an incredibly annoying source of bugs during
  // development.
  contentCopy = contentCopy.replace(/<script/g, "<!-- <script");
  contentCopy = contentCopy.replace(/<\/script>/g, "<\/script> -->");
  contentCopy = contentCopy.replace(/<iframe/g, "<!-- <iframe");
  contentCopy = contentCopy.replace(/<\/iframe>/g, "<\/iframe> -->");

  iframeElem = iframeElem || document.querySelector('iframe.mq-test');
  
  if (!iframeElem) {
    iframeElem = document.createElement('iframe');
    iframeElem.classList.add('mq-test');
    iframeElem.src = 'about:blank';
    document.body.appendChild(iframeElem);
    iframeElem.style.position = 'absolute';
    iframeElem.style.left = '100%';
  }

  function setIframeWidth(_width) {
    iframeElem.style.width = _width;
  }

  // Not sure why, but any selector other than 'body' seems to fail...
  // TODO: make other selectors work
  function getFilenameFromIframe(_selector, _property) {
    // var computedStyles = getComputedStyle(iframeElem.contentDocument.querySelector(_selector));
    var computedFile = getComputedStyle(iframeElem.contentDocument.querySelector(_selector));
    return computedStyles[_property];
  }

  setIframeWidth(udArr[0].width);

  // This is a strange situation. Accessing .innerWidth forces layout... I'm pretty sure.
  // This needs to happen otherwise the iframe width won't resize and everything breaks.
  // Wow. JS is super weird.
  // TODO: find a less janky way to force layout? 
  if (iframeElem.contentWindow.innerWidth === "") {
    console.log(iframeElem.contentWindow.innerWidth);
  }

  var hasCorrectStyles = false;
  // iterate through styles and get values
  udArr.forEach(function(obj, a) {
    obj.styles.forEach(function(sel, b) {
      sel.css.forEach(function(pv, c) {
        var stdValue = getStyleFromIframe(sel.selector, pv.property);
        if (stdValue === pv.value && c === 0) {
          hasCorrectStyles = true;
        } else if (stdValue === pv.value) {
          hasCorrectStyles = hasCorrectStyles && true;
        } else {
          hasCorrectStyles = hasCorrectStyles && false;
        }
      })
    })
  })

  try {
    iframeElem.contentDocument.body.parentElement.innerHTML = contentCopy;
  } catch (e){}

  return hasCorrectStyles;
}
UdaciTests.prototype.testViewportWidth = function(expected) {
  var isCorrect = false;
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  width === expected[0] ? isCorrect = true : isCorrect = false;
  return isCorrect;
}
UdaciTests.prototype.testViewportHeight = function(expected) {
  var isCorrect = false;
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  height === expected[0] ? isCorrect = true : isCorrect = false;
  // console.log("height: " + isCorrect);
  return isCorrect;
}
UdaciTests.prototype.testUA = function(expected) {
  var isCorrect = false;
  var ua = window.navigator.userAgent;
  ua === expected[0] ? isCorrect = true : isCorrect = false;
  return isCorrect;
}
UdaciTests.prototype.testDPR = function(expected) {
  var isCorrect = false;
  var dpr = window.devicePixelRatio;
  dpr === expected[0] ? isCorrect = true : isCorrect = false;
  return isCorrect;
}
UdaciTests.prototype.testViewportMetaTagContent = function(expected) {
  var hasRightMeta = false;
  var correctViewportContent = 'width=device-width,initial-scale=1.0';
  var metas = document.querySelectorAll('meta');
  // TODO: more elegant way to handle failed queries
  if (!metas) return false;
  metas = nodeListToArray(metas);
  metas.forEach(function(val) {
    var content, name;
    // TODO: compactify logic
    try {
      content = val.getAttribute('content').replace(' ', '');
      name = val.getAttribute('name');
    } catch (e) {
      content = "";
      name = "";
    }
    if (name === 'viewport' && content === correctViewportContent) {
      hasRightMeta = true;
    }
  })
  return hasRightMeta;
}
UdaciTests.prototype.testMetaTagContent = function(udArr) {
  var hasRightMeta = false;
  // TODO: refactor so that content comes from expected
  var attr = udArr[0].attr;
  var udValue = udArr[0].value;
  var metas = document.querySelectorAll('meta');
  if (!metas) return false;
  metas = nodeListToArray(metas);
  metas.forEach(function(val) {
    var content, name;
    // TODO: compactify logic
    try {
      stdValue = val.getAttribute(attr);
    } catch (e) {
      stdAttr = "";
    }
    if (stdValue === udValue) {
      hasRightMeta = true;
    }
  })
  return hasRightMeta;
}
UdaciTests.prototype.testDOMelemCount = function(udArr) {
  var rightCount = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  if (!elems) return false;
  if ((elems.length) === udArr[0].count) rightCount = true;
  return rightCount;
}

/*
Find the number of parent child pairs on document.

@param: (css selector string) childSelector
@param: (css selector string) parentSelector
@param: (integer) count
*/
UdaciTests.prototype.testDOMelemsCounts = function(udArr) {
  // for multiple sets of the same parent > child counts
  // run tests like: make sure all pictures have two sources
  var rightCounts = false;
  var parentElems = document.querySelectorAll(udArr[0].parentSelector);
  if (!parentElems) return false;
  parentElems = nodeListToArray(parentElems);

  parentElems.forEach(function(val, index) {
    var childElems = val.querySelectorAll(udArr[0].childSelector);
    if (childElems.length === udArr[0].count && index === 0) {
      rightCounts = true;
    }
    else if ((childElems.length) === udArr[0].count) {
      rightCounts = rightCounts && true;
    }
  })
  return rightCounts;
}
UdaciTests.prototype.testDOMelemExists = function(udArr) {
  var exists = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  if (!elems) return false;
  if ((elems.length) > 0) exists = true;
  return exists;
}
UdaciTests.prototype.testDOMelemsChildPosition = function(udArr) {
  // assumes 1 child
  var isCorrect = false;

  var parents = document.querySelectorAll(udArr[0].parentSelector);
  if (!parents) return false;
  parents = nodeListToArray(parents);
  var childSelector = udArr[0].childSelector;
  var loc = udArr[0].location;

  parents.forEach(function(val, index, arr) {
    var child = val.querySelectorAll(childSelector)[0];
    if (!child) return false;
    var position = udArr[0].position;

    if (position < 0) position = nodeListToArray(val).length + position;
    if (nodeListToArray(val).indexOf(child) === position) isCorrect = true;
  });
  return isCorrect;
}
UdaciTests.prototype.testDOMelemDoesntExist = function(udArr) {
  var doesntExist = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  if (!elems) return false;
  if ((elems.length) === 0) doesntExist = true;
  return doesntExist;
}
UdaciTests.prototype.testDOMelemsHorizontalSeparation = function(udArr) {
  // TODO: figure out how to do % width
  /*
    * elems must have same parent?
    * specify an elem to compare against?
    * another case for iframes?
  */

  var separatedCorrectly = false;
  var left = document.querySelector(udArr[0].leftElemSelector);
  var right = document.querySelector(udArr[0].rightElemSelector);
  if (!left || !right) return false;
  var separation = right.offsetLeft - (left.offsetLeft + left.offsetWidth);
  if (separation === udArr[0].distance) separatedCorrectly = true;
  return separatedCorrectly;
}
UdaciTests.prototype.testDOMelemAbsolutePosition = function(udArr) {
  var correctSpot = false;
  var elem = document.querySelector(udArr[0].selector);
  if (!elem) return false;

  var udTop,udBottom,udLeft,udRight;
  udTop = null || udArr[0].top;
  udBottom = null || udArr[0].bottom;
  udLeft = null || udArr[0].left;
  udRight = null || udArr[0].right;

  var sides = [
    {
      ours: udTop,
      theirs: elem.offsetTop
    },
    {
      ours: udBottom,
      theirs: elem.offsetTop + elem.offsetHeight
    },
    {
      ours: udLeft,
      theirs: elem.offsetLeft
    },
    {
      ours: udRight,
      theirs: elem.offsetLeft + elem.offsetWidth
    }
  ]

  var foundSide = 0;

  sides.forEach(function(val, index) {
    var us = val.ours;
    var them = val.theirs;
    if (us === "max" && (index === 0 || index === 1)) {
      us = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    if (us === "max" && (index === 2 || index === 3)) {
      us = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    if (us > -1) foundSide += 1;

    if (us > -1 && foundSide === 1) {
      correctSpot = (us === them);
    } else if (us && foundSide > 1) {
      correctSpot = (us === them) && correctSpot;
    }
  })
  return correctSpot;
}
UdaciTests.prototype.testDOMelemAttrExists = function(udArr) {
  var hasAttr = false;
  var elem = document.querySelector(udArr[0].selector);
  if (!elem) return false;
  var attr = udArr[0].attr;
  var theirAttr = elem.getAttribute(attr);

  if (theirAttr || theirAttr === "") hasAttr = true;
  return hasAttr;
}

/*
If one value in the values array matches the value of the attribute of the selected element in the document, test will pass.

@param: (css selector string) selector - selector for single element
@param: (string) attr - attribute you want to compare
@param: (array of strings) values - an array of values, where the test will pass if one matches.
*/
UdaciTests.prototype.testDOMelemAttrContent = function(udArr) {
  // for elems that must exist
  var isCorrect = false;
  var elem = document.querySelector(udArr[0].selector);
  if (!elem) return false;
  var attr = udArr[0].attr;
  var udValues = udArr[0].values || [];

  function multiUdValues(udVals, stdVal) {
    var hasAllValues = false;
    udVals.forEach(function(udVal, index, arr) {
      if (udVal.search(",") > -1) {
        udVal = udVal.replace(" ,", ",").replace(", ", ",");
        udVal = udVal.split(",").sort();
        try {
          stdVal = stdVal.replace(" ,", ",").replace(", ", ",");
          stdVal = stdVal.split(",").sort();
        } catch (e) {
          // do nothing
        }
      }
      if (arrEquals(udVal, stdVal) && index === 0) {
          hasAllValues = true;
      } else if (udVal === stdVal && index === 0) {
          hasAllValues = true;
      } else if (arrEquals(udVal, stdVal) && index > 0) {
          hasAllValues = hasAllValues && true;
      } else if (udVal === stdVal && index > 0) {
          hasAllValues = hasAllValues && true;
      } 
    })
    return hasAllValues;
  }

  function singleUdValue(udVal, stdVal) {
    var hasRightValue = false;
    if (udVal === stdVal) hasRightValue = true;
    return hasRightValue;
  }

  function noUdValue(stdVal) {
    var hasSomeValue = false;
    if (stdVal.length > 0) hasSomeValue = true;
    return hasSomeValue;
  }

  var stdValue = elem.getAttribute(attr) || "";
  switch (udValues.length) {
    case 0:
      isCorrect = noUdValue(stdValue);
      break;
    case 1:
      isCorrect = singleUdValue(udValues[0], stdValue);
      break;
    default:
      isCorrect = multiUdValues(udValues, stdValue);
  }

  return isCorrect;
}
UdaciTests.prototype.testDOMelemsAttrContent = function(udArr) {
  // same as above but, it checks an attr against a collection of elems
  // if no values are specified, it just checks to make sure attr exists.
  var isCorrect = false;
  var selector = udArr[0].selector;
  var elems = document.querySelectorAll(selector);
  if (!elems) return false;
  elems = nodeListToArray(elems);
  var attr = udArr[0].attr;
  var udValues = udArr[0].values || [];

  function multiUdValues(udVals, stdVal) {
    var hasAllValues = false;
    udVals.forEach(function(udVal, index, arr) {
      if (udVal.search(",") > -1) {
        udVal = udVal.replace(" ,", ",").replace(", ", ",");
        udVal = udVal.split(",").sort();
        try {
          stdValue = stdValue.replace(" ,", ",").replace(", ", ",");
          stdValue = stdValue.split(",").sort();
        } catch (e) {
          var stdValue = [];
        }
      }
      if (arrEquals(udVal, stdValue) && index === 0) {
          hasAllValues = true;
      } else if (udVal === stdValue && index === 0) {
          hasAllValues = true;
      } else if (arrEquals(udVal, stdValue) && index > 0) {
          hasAllValues = hasAllValues && true;
      } else if (udVal === stdValue && index > 0) {
          hasAllValues = hasAllValues && true;
      } 
    })
    return hasAllValues;
  }

  function singleUdValue(udVal, stdVal) {
    var hasRightValue = false;
    if (udVal === stdVal) hasRightValue = true;
    return hasRightValue;
  }

  function noUdValue(stdVal) {
    var hasSomeValue = false;
    if (stdVal.length > 0) hasSomeValue = true;
    return hasSomeValue;
  }

  elems.forEach(function(elem, index, arr) {
    var stdValue = elem.getAttribute(attr) || "";
    switch (udValues.length) {
      case 0:
        if (index === 0) {
          isCorrect = noUdValue(stdValue);
        } else {
          isCorrect = noUdValue(stdValue) && isCorrect;
        }
        break;
      case 1:
        if (index === 0) {
          isCorrect = singleUdValue(udValues[0], stdValue);
        } else {
          isCorrect = noUdValue(stdValue) && isCorrect;
        }
        break;
      default:
        if (index === 0) {
          isCorrect = multiUdValue(udValues, stdValue);
        } else {
          isCorrect = noUdValue(stdValue) && isCorrect;
        }
    }
  })

  return isCorrect;
}
UdaciTests.prototype.testDOMelemAttrApproxContent = function(udArr) {
  // for elems that may or may not exist
  // TODO: too much looping, try using more ||
  var hasCorrectAttr = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  if (!elems) return false;
  var attrs = udArr[0].attrs;
  var values = udArr[0].values;

  elems = nodeListToArray(elems);

  elems.forEach(function(elem) {
    attrs.forEach(function(attr, index) {
      var theirAttrValue = elem.getAttribute(attr);
      values.forEach(function(udValue, jindex) {
        if (udValue.search(",") > -1) {
          var us = value.replace(" ,", ",").replace(", ", ",");
          us = us.split(",").sort();
          try {
            var them = theirAttrValue.replace(" ,", ",").replace(", ", ",");
            them = them.split(",").sort();
          } catch (e) {
            var them = [];
          }
          if (arrEquals(us, them)) {
            hasCorrectAttr = true;
            return hasCorrectAttr;
          }
        } else if (theirAttrValue) {
          if (theirAttrValue.search(udValue) > -1) {
            hasCorrectAttr = true;
            return hasCorrectAttr;
          }
        }
      })
    })
  })
  return hasCorrectAttr;
}
UdaciTests.prototype.testDOMelemCSS = function(udArr) {
  // TODO: make this applicable to more than px and %
  var isCorrect = false;
  var elem = document.querySelector(udArr[0].selector);
  if (!elem) return false;
  var prop = udArr[0].property;
  var udValue = udArr[0].value;
  var stdValue = getComputedStyle(elem).getPropertyValue(prop);

  // expects us to be a string with px at the end
  // ranges take the form of: "500-800px" and are inclusive
  // them could be a single value, eg. "500px"
  function inPixelRange(us, them) {
    var isInRange = false;

    // sanity checking
    if (us.indexOf("px") === -1) {
      return false;
    }

    var hyphen = us.indexOf("-");
    if (hyphen !== -1) {
      us = us.replace("px", "");
      var lowerBound = parseInt(us.slice(0,hyphen));
      var upperBound = parseInt(us.slice(hyphen + 1));
      them = parseInt(them.replace("px", ""));
      if (them <= upperBound && them >= lowerBound) isInRange = true;
    } else {
      if (us === them) isInRange = true;
    }
    return isInRange;
  };

  // expects us to be a string with % at the end
  // ranges take the form of: "50-80%" and are inclusive
  // them could be a single value, eg. "50%"
  function inPercentageRange(us, them) {
    var isInRange = false;

    // sanity checking
    if (us.indexOf("%") === -1) {
      return false;
    }

    var hyphen = us.indexOf("-");
    if (hyphen !== -1) {
      us = us.replace("%", "");
      var lowerBound = parseInt(us.slice(0,hyphen));
      var upperBound = parseInt(us.slice(hyphen + 1));
      them = parseInt(them.replace("%", ""));
      if (them <= upperBound && them >= lowerBound) isInRange = true;
    } else {
      if (us === them) isInRange = true;
    }
    return isInRange;
  };

  if (udValue.indexOf("px") !== -1) {
    isCorrect = inPixelRange(udValue, stdValue);
  } else if (udValue.indexOf("%") !== -1) {
    isCorrect = inPercentageRange(udValue, stdValue);
  }

  return isCorrect;
}
UdaciTests.prototype.testPageSizeHosted = function(udArr) {
  // Currently broken. Also, it's not useable for localhost...
  // TODO: return a value!
  var isCorrect = false;
  var minSize = udArr[0].minSize || null;
  var maxSize = udArr[0].maxSize || null;

  // Using PageSpeed Insights
  var API_KEY = 'AIzaSyBZJLTe2gcYkWQe3_b8voBIUEaelRpz6U0';
  var URL_TO_GET_RESULTS_FOR = location.href;

  var API_URL = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?';

  // Object that will hold the callbacks that process results from the
  // PageSpeed Insights API.
  var callbacks = {};

  callbacks.isInByteRange = function(result) {
    var stats = result.pageStats;
    var data = [];
    var totalBytes = 0;
    for (var i = 0, len = RESOURCE_TYPE_INFO.length; i < len; ++i) {
      if (field in stats) {
        var val = Number(stats[field]);
        totalBytes += val;
      }
    }

    // logic for minsize, maxsize
    if (minSize && minSize <= totalBytes && !maxSize) {
      isCorrect = true;
    }
    if (maxSize && maxSize >= totalBytes && !minSize) {
      isCorrect = true;
    }
    if (minSize && maxSize && minSize <= totalBytes && maxSize >= totalBytes) {
      isCorrect = true;
    }
  };

  // Invokes the PageSpeed Insights API. The response will contain
  // JavaScript that invokes our callback with the PageSpeed results.
  function runPagespeed() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    var query = [
      'url=' + URL_TO_GET_RESULTS_FOR,
      'callback=runPagespeedCallbacks',
      'key=' + API_KEY,
    ].join('&');
    s.src = API_URL + query;
    document.head.insertBefore(s, null);
  }

  // Our JSONP callback. Checks for errors, then invokes our callback handlers.
  window.runPagespeedCallbacks = function(result) {
    if (result.error) {
      var errors = result.error.errors;
      for (var i = 0, len = errors.length; i < len; ++i) {
        if (errors[i].reason == 'badRequest' && API_KEY == 'yourAPIKey') {
          alert('Please specify your Google API key in the API_KEY variable.');
        } else {
          // NOTE: your real production app should use a better
          // mechanism than alert() to communicate the error to the user.
          alert(errors[i].message);
        }
      }
      return;
    }

    // Dispatch to each function on the callbacks object.
    for (var fn in callbacks) {
      var f = callbacks[fn];
      if (typeof f == 'function') {
        callbacks[fn](result);
      }
    }
  }

  // Invoke the callback that fetches results. Async here so we're sure
  // to discover any callbacks registered below, but this can be
  // synchronous in your code.
  // setTimeout(runPagespeed, 0);
  return runPagespeed();
};
UdaciTests.prototype.testPageSizeMinimumLocal = function(udArr) {
  // Only summing up images!
  // TODO: get scripts and document without CORS issues
  var inSizeRange = false;
  var max = udArr[0].maxSize || -1;
  var min = udArr[0].minSize || 0;
  var totalBytes = 0;
  var elemsWithBytes = [];  
  var imgSelectors = [
    ':not(picture) > [src]:not(script)',
    '[href]:not(a):not(link)'
  ]

  imgSelectors.forEach(function(val, index, arr) {
    var elems = document.querySelectorAll(val);
    elems = nodeListToArray(elems);
    elemsWithBytes = elemsWithBytes.concat(elems);
  })
  
  // get picture elems current srcs too
  var pictures = getArrayOfNodes('picture > img');
  pictures.forEach(function(val, index, arr) {
    elemsWithBytes = elemsWithBytes.concat(val);
  })

  function fireLoadEvent(evt) {
    if (evt.lengthComputable) {
      // evt.total the total bytes seted by the header
      totalBytes = totalBytes + evt.total;
      var loadEvent = new CustomEvent('src-loaded', {'detail': {'bytes': evt.total || 0, 'url': evt.currentTarget.responseURL}});
      document.querySelector('test-widget').dispatchEvent(loadEvent)
    } 
  }   

  function sendreq(url, evt) {  
    // TODO: better error handling
    try {
      var req = new XMLHttpRequest();     
      req.open('GET', url, true);
      req.onloadend = fireLoadEvent;
      req.send();
    } catch (e) {
      console.log(e);
      throw new Error("If you're seeing this error, you might need to serve the site through localhost.")
    }
  }

  elemsWithBytes.forEach(function(val, index, arr) {
    try {
      var url = val.currentSrc || val.src || val.href;
      // TODO: smarter way of handling CORS
      // this just checks the host
      if (url.search(location.host) > -1) sendreq(url);
    } catch (e) {
      throw new Error("Download failed: " + url);
    }
  })

  var requests = 0;
  document.querySelector('test-widget').addEventListener('src-loaded', function (e) {
    // e.url and e.url are available too
    requests = requests + 1;
    if (requests === elemsWithBytes.length) {
      if (max > -1 && max > totalBytes && min < totalBytes) {
        inSizeRange = true;
      } else if (max === -1 && min < totalBytes) {
        inSizeRange = true;
      }
      var pageBytesCollectionComplete = new CustomEvent('async-end', {'detail': {'passed': inSizeRange, 'bytes': totalBytes}})
      document.querySelector('test-widget').dispatchEvent(pageBytesCollectionComplete);
    }
  })
}
UdaciTests.prototype.testFindStringInDocument = function(udArr) {
  /*
  Expects an array of strings and passes if one of them is somewhere in the HTML
  */

  var isCorrect = false;
  var stringOpts = udArr[0].stringOpts;
  var docString = document.documentElement.innerHTML;
  stringOpts.forEach(function(val, index, arr) {
    if (docString.indexOf(val) !== -1) isCorrect = true;
  })
  return isCorrect;
}

var grader = new UdaciTests(graderProperties);