/**
 * @fileoverview This file provides the test widget module. It injects an iFrame inside the current document to display a list of tests.
 */

/**
 * Module to handle the test widget.
 * @returns {Object} Methods to build the widget ({@link buildWidget}) and kill it ({@link killWidget}).
 * @throws {Error} Initialization errors.
 */
var testWidget = (function() {
  'use strict';
  var exports = {};
  var frameId = null;
  var frameElement = null;
  var lastWindowHeight = null;


  var template = '<!doctype html>'+
        '<html>' +
        '  <!-- This is the iFrame base document -->' +
        '  <head>' +
        '    <title>Udacity Feedback</title>' +
        '    <meta charset="UTF-8">' +
        '    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro">' +
        '    <style>' + innerStyles + '</style>' +
        '  </head>' +
        '  <body>' +
        '    <!-- test-widget component starts here -->' +
        '    <div class="udacity-header">Udacity Feedback</div>' +
        '    <div class="view-container">' +
        '    </div>' +
        '    <!-- test-widget component ends here -->' +
        '  </body>' +
        '</html>' +
        '<!-- test-widget.html ends here -->';

  /**
   * Calculate the height of the test-widget could have. It can’t be bigger than the window since it has position of fixed.
   * @returns {}
   */
  var _calculateFrameHeight = function() {
    var frameHeight = frameDocument().body.scrollHeight;
    var windowHeight = window.innerHeight;
    return frameHeight < windowHeight ? frameHeight : windowHeight;
  };

  var _setFrameHeight = function() {
    if(window.innerHeight !== lastWindowHeight) {
      lastWindowHeight = window.innerHeight;
      frameElement.style.height = _calculateFrameHeight() + 'px';
    }
  };

  /**
   * Initializes the widget with its random ID (Not really useful) and append the widget to the current Document. The widget is an iFrame
   * @returns {Document} The iFrame document.
   * @throws {Error} The test widget can’t be loaded.
   */
  var _buildFrame = function() {
    frameId = 'tw-' + Math.floor(Math.random() * 100000000000).toString();

    // Since the iFrame loading is asynchronous
    var promise = new Promise(
      function(resolve, reject) {
        var tw = document.createElement('iframe');

        tw.id = frameId;
        tw.className = 'test-widget-display';
        tw.srcdoc = template;

        document.body.appendChild(tw);

        tw.onload = function() {
          frameElement = tw;

          // window.addEventListener('resize', function() {
          //   _setFrameHeight();
          // });

          // window.setInterval(function() {
          //   _setFrameHeight();
          // }, 100);
          resolve(tw);
        };

        tw.onerror = function(e) {
          reject(e);
        };
      }).catch(function(e) {
        throw new Error('Couldn’t load the test widget.');
      });

    return promise;
  };


  /**
   * Calls {@link _buildFrame} and initialize {@link testResults}.
   */
  var buildWidget = function() {
    // Wait for the iFrame to load since it would return null
    return _buildFrame().then(function() {
      var testWidgetDisplay = frameDocument();

      var outerCSS = document.createElement('style');
      outerCSS.innerHTML = outerStyles;
      document.head.appendChild(outerCSS);

      console.log("testWidgetDisplay = ", testWidgetDisplay);
      var viewContainer = testWidgetDisplay.querySelector('.view-container');
      console.log("viewContainer = ", viewContainer);
      // initialize the view options
      var testResultsElem = components.createElement('test-results');
      viewContainer.appendChild(testResultsElem);
      Promise.resolve();
    });
  };

  /**
   * Removes the widget from the current Document.
   */
  var killWidget = function() {
    var tw = document.getElementById(frameId);

    document.body.removeChild(tw);
    frameId = null;
  };

  /**
   * Get the widget document. It prevents direct access to the iFrame.
   * @returns {Document}
   */
  var frameDocument = function() {
    return _frameContext().document;
  };

  /**
   * Returns the frame context.
   * @returns {Document} The current
   * @throws {Error} Errors about bad initialization.
   * @private
   */
  var _frameContext = function () {
    if(frameId === null) {
      throw new Error('The widget must first be created.');
    }
    var tw = document.getElementById(frameId);

    if(tw === null) {
      throw new Error('The “' + frameId + '” iframe doesn’t exist.');
    }

    // Compatibility fix
    return tw.contentWindow || tw.contentDocument.document || tw.contentDocument;
  };

  return {
    buildWidget: buildWidget,
    killWidget: killWidget,

    // TODO: Doesn’t seem to be used outside
    frameDocument: frameDocument
  };
})();

// test-widget.js ends here
