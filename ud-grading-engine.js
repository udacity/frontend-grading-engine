/*
Udacity's (growing) library for immediate front-end feedback.

Version 0.03

Cameron Pittman 2015
*/

// Thanks StackOverflow!
// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
function arrEquals(array1, array2) {
  // if the other array is a falsy value, return
  if (!array1 || !array2)
    return false;

  // compare lengths - can save a lot of time 
  if (array1.length != array2.length)
    return false;

  for (var i = 0, l=array1.length; i < l; i++) {
    // Check if we have nested arrays
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!array1[i].equals(array2[i]))
        return false;       
    } else if (array1[i] != array2[i]) { 
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;   
    }           
  }       
  return true;
}

/*
Class describes an instance of the Udacity test engine.
*/
var UdaciTests = function(title, tests, code, refreshRate) {
  // import templates
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = '../../../../frontend-grading-engine/templates/test-suite.html'
  link.onload = function(e) {};
  link.onerror = function(e) {};
  document.head.appendChild(link);

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
  // TODO: refactor so that content comes from expected
  var correctViewportContent = 'width=device-width,initial-scale=1.0';
  var metas = document.querySelectorAll('meta');
  metas = Array.prototype.slice.apply(metas);
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
UdaciTests.prototype.testDOMelemCount = function(udArr) {
  var rightCount = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  if ((elems.length) === udArr[0].count) rightCount = true;
  return rightCount;
}
UdaciTests.prototype.testDOMelemsCounts = function(udArr) {
  // for multiple sets of the same parent > child counts
  // run tests like: make sure all pictures have two sources
  var rightCounts = false;
  var parentElems = document.querySelectorAll(udArr[0].parentSelector);
  parentElems = Array.prototype.slice.apply(parentElems);

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
  if ((elems.length) > 0) exists = true;
  return exists;
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
  var separation = right.offsetLeft - (left.offsetLeft + left.offsetWidth);
  if (separation === udArr[0].distance) separatedCorrectly = true;
  return separatedCorrectly;
}
UdaciTests.prototype.testDOMelemAbsolutePosition = function(udArr) {
  var correctSpot = false;
  var elem = document.querySelector(udArr[0].selector);

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
  var attr = udArr[0].attr;
  var theirAttr = elem.getAttribute(attr);

  if (theirAttr || theirAttr === "") hasAttr = true;
  return hasAttr;
}
UdaciTests.prototype.testDOMelemAttrContent = function(udArr) {
  // for elems that must exist
  var hasCorrectAttr = false;
  var elem = document.querySelector(udArr[0].selector);
  var theirAttrValue = elem.getAttribute(udArr[0].attr);

  udArr[0].values.forEach(function(val) {
    if (val.search(",") > -1) {
      var us = val.replace(" ,", ",").replace(", ", ",");
      us = us.split(",").sort();
      try {
        var them = theirAttrValue.replace(" ,", ",").replace(", ", ",");
        them = them.split(",").sort();
      } catch (e) {
        var them = [];
      }
      if (arrEquals(us, them)) hasCorrectAttr = true;
    } else {
      if (us === them) hasCorrectAttr = true;
    }
  })

  return hasCorrectAttr;
}
UdaciTests.prototype.testDOMelemAttrApproxContent = function(udArr) {
  // for elems that may or may not exist
  // TODO: too much looping, try using more ||
  var hasCorrectAttr = false;
  var elems = document.querySelectorAll(udArr[0].selector);
  elems = Array.prototype.slice.apply(elems);

  elems.forEach(function(elem) {
    udArr[0].attrs.forEach(function(attr, index) {
      var theirAttrValue = elem.getAttribute(attr);
      udArr[0].values.forEach(function(udValue, jindex) {
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
UdaciTests.prototype.testDOMelemChildrenExist = function(udArr) {

}
UdaciTests.prototype.testPictureElemSources = function(udArr) {

}
































