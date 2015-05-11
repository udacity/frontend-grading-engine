/***
 *    ______ _____   _____               _ _               _____            _            
 *    |  ___|  ___| |  __ \             | (_)             |  ___|          (_)           
 *    | |_  | |__   | |  \/_ __ __ _  __| |_ _ __   __ _  | |__ _ __   __ _ _ _ __   ___ 
 *    |  _| |  __|  | | __| '__/ _` |/ _` | | '_ \ / _` | |  __| '_ \ / _` | | '_ \ / _ \
 *    | |   | |___  | |_\ \ | | (_| | (_| | | | | | (_| | | |__| | | | (_| | | | | |  __/
 *    \_|   \____/   \____/_|  \__,_|\__,_|_|_| |_|\__, | \____/_| |_|\__, |_|_| |_|\___|
 *                                                  __/ |              __/ |             
 *                                                 |___/              |___/              
 */
/*                    Udacity's library for immediate front-end feedback.

                  Version:      0.3
                  Tech:         HTML Imports,
                                Custom Elements,
                                grunt
                  url:          http://github.com/udacity/frontend-grading-engine
                  author:       Cameron Pittman

    Usage:
      // TODO


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

  * Engine:         The logic used to compare some active tests with the document.



Copyright (c) 2015 Cameron Pittman

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. I
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHEHERIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
    Exposes GE (Grading Engine) interface
    
    returns: exports
*/
;var GE = (function( window, undefined ){
  'use strict';
  var exports = {};