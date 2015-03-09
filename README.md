# Udacity Font-End Grading Engine
 - v0.11

Providing immediate feedback for front-end code

![Screenshot of Grading Engine](images/overview.png)

*Screenshot of Grading Engine*

## What It Is ##

A platform to run tests against the `document` and provide feedback. Any edits made in HTML or through DevTools can be registered by the grading engine.

The tests are organized into suites, each of which consists of multiple tests. Once a suite of tests passes, a code is displayed. Copy the code into the Udacity classroom to pass the quiz.

![A test suite and completion code](images/suite_with_code.png)

*A test suite and completion code*

## Reading the feedback ##

Each test refreshes once a second. While the test is pending completion, it will display in red and start with an ✗ mark. Once a test is completed, a ✓ will appear and the test will turn green.

![A test that passed and a test that's pending completion](images/correct_and_incorrect.png)

*A test that passed and a test that's pending completion*

## Writing Tests... aka The API ##

    <script async type='text/javascript' src='udacity.github.io/frontend-grading-engine/ud-grading-engine-v0.1.js'></script>`


    var suites = [
      {
        name: "Project Part 1",
        code: "notarealcode",
        tests: [
          {
            func: "testDOMelemCSS",
            params: [
              {
                selector: "article img",
                property: "max-width",
                value: "100%"
              }
            ],
            desc: "&lt;img&gt;s have max-widths of 100%"
          },
          {
            func: "testDOMelemCSS",
            params: [
              {
                selector: "article",
                property: "width",
                value: "600-1200px"
              }
            ],
            desc: "&lt;articles&gt; are reasonably wide (600-1200px)" // descriptions must be unique
          }
        ]
      },
      {
        name: "Project Part 2",
        code: "notarealcode",
        tests: [
          {
            func: "testDOMelemDoesntExist",
            params: [
              {
                selector: "img[src='images/smiley_face.png']"
              }
            ],
            desc: "smiley_face.png is gone"
          },
          {
            func: "testFindStringInDocument",
            params: [
              {
                stringOpts: ["☺", "&#9786;"] // looking for one of these
              }
            ],
            desc: "Smiley face is unicode"
          }
        ]
      },
      {
        name: "Project Part 3",
        code: "notarealcode",
        tests: [
          {
            func: "testDOMelemCount",
            params: [
              {
                selector: "picture",
                count: 8
              }
            ],
            desc: "There are 8 &lt;picture&gt;s on the page"
          }
        ]
      }
    ]

    var graderProperties = {
      suites: suites
    }


