var suite1 = GE.registerSuite({
  name: "div checker",
  code: "I'm a cool code!"
});

suite1.registerTest({
  description: "There are less than 10 divs on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('div').count.toBeLessThan(10);
  },
  flags: [
    {
      async: false
    }
  ]
})

suite1.registerTest({
  description: "There are less than 1 h1s on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('h1').count.toBeLessThan(1);
  }
})

suite1.registerTest({
  description: "Each div is pink",
  active_test: function(iwant) {
    return iwant.theseNodes('div').cssProperty('backgroundColor').toEqual('rgb(255, 204, 204)');
  }
})

suite1.registerTest({
  description: "There's a p tag",
  active_test: function(iwant) {
    return iwant.theseNodes('p').toExist;
  }
})

suite1.registerTest({
  description: "box 5 has a test attribute",
  active_test: function(iwant) {
    return iwant.theseNodes('.box5').attribute('test').toExist;
  }
})

suite1.registerTest({
  description: "box 5 test attribute == 'hi'",
  active_test: function(iwant) {
    return iwant.theseNodes('.box5').attribute('test').toEqual('hi');
  }
})

suite1.registerTest({
  description: "all boxes have test attribute",
  active_test: function(iwant) {
    return iwant.theseNodes('.box').attribute('test').toExist;
  }
})

suite1.registerTest({
  description: "no boxes have test attribute",
  active_test: function(iwant) {
    return iwant.theseNodes('.box').attribute('test').not.toExist;
  }
})

suite1.registerTest({
  description: "UA string is mine",
  active_test: function(iwant) {
    return iwant.UAString.toEqual("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36");
  }
})