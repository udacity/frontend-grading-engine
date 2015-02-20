/*
Udacity's (growing) library for immediate front-end feedback.

Version 0.03

Cameron Pittman 2015
*/

/*
Class describes an instance of the Udacity test engine.
Abstraction allows us to create multiple scopes for test runs.

*/
var UdaciTests = function(title, tests, code, refreshRate) {
  var that = this;
  this.runGradeLoop = function() {
    var isCorrect = false;

    that.createResultsDisplay();

    var testStatuses = [];
    // for (_i in arr) testStatuses.push(arr[_i]);
    for (_i in tests) testStatuses.push(tests[_i]);

    function hasTestStatusDiff(obj) {
      var update = false;
      for (t in testStatuses) {
        if (obj.desc === testStatuses[t].desc && obj.correct === testStatuses[t].correct) {
          obj.needsUpdate = false;
          obj.isNewTest = false;
          break;
        } else if (obj.desc === testStatuses[t].desc && obj.correct !== testStatuses[t].correct) {
          obj.needsUpdate = true;
          obj.isNewTest = false;
          testStatuses[t].correct = obj.correct;
          update = obj;
        } else {
          obj.isNewTest = true;
          obj.needsUpdate = true;
          update = obj;
          console.log(obj, testStatuses[t]);
        }
      }
      return update;
    }

    /*
    Thank you StackOverflow!
    http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
    */
    function executeFunctionByName(functionName, context) {
      var args = [].slice.call(arguments).splice(2);
      var namespaces = functionName.split(".");
      var func = namespaces.pop();
      for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      return context[func].apply(this, args);
    }

    var gradeLoop = setInterval(function() {
      for (i in tests) {
        // var testCorrect = tests[i].test(tests[i].params);
        var testCorrect = executeFunctionByName(tests[i].test, that, tests[i].params);
        var testObj = {
          desc: tests[i].desc,
          correct: testCorrect
        }
        that.updateResultsDisplay(testObj);
        if (tests.indexOf(tests[i]) === 0) {
          isCorrect = testCorrect;
        } else {
          isCorrect = isCorrect && testCorrect;
        }
      }

      // An ugly hack to make sure that all of the tests are displayed
      // properly before the code is displayed.
      // TODO: Remove when possible!
      var gradeDisplays = document.querySelectorAll('.grade-display > div');
      gradeDisplays = Array.prototype.slice.apply(gradeDisplays);
      var allGreen = false;
      for (ag in gradeDisplays) {
        if (gradeDisplays.indexOf(gradeDisplays[ag]) === 0 && gradeDisplays[ag].style.color === 'green') {
          allGreen = true;
        } else if (gradeDisplays[ag].style.color === 'green') {
          allGreen = allGreen && true;
        }
      }

      if (isCorrect && allGreen) {
        that.updateResultsDisplay(testObj, function(){
          clearInterval(gradeLoop)
          that.displayCode(code);
        })
      }
    }, refreshRate)
  }

  this.title = title;
  var iframeElem;

  this.testing = function(){
    console.log("testing!");
    return true;
  }

  this.testMediaQueries = function(udArr) {
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
  this.createResultsDisplay = function(name) {
    // TODO: display a title for the results display
    var head = document.querySelector('head');
    var fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css';
    head.appendChild(fontAwesome);

    var gradeDisplayDiv = document.createElement('div');
    gradeDisplayDiv.classList.add('grade-display');
    gradeDisplayDiv.style.position = 'absolute';
    gradeDisplayDiv.style.minWidth = '200px';
    gradeDisplayDiv.style.backgroundColor = 'rgba(112, 128, 144, 0.5)';
    gradeDisplayDiv.style.right = '0px';
    gradeDisplayDiv.style.top = '0px';
    gradeDisplayDiv.style.padding = "0.5em";

    document.querySelector('body').appendChild(gradeDisplayDiv);
  }
  this.updateResultsDisplay = function(test, cb) {

    function addTestDisplay(_test) {
      var newTest = document.createElement('div');
      newTest.classList.add('udTest');
      newTest.innerHTML = _test.desc;
      newTest.color = 'red';
      var marker = document.createElement('i');
      marker.classList.add('fa');
      newTest.appendChild(marker);

      document.querySelector('.grade-display').appendChild(newTest);
    }

    function updateTestDisplay(testObj) {
      var displayedTests = document.querySelector('.grade-display').children;
      displayedTests = Array.prototype.slice.apply(displayedTests);

      var check = 'fa-check';
      var ex = 'fa-times';
      var onScreen = false;

      for (dt in displayedTests) {
        if (displayedTests[dt].innerHTML.indexOf(testObj.desc) > -1) {
          onScreen = true;
          var icon = displayedTests[dt].querySelector('i');
          if (testObj.correct === true) {
            icon.classList.add(check);
            icon.classList.remove(ex);
            displayedTests[dt].style.color = 'green';
          } else {
            icon.classList.add(ex);
            icon.classList.remove(check);
            displayedTests[dt].style.color = 'red';
          }
        } 
      }
      if (!onScreen) addTestDisplay(testObj);
    }
    updateTestDisplay(test);
    var callback = cb || function(){};
    callback();
  }
  this.displayCode = function(_code) {
    var gd = document.querySelector('.grade-display');
    var code = document.createElement('div');
    code.innerHTML = "Code:<br>" + _code;
    gd.appendChild(code);
    // gd.style.cursor = "pointer";
    // gd.onclick = function(){alert("Great job! Here's your code: \n" + _code)}
  }
}
UdaciTests.prototype.testViewportWidth = function(expected) {
  var isCorrect = false;
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  width === expected[0] ? isCorrect = true : isCorrect = false;
  // console.log("width: " + isCorrect);
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
UdaciTests.prototype.testDOMelemAttr = function(udArr) {
}
UdaciTests.prototype.testDOMelemCSS = function(udArr) {
}

































