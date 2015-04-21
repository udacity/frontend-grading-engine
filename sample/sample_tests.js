var testSuites = [
  {
    name: "div checker",
    code: "You found all the divs!"
  }
]

var s = GE.registerSuites(testSuites);

var test = {

  description: "find all the divs on the page",
  active_test: function() {
    var iwant = new Test();
    var foo = iwant.count().toStrictEqual(1);
    console.log(foo)
    console.log('hi')
    return iwant.count().toStrictEqual(1);
  },
  flags: [
    {
      async: true
    }
  ]
  
}

s.registerTest('div checker', test)