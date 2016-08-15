/*global MutationObserver, components, sourceSansProFont */

/**
 * @fileOverview This file provides the test widget module. It injects an iFrame inside the current document to display a list of tests.
 * @name test_widget.js<test_widget>
 * @author Etienne Prud’homme
 * @license MIT
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
  var lastFrameHeight = 0;
  var lastWindowHeight = null;

  // TODO: Should we use a link element instead?
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
        'text-align: left;' +
        'z-index: 99999 !important;' +
        '}' +

        '.test-widget-display:hover {' +
        'opacity: 1;' +
        '}';

  var innerStyles = '@font-face{' +
        'font-family: "Source Sans Pro";' +
        'src: url(data:font/ttf;base64,' +
        sourceSansProFont +
        ') format("truetype");' +
        '} ' +
        '* {' +
        'font-family: "Source Sans Pro", sans-serif;' +
        '}' +
        'body {' +
        'padding: 0.5em;' +
        'margin: 0;' +
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

        '.suite-title {' +
        'font-size: 1.25em;' +
        '}' +
        '.suite-code-container {' +
        'background: rgba(0,0,0,0.6);' +
        'color: #eee;' +
        'display: none;' +
        'padding: 6px 0.5em;' +
        'margin: 0.5em -0.5em;' +
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

  var template = {
    head: '    <title>Udacity Feedback</title>' +
      '    <meta charset="UTF-8">' +
      // Disabled until a solution is found. Because it’s an injected script, it
      // wouldn’t be secure to pass the extension path.
      // '    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro">' +
      '    <style>' + innerStyles + '</style>' +
      '  </head>',
    body: '  <body>' +
      '    <!-- test-widget component starts here -->' +
      '    <div class="udacity-header">Udacity Feedback</div>' +
      '    <div class="view-container">' +
      '    </div>' +
      '    <!-- test-widget component ends here -->' +
      '  </body>' +
      '<!-- test-widget.html ends here -->'
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

  /**
   * Get the widget document. It prevents direct access to the iFrame.
   * @returns {Document}
   */
  var _frameDocument = function() {
    return _frameContext().document;
  };

  /**
   * Calculate the height of the test-widget could have. It can’t be bigger than the window since it has position of fixed.
   * @returns {}
   */
  var _calculateFrameHeight = function() {
    var frameHeight = _frameDocument().body.offsetHeight;
    var windowHeight = window.innerHeight;
    return frameHeight < windowHeight ? frameHeight : windowHeight;
  };

  /**
   * Set the `testWidget` frame element height to its inner height (height of child document).
   */
  var _setFrameHeight = function() {
    var frameHeight = _calculateFrameHeight();
    // console.log("frameHeight = ", frameHeight);

    if(window.innerHeight !== lastWindowHeight || frameHeight !== lastFrameHeight) {
      lastWindowHeight = window.innerHeight;
      lastFrameHeight = frameHeight;
      frameElement.style.height =  frameHeight + 'px';
      // console.log("frameElement.style.height = ", frameElement.style.height);
    }
    // console.log("lastFrameHeight = ", lastFrameHeight);
    // console.log("lastWindowHeight = ", lastWindowHeight);
  };

  /**
   * Execute a callback function when the iFrame document changes.
   * @param {function} callback - The callback to call when the iFrame document changes.
   */
  var _onFrameChange = function(callback) {
    var frameDocument = _frameDocument();
    var observer = new MutationObserver(function(mutations) {
      // debugger;
      // console.log('Inside _onFrameChange MutationObserver. Mutation: ', mutations[i]);
      // console.log('Callback: ', callback.toString());
      callback(mutations);
    });
    observer.observe(frameDocument, {childList: true, attributes: true, characterData: true, subtree: true});
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
        tw.srcdoc = '';

        document.body.appendChild(tw);

        tw.onload = function() {
          frameElement = tw;

          window.addEventListener('resize', function() {
            _setFrameHeight();
          });

          _onFrameChange(_setFrameHeight);
          resolve(tw);
        };

        tw.onerror = function(e) {
          reject(e);
        };
      }).catch(function(e) {
        throw new Error('Couldn’t load the test widget: ' + e.message);
      });

    return promise;
  };


  /**
   * Calls {@link _buildFrame} and initialize {@link testResults}.
   */
  var _buildWidget = function() {
    // Wait for the iFrame to load since it would return null
    return _buildFrame().then(function() {
      var testWidgetDisplay = _frameDocument();

      // Reviewer: This is only local
      testWidgetDisplay.head.innerHTML = template.head;
      testWidgetDisplay.body.innerHTML = template.body;

      var outerCSS = document.createElement('style');
      outerCSS.id = 'outer-styles';

      // Reviewer: This is only local
      outerCSS.textContent = outerStyles;
      document.head.appendChild(outerCSS);

      // console.log("testWidgetDisplay = ", testWidgetDisplay);
      var viewContainer = testWidgetDisplay.querySelector('.view-container');
      // console.log("viewContainer = ", viewContainer);
      // initialize the view options
      var testResultsElem = components.createElement('test-results');
      viewContainer.appendChild(testResultsElem);
    });
  };

  /**
   * Removes the widget from the current Document.
   */
  var _killWidget = function() {
    var tw = document.getElementById(frameId);
    var styles = document.getElementById('outer-styles');

    document.body.removeChild(tw);
    document.head.removeChild(styles);
    frameId = null;
  };

  exports = {
    buildWidget: _buildWidget,
    killWidget: _killWidget,

    // TODO: Doesn’t seem to be used outside
    frameDocument: _frameDocument
  };

  return exports;
})();

// test-widget.js<test_widget> ends here
