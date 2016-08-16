/**
 * @fileOverview The GradeBook maintains and reports on the state of a set of questions registered by the TA. The GradeBook reports out on the final state of each active_test.
 * @name GradeBook.js<GE>
 * @author Cameron Pittman
 * @license GPLv3
 */

/**
 * The GradeBook constructor sets questions and passed to default values.
 */
function GradeBook() {
  this.questions = [];
  this.passed = false;
};

Object.defineProperties(GradeBook.prototype, {
  numberOfQuestions: {
    /**
     * Find the number of questions.
     * @return {Number} number of questions
     */
    get: function() {
      return this.questions.length;
    }
  },
  numberCorrectQuestions: {
    /**
     * Find the number of questions evaluated as correct.
     * @return {Number} numberCorrect - number of correct questions.
     */
    get: function() {
      var numberCorrect = 0;
      this.questions.forEach(function(question) {
        if (question.correct) {
          numberCorrect += 1;
        }
      });
      return numberCorrect;
    }
  },
  allCorrect: {
    /**
     * Compares the total questions to total questions correct.
     * @return {Boolean} isAllGood - true if all are correct and false otherwise.
     */
    get: function() {
      var isAllGood = false;
      if (this.numberOfQuestions === this.numberCorrectQuestions && this.numberOfQuestions > 0) {
        isAllGood = true;
      }
      return isAllGood;
    }
  },
  numberWrongQuestions: {
    /**
     * Find the number of wrong questions.
     * @return {Number} numberWrong - the number of wrong questions.
     */
    get: function() {
      var numberWrong = 0;
      numberWrong = numberOfQuestions - numberCorrectQuestions;
      return numberWrong;
    }
  },
  report: {
    /**
     * Returns all questions and the overall correctness of the active_test. Note: this is the data returned to the active_test component.
     * @return {Object} - contains a boolean indicating whether the test passes and an array of all questions.
     */
    get: function() {
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
GradeBook.prototype.recordQuestion = function(target) {
  target.correct = false;
  this.questions.push(target);
};

/**
 * Empties the questions array and ensures that the test hasn’t passed prematurely. Called each time a new question is registered.
 */
GradeBook.prototype.reset = function() {
  this.questions = [];
  this.passed = false;
};

/**
 * Will iterate through all the questions and return if they meet grade criteria
 * @param  {Object} config - {String} config.strictness, {Boolean} config.not, {Function} config.callback
 * @return {Object} the report from the gradebook instance containing whether the test passed and all of the questions in consideration.
 */
GradeBook.prototype.grade = function(config) {
  var strictness;
  var not;
  var callback;
  strictness = config.strictness;
  not = config.not;
  callback = config.callback;

  this.questions.forEach(function(question) {
    question.correct = callback(question);

    if (not) {
      question.correct = !question.correct;
    }
  });

  if (strictness === 'some') {
    if (this.numberCorrectQuestions <= this.numberOfQuestions && this.numberCorrectQuestions > 0) {
      this.passed = true;
    };
  } else if (typeof strictness === 'number' && strictness > 0) {
    if (this.numberCorrectQuestions <= strictness && this.numberCorrectQuestions > 0) {
      this.passed = true;
    }
  } else {
    this.passed = this.allCorrect;
  }

  // one last check to make sure there actually were questions
  if (this.numberOfQuestions === 0 && not) {
    this.passed = !this.passed;
  };
  return this.report;
};

// GradeBook.js<js> ends here
