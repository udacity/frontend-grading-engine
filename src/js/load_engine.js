  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
  var importScript = (function (oHead) {

    function loadError (oError) {
      throw new URIError("The script " + oError.target.src + " is not accessible.");
    }

    return function (sSrc, fOnload) {
      var oScript = document.createElement("script");
      oScript.type = "text\/javascript";
      oScript.onerror = loadError;
      if (fOnload) { oScript.onload = fOnload; }
      oHead.appendChild(oScript);
      oScript.src = sSrc;
    }
  })(document.head || document.getElementsByTagName("head")[0]);

  var Widget = function() {    
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
    
    // using try-catch to load from localhost if possible, fallback to github.io
    try {
      link.href = '/frontend-grading-engine/templates/test-widget.html'
    } catch (e) {
      link.href = 'http://udacity.github.io/frontend-grading-engine/templates/test-widget.html'
    }
    link.onload = function(e) {
      console.log('Loaded Udacity Grading Engine');
    }
    link.onerror = function(e) {
      console.log('Error loading import: ' + e.target.href);
    }
    document.head.appendChild(link);
  }