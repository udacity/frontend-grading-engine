var iwant = new GE.Test();

var suite1 = GE.registerSuite({
  name: "div checker",
  code: "Who's awesome? You're awesome :)"
});

suite1.registerTest({
  description: "There are 9 divs on the page",
  active_test: function() {
    return iwant.theseNodes('div').count().toEqual(9);
  },
  flags: [
    {
      async: false
    }
  ]
})

suite1.registerTest({
  description: "There is 1 h1 on the page",
  active_test: function() {
    return iwant.theseNodes('h1').count().toEqual(1);
  }
})