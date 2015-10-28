# Udacity Feedback Chrome Extension

Immediate, visual feedback about any website's HTML, CSS and JavaScript.

* Not sure what this is? Try the [walkthrough](http://labs.udacity.com/udacity-feedback-extension/).
* Just want to install? Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/fcglckhmjjmhkfkkngemmhmcolefiljf).

## Installing from Source

1. Clone this repo and `cd` into it
2. Install gulp (if necessary) - `npm install gulp`
3. Install dependencies - `npm install`
4. Build - `gulp watch` or just `gulp`
5. Load in Chrome
  * Open the [Extensions](chrome://extensions/) window
  * Check 'Developer Mode'
  * Click 'Load unpacked extension...'
  * Select `ext/`

## Loading Tests

### On sites you own

Add the following meta tag:

    <meta name="udacity-grader" content="relative_path_to_tests.json">

There are two optional attributes: `libraries` and `unit-tests`. `libraries` is always optional and `unit-tests` is only necessary for JS quizzes. More on JS tests here.*****

### On sites you don't own

Click on the Udacity browser action. Choose 'Load tests' and navigate to a JSON.

## API

### JSON

Typical structure is an array of:

    suite
    |_name
    |_code
    |_tests
      |_name
      |_description
      |_definition
      | |_nodes
      | |_collector
      | |_reporter
      |
      |_[flags]

Example:

    [{
      "name": "Learning Udacity Feedback",
      "code": "This can be an encouraging message",
      "tests": [
        {
          "description": "Test 1 has correct bg color",
          "definition": {
            "nodes": ".test1",
            "cssProperty": "backgroundColor",
            "equals": "rgb(204, 204, 255)"
          }
        }
      ]
    },
    {
      "name": "More 'dacity Feedback",
      "code": "Some message",
      "tests": [
        {
          "description": "Test 2 says 'Hello, world!'",
          "definition": {
            "nodes": ".test2",
            "get": "innerHTML",
            "hasSubstring": "^Hello, world!$"
          }
        },
        {
          "description": "Test 3 has larger columns",
          "definition": {
            "nodes": ".test3",
            "cssProperty": "width",
            "isGreaterThan": 159
          }
        },
        {
          "description": "Test 4 has two columns",
          "definition": {
            "nodes": ".test4",
            "get": "count",
            "equals": 2
          }
        },
        {
          "description": "Test 5 has been dispatched",
          "definition": {
            "waitForEvent": "ud-test",
            "exists": true
          },
          "flags": {
            "noRepeat": true
          }
        }
      ]
    }]

*Note that the feedback JSON must be an array of objects*

* `"name"`: the name of the suite. The word "Test" or "Tests" gets appended when this name shows up in the widget as a heading for its child tests.
* `"code"`: a message to display when all tests in the suite pass. Why is it called a code? It's sometimes the code I make students copy and paste into a quiz on the Udacity site to prove they finished the quiz.
* `"tests"`: an array of test objects
  * `"description"`: shows up in the test widget. Try to keep titles short, as long titles don't wrap well in the current version.
  * `"definition"`: an object with collector and reporter properties. More on this below.
  * `"flags"`: optional flags to alter the way a test is run. The most common is `noRepeat`, which ensures that a test runs only once rather than repeatedly.

### How to write a `"definition"`

Think about this sentence as you write tests:

> I want the nodes with [selector] to have [some property] that [compares to some value].

#### 1) Start with `"nodes"`. Every* test against the DOM needs some nodes to examine. This is a **collector**.

    "definition": {
      "nodes": "selector",
      ...
    }

*\* Two exceptions: collecting a user-agent string or in conjunction with `"waitForEvent"`.*

#### 2) Decide what property you want to test.

**CSS:**

    "definition": {
      "nodes": ".anything"
      "cssProperty": "camelCaseProperty",
      ...
    }

The `"cssProperty"` can be the camelCase version of [any CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Properties_Reference).

**Attribute:**

    "definition": {
      "nodes": "input"
      "attribute": "for",
      ...
    }

Any attribute works.

**Absolute Position:**

    "definition": {
      "nodes": ".left-nav"
      "absolutePosition": "side",
      ...
    }

Side must be one of: `top`, `left`, `bottom`, or `right`. Currently, the position returned is relative to the viewport, which TBH, seems odd. Be careful because the behavior of absolutePosition may change in the future.

**Count, innerHTML, ChildPosition, and UAString:**

    "definition": {
      "nodes": ".box"
      "get": "count",
      ...
    }

These four tests use `"get"` and they are the only tests that use `"get"`. Each of them returns basically what you'd expect. Remember the asterix from earlier about the necessity of `"nodes"`? User-agent strings are one of the exceptions - you can `"get": "UAString"` without `"nodes"`.

"Child position? I haven't seen anything about children." - a question you might be asking yourself. Let me answer it.

**Children**

    "definition": {
      "nodes": ".flex-container",
      "children": "div",
      "absolutePosition": "side",
      ...
    }

`"children"` is a deep children selector. In this example, it was used to select all the divs inside a flex container. Now, reporters will run tests against all of the child divs, not the parent flex container.

#### 3) Decide how you want to grade the values you just collected. This is a **reporter**.

**Equals**

    "definition": {
      "nodes": ".flex",
      "get": "count",
      "equals": 4
    }
 
or

    "definition": {
      "nodes": "input.billing-address",
      "attribute": "for",
      "equals": "billing-address"
    }

Set `"equals"` to either strings or numbers and looks for an exact match. In the first example, the test passes when the count of nodes returned by the selector equals for. In the second, the `for` attribute of `<input class="billing-address">` must be set to `"billing-address"`. If you want to compare strings and would prefer to use regex, try `"hasSubstring"`.

**Exists**

    "definition": {
      "nodes": "input.billing-address",
      "attribute": "for",
      "exists": true
    }

In this example, rather than looking for a specific `for`, I'm just checking to see that it exists at all. The value doesn't matter. If `"exists": false`, then the test will only pass if the attribute does not exist.

**Comparison**

    "definition": {
      "nodes": ".flex",
      "get": "count",
      "isFewerThan": 4
    }

`"isFewerThan"` and `"isGreaterThan"` share identical behavior.

    "definition": {
      "nodes": ".flex",
      "get": "count",
      "isInRange": {
        "lower": 4,
        "upper": 10
      }
    }

Set an `"upper"` and a `"lower"` value for `"isInRange"`.

**Substrings**

    "definition": {
      "nodes": ".text",
      "get": "innerHTML",
      "hasSubstring": "([A-Z])\w+"
    }

Run regex tests against strings with `"hasSubstring"`. If 1 or more match groups are returned, the test passes.

**Utility Properties**

    "definition": {
      "nodes": ".text",
      "get": "innerHTML",
      "not": true,
      "hasSubstring": "([A-Z])\w+"
    }

Switch behavior with `"not"`. A failing test will now pass and vice versa.

    "definition": {
      "nodes": ".title",
      "cssProperty": "marginTop",
      "limit": 1,
      "equals": 10
    }

Remember, by default every node collected by `"nodes"` or `"children"` must pass the test specified. To change that, use `"limit"`. Current values supported are `1` and `"some"`. If `1`, only one of the nodes collected should pass. If more than one node passes, the test fails. In the case of `"some"`, `1 < number < all` nodes should pass in order for the test to pass. If all, one, or 0 nodes pass, then the test fails.

### JavaScript Tests

    "definition": {
      "waitForEvent": "custom-event",
      "exists": true
    }

For security reasons, you can only run JavaScript tests against a page that you control.

*** write this up! ***



## How Udacity Feedback Works

At the core of Udacity Feedback is the grading engine. The grading engine performs two tasks: collecting information from the DOM and reporting on it. Each test creates its own instance of the grading engine which queries the DOM once a second (unless otherwise specified).

### Some helpful hints for understanding the source code:

* **TA** (Teaching Assistant). The TA orchestrates the DOM querying and comparison logic of the grading engine. There is a collection aspect (src/js/TACollectors.js) and a reporting aspect (src/js/TAReporters.js). Collectors pull info from the DOM. Reporters are responsible for the logic of evaluating the information. The TA executes tests as a series of async methods pulled from a Queue.
* **Gradebook**. Every TA has an instance of a Gradebook, which determines the pass/fail state of a test. Some tests have multiple parts (eg. examining every element of some class to ensure that all have a blue background - each element is a part of the test). The Gradebook compares the parts to the comparison functions as set by the TA and decides if the test has passed or failed.
* **Target**. A Target represents a single piece of information pulled from the DOM. *Almost* every Target has an associated `element` and some `value`. Targets may include child Targets. Tests that result in multiple pieces of information create a tree of Targets (sometimes called a 'Bullseye' in comments).
* **Suite** and **ActiveTest**. An individual test (ie. one line in the widget) is an instance of an ActiveTest. ActiveTests are organized into Suites. Each Suite comes with its own name, which is displayed above its set of tests in the widget.
* **Registrar**. This file contains the logic for creating new tests when the Feedback is turned on and removing tests when the Feedback is turned off.
* The `<test-widget>` and everything inside of it were built as custom elements with HTML imports.

Did you read this far? You're awesome :)