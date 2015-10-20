/*
Udacity's library for immediate front-end feedback.

Version:      0.4
Tech:         HTML Imports,
              Custom Elements,
              gulp
url:          http://github.com/udacity/frontend-grading-engine
author:       Cameron Pittman
            
            New for version 0.4!
              * Now a Chrome Extension!
              * Editable tests! (inluding totally rewritten view logic)

            New for version 0.3!
              * Better security!
              * Better encapsulation!
              * Chaining test methods

Lexicon:
  * Active Test:    A test running against the page. Some logic returns true/false.
                    There are many different kind of active tests.
                    
  * Test Suite:     A collection of active tests that displays a code when appropriate.

  * Widget:         A collection of Test Suites.
                    Lives as a shadow DOM that exists as a child on the body.
*/

/**
 * Exposes GE (Grading Engine) interface
 * @return {Object} exports - the functions on the exports object
 */
;var GE = (function( window, undefined ){
  'use strict';
  var exports = {};
  var debugMode = false;