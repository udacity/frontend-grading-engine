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

  var outerStyles = '/* The iFrame class. Note that an iFrame acts like a normal element */' +
        '.test-widget-display {' +
        'resize: both;' +
        'direction: rtl;' +
        'position: fixed;' +
        'min-width: 325px;' +
        'max-width: 500px;' +
        'max-height: 100%;' +
        'overflow-y: auto;' +

        'border: none;' +

        'background-color: rgba(230, 230, 230, 0.9);' +
        'opacity: 0.5;' +
        'transition: opacity 0.3s, max-height 0.3s;' +
        '' +
        'top: 0px;' +
        'right: 0px;' +
        'padding: 0.5em;' +
        'text-align: left;' +
        'z-index: 99999 !important;' +
        '}' +

        '.test-widget-display:hover {' +
        'opacity: 1;' +
        '}';

  var innerStyles = '* {' +
        'font-family: "Source Sans Pro", sans-serif;' +
        '}' +

        'img {' +
        'height: 2.25em;' +
        'margin-bottom: -0.75em;' +
        '}' +

        '.udacity-header {' +
        'font-size: 2em;' +
        '}' +

        '.test-desc {' +
        'width: 100%;' +
        '}' +

        '.correct {' +
        'color: #060;' +
        '-webkit-animation-duration: 0.5s;' +
        '-webkit-animation-name: popin;' +
        'animation-duration: 0.5s;' +
        'animation-name: popin;' +
        '}' +

        '.correct::before {' +
        'content: "✓ ";' +
        '}' +

        '.incorrect {' +
        'color: #900;' +
        '}' +

        '.incorrect::before {' +
        'content: "✗ ";' +
        '}' +

        '.error {' +
        'color: #a48700;' +
        '}' +

        '.error::before {' +
        'content: "?? ";' +
        '}' +

        '.flex-container {' +
        'display: flex;' +
        'justify-content: space-between;' +
        '}' +

        '.toggle-display {' +
        'display: inline-block;' +
        'float: right;' +
        'height: 2em;' +

        'color: white;' +

        'box-sizing: border-box;' +

        'border-radius: 2px;' +
        'border-color: #777;' +
        'border: 1px solid transparent;' +

        'background-color: #777;' +

        'cursor: pointer;' +
        '}' +

        '.toggle-display:hover:not(:disabled) {' +
        'border-color: #555;' +
        'background-color: #555;' +
        '}' +

        '.toggle-display:disabled {' +
        'background-color: #888;' +
        'color: #ddd;' +
        '}' +

        '.hide {' +
        'max-height: 0px;' +
        'overflow: hidden;' +
        '}' +

        '.shown::before {' +
        'content: "Hide";' +
        '}' +

        '.hidden::before {' +
        'content: "Show";' +
        '}' +

        '.suite-code {' +
        'background: rgba(0,0,0,0.6);' +
        'color: #eee;' +
        'margin: 6px -0.5em;' +
        '}' +
        '.suite-code > div {' +
        'padding: 6px 0.5em;' +
        'text-align: center;' +
        '}' +

        '/* Custom animation for the iFrame */' +
        '@keyframes popin {' +
        'from {' +
        'font-size: 1em;' +
        '}' +

        '25% {' +
        'font-size: 1.5em;' +
        '}' +

        'to {' +
        'font-size: 1em;' +
        '}' +
        '}';

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
