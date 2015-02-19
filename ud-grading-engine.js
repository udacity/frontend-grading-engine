/*
Udacity's (growing and kinda ugly) library for grading sites modified with DevTools.

Version 0.02

Cameron Pittman
*/

// TODO: stop using this and switch to Array.prototype.slic()
function toArray(obj) {
  var array = [];
  // iterate backwards ensuring that length is an UInt32
  for (var k = obj.length >>> 0; k--;) { 
    array[k] = obj[k];
  }
  return array;
}

function isViewportSet() {
  var hasRightMeta = false;
  var correctViewportContent = 'width=device-width,initial-scale=1.0';
  var metas = document.querySelectorAll('meta');
  metas = toArray(metas);
  metas.forEach(function(val) {
    var content, name;
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

function isViewportWidthCorrect(expected) {
  var isCorrect = false;
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  width === expected[0] ? isCorrect = true : isCorrect = false;
  // console.log("width: " + isCorrect);
  return isCorrect;
}

function isViewportHeightCorrect(expected) {
  var isCorrect = false;
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  height === expected[0] ? isCorrect = true : isCorrect = false;
  // console.log("height: " + isCorrect);
  return isCorrect;
}


var iframeElem;
function testMediaQueries(udArr) {
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

function isDPRCorrect(expected) {
  var isCorrect = false;
  var dpr = window.devicePixelRatio;
  dpr === expected[0] ? isCorrect = true : isCorrect = false;
  return isCorrect;
}

function isUACorrect(expected) {
  var isCorrect = false;
  var ua = window.navigator.userAgent;
  ua === expected[0] ? isCorrect = true : isCorrect = false;
  return isCorrect;
}

function createResultsDisplay() {
  var head = document.querySelector('head');
  var fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css';
  head.appendChild(fontAwesome);

  var gradeDisplayDiv = document.createElement('div');
  gradeDisplayDiv.classList.add('grade-display');
  gradeDisplayDiv.style.position = 'absolute';
  gradeDisplayDiv.style.minWidth = '200px';
  gradeDisplayDiv.style.backgroundColor = 'rgba(112, 128, 144, 0.9)';
  gradeDisplayDiv.style.right = '0px';
  gradeDisplayDiv.style.top = '0px';
  gradeDisplayDiv.style.padding = "0.5em";

  document.querySelector('body').appendChild(gradeDisplayDiv);
}

function updateResultsDisplay(test, cb) {

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
    displayedTests = toArray(displayedTests);

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

function displayCode(_code) {
  var gd = document.querySelector('.grade-display');
  var code = document.createElement('div');
  code.innerHTML = "Code:<br>" + _code;
  gd.appendChild(code);
  // gd.style.cursor = "pointer";
  // gd.onclick = function(){alert("Great job! Here's your code: \n" + _code)}
}

function runGradeOnce(arr, code) {
  
}

// The grading engine lives here.
function runGradeLoop(arr, code) {
  var isCorrect = false;

  createResultsDisplay();

  var testStatuses = [];
  for (_i in arr) testStatuses.push(arr[_i]);

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

  var gradeLoop = setInterval(function() {
    for (i in arr) {
      var testCorrect = arr[i].test(arr[i].params);
      var testObj = {
        desc: arr[i].desc,
        correct: testCorrect
      }
      updateResultsDisplay(testObj);
      if (arr.indexOf(arr[i]) === 0) {
        isCorrect = testCorrect;
      } else {
        isCorrect = isCorrect && testCorrect;
      }
    }

    // An ugly hack to make sure that all of the tests are displayed
    // properly before the code is displayed.
    // TODO: Remove when possible!
    var gradeDisplays = document.querySelectorAll('.grade-display > div');
    gradeDisplays = toArray(gradeDisplays);
    var allGreen = false;
    for (ag in gradeDisplays) {
      if (gradeDisplays.indexOf(gradeDisplays[ag]) === 0 && gradeDisplays[ag].style.color === 'green') {
        allGreen = true;
      } else if (gradeDisplays[ag].style.color === 'green') {
        allGreen = allGreen && true;
      }
    }

    if (isCorrect && allGreen) {
      updateResultsDisplay(testObj, function(){
        clearInterval(gradeLoop)
        displayCode(code);
      })
    }
  }, 1000)
}