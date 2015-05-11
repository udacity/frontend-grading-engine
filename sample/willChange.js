var willChangeSuite = GE.registerSuite({
  name: "will-change",
  code: "willwhatchange?",
});

willChangeSuite.registerTest({
  description: "All the boxes are on the page.",
  active_test: function (iwant) {
    return iwant.theseNodes('.box').count.toEqual(120);
  }
});

willChangeSuite.registerTest({
  description: "Elements of class 'box' are will-changed.",
  active_test: function (iwant) {
    return iwant.theseNodes('.box').cssProperty('will-change').toEqual('transform');
  }
});