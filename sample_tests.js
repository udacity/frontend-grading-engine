var testSuites = [
  {
    name: "div checker",
    code: "You found all the divs!"
  }
]

var s = registerSuites(testSuites);

var obj = {
  description: "find all the divs on the page",
  active_test: function() {
    return iwant('divs').count().toStrictEqual(1);
  },
  flags: [
    {
      async: true
    }
  ]
}

s.registerTest('div checker', obj)