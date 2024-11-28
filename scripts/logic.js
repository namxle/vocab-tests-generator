const fs = require('fs');
const helper = require('./helper');

const questionTypes = {
  REARRANGE: 'Rearrange (MCQ)',
  COMPLETION: 'Completion (MCQ)',
};

function getRandomOrders(array, count, forbiddenOrder) {
  const results = new Set();

  // Function to shuffle the array
  function shuffle(arr) {
    const shuffled = arr.slice(); // Create a copy of the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }
    return shuffled;
  }

  // Generate random permutations until we have the required count or all possible permutations
  while (results.size < count && results.size < factorial(array.length)) {
    let shuffledArray = shuffle(array);
    while (forbiddenOrder.join('_') == shuffledArray.join('_')) {
      shuffledArray = shuffle(array);
    }
    results.add(JSON.stringify(shuffledArray));
  }

  // Convert the Set back to an array of arrays
  return Array.from(results).map((item) => JSON.parse(item));
}

// Helper function to calculate factorial (used to limit permutations)
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function getTestData(data) {
  const totalAnswers = [];
  const testData = data.map((datum) => {
    const testDatum = {};
    const questions = datum.data.questions.map((question, index) => {
      // Shuffle answers of that question 5 times
      for (let i = 0; i < 6; i++) {
        question.answers = helper.shuffle(question.answers);
      }
      totalAnswers.push(
        question.answers.findIndex(
          (answer) => answer.id == question.correct_answers[0],
        ),
      );
      return question;
    });

    testDatum.day = datum.day;
    testDatum.sentence = datum.data.sentence;
    testDatum.questions = questions;

    return testDatum;
  });
  return { totalAnswers, testData };
}

function generateLogicTestData(data, total = data.length) {
  // Count total answers available in each question
  const totalAnswers = 4;

  const logicData = helper.getRandomElements(data, total);
  console.log(
    'Logic day test: ',
    logicData.map((datum) => datum.day),
  );

  let flag = true;
  let finalResult = null;

  while (flag) {
    // Get test data
    const result = getTestData(logicData);
    finalResult = result;

    // If flag is false, then break else check answer counts
    flag = helper.checkAnswerCounts(result.totalAnswers, totalAnswers, false);
  }

  // console.log(
  //   'Logic Answers:',
  //   helper.countOccurrences(finalResult.totalAnswers),
  // );
  // console.log(finalResult.testData);
  return finalResult;
}

module.exports = { getRandomOrders, generateLogicTestData };
