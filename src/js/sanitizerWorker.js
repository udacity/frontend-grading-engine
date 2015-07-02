/*
TODO: make sure no XHRs can happen
* testMock gets rebuilt for every test. any way around this?
 */

var testMock = {
  // testComponents: []
};
var testComponents = [];

function compileMock (methods) {
  testComponents = [];
  methods.forEach(function (method) {
    testMock[method] = function (param) {
      console.log(method);
      testComponents.push({
        method: method,
        argument: param || null
      });
      return testMock;
    };
  });
  console.log(testMock)
};

'iwant.thesenodes().not.toExist'

function evalUserCode (uncleanActiveTest) {
  uncleanActiveTest = uncleanActiveTest.replace('iwant','testMock');
  try {
    console.log('in')
    eval(uncleanActiveTest); // TODO: why THE FUCK is this only evaling the first method???
    console.log('out')
  } catch (e) {
    console.log(e)
    throw new Error("Illegal code in active test: " + e);
  };
  postMessage({activeTest: testComponents});
};

onmessage = function (e) {
  if (Object.keys(testMock).length === 0) {
    compileMock(e.data.methods);
  }
  evalUserCode(e.data.activeTest);
};






/**
 * Parse and sanitize the user created active test. Each active test is made up of individual components (methods).
 * @param  {String} testString A string version of the active test created by the user.
 * @return {Array} activeTestConfig All the sanitized components of the active test.
 */
// function sanitizeActiveTest (testString) {
//   // if there's no testString, then this function has no business running
//   if (!testString) {
//     return null;
//   }

  // var activeTestConfig = [];

  /**
   * Pulls the method if it exists from a test component.
   * @param  {String} method String of the TA method the user wants to call.
   * @return {String}        The method name.
   */
  // function getMethod (method) {
  //   return method.split('(')[0];
  // };

  /**
   * Pulls the argument if it exists on a test component.
   * @param  {String} method String of the TA method the user wants to call.
   * @return {String}        The argument if it exists. Otherwise null.
   */
  // function getArgument (method) {
  //   if (method.split('(')[1]) {
  //     return method.split('(')[1].split(')')[0];
  //   } else {
  //     return null;
  //   }
  // };

  // need to do a regex look behind to make sure that:
  // (a) the period does not come between quotes

  // testString.split('.').forEach(function (method) {
  //   var method = getMethod(method).replace(';','');
  //   var argument = getArgument(method);

  //   var testComponent = {
  //     method: method,
  //     argument: argument
  //   }
  //   // TODO: missing: toExist. also arguments aren't showing up
  //   if (taAvailableMethods.indexOf(method) !== -1) {
  //     activeTestConfig.push(testComponent);
  //   }
  // });
  // console.log(activeTestConfig)
  // return activeTestConfig;
// }