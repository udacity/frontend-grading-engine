
/***
 *       _____               _      ____              _    
 *      / ____|             | |    |  _ \            | |   
 *     | |  __ _ __ __ _  __| | ___| |_) | ___   ___ | | __
 *     | | |_ | '__/ _` |/ _` |/ _ \  _ < / _ \ / _ \| |/ /
 *     | |__| | | | (_| | (_| |  __/ |_) | (_) | (_) |   < 
 *      \_____|_|  \__,_|\__,_|\___|____/ \___/ \___/|_|\_\
 *                                                         
 *                                                         

The GradeBook maintains and reports on the state of a set of questions registered by the TA. The GradeBook reports out on the final state of each active_test.
*/

/**
 * The GradeBook constructor sets questions and passed to default values.
 */
function GradeBook () {
  this.questions = [];
  this.passed = false;
};

Object.defineProperties(GradeBook.prototype, {
  numberOfQuestions: {
    /**
     * Private use only. Find the number of questions.
     * @return {Number} number of questions
     */
    get: function () {
      return this.questions.length;
    }
  },
  numberCorrectQuestions: {
    /**
     * Private use only. Find the number of questions evaluated as correct.
     * @return {Number} numberCorrect - number of correct questions.
     */
    get: function () {
      var numberCorrect = 0;
      this.questions.forEach(function (question) {
        if (question.correct) {
          numberCorrect +=1;
        }
      })
      return numberCorrect;
    }
  },
  allCorrect: {
    /**
     * Private use only. Compares the total questions to total questions correct.
     * @return {Boolean} isAllGood - true if all are correct and false otherwise.
     */
    get: function () {
      var isAllGood = false;
      if (this.numberOfQuestions === this.numberCorrectQuestions && this.numberOfQuestions > 0) {
        isAllGood = true;
      }
      return isAllGood;
    }
  },
  numberWrongQuestions: {
    /**
     * Private use only. Find the number of wrong questions.
     * @return {Number} numberWrong - the number of wrong questions.
     */
    get: function () {
      var numberWrong = 0;
      numberWrong = numberOfQuestions - numberCorrectQuestions;
      return numberWrong;
    }
  },
  report: {
    /**
     * Private use only. Returns all questions and the overall correctness of the active_test. Note: this is the data returned to the active_test component.
     * @return {Object} - contains a boolean indicating whether the test passes and an array of all questions.
     */
    get: function () {
      return {
        isCorrect: this.passed,
        questions: this.questions
      };
    }
  }
});

/**
 * Takes in a set of values from the target. Adds to gradebook.
 * @param {object} target - only what the GradeBook needs to know about the Target
 */
GradeBook.prototype.recordQuestion = function (target) {
  target.correct = false;
  this.questions.push(target);
};

/**
 * Empties the questions array and ensures that the test hasn't passed prematurely. Called each time a new question is registered.
 */
GradeBook.prototype.reset = function () {
  this.questions = [];
  this.passed = false;
};

/**
 * Will iterate through all the questions and return if they meet grade criteria
 * @param  {Object} config - {string} config.strictness, {boolean} config.not, {function} config.callback
 * @return {Object} the report from the gradebook instance containing whether the test passed and all of the questions in consideration.
 */
GradeBook.prototype.grade = function (config) {
  var strictness, not, callback;
  strictness = config.strictness;
  not = config.not;
  callback = config.callback; // expect that the callback encapsulates any comparison values from us

  this.questions.forEach(function (question) {
    question.correct = callback(question);
    if (not) {
      question.correct = !question.correct;
    }
  });

  switch (strictness) {
    case 'someOf':
      if (this.numberCorrectQuestions < this.numberOfQuestions && this.numberCorrectQuestions > 0) {
        this.passed = true;
      };
      break;
    case 'onlyOneOf':
      if (this.numberCorrectQuestions === 1) {
        this.passed = true;
      };
      break;
    default:
      this.passed = this.allCorrect;
      break;
  };

  // one last check to make sure there actually were questions
  if (this.numberOfQuestions === 0 && not) {
    this.passed = !this.passed;
  };
  return this.report;
};