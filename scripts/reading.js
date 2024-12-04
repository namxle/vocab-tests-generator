const fs = require('fs');
const helper = require('./helper');

// Function to convert the JSON structure to the specified test file format

function getTestData(data) {
  const totalAnswers = [];
  const testData = data.map((datum) => {
    console.log(datum.day);
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
    testDatum.passage = datum.data.passage;
    testDatum.questions = questions;

    return testDatum;
  });
  return { totalAnswers, testData };
}

function generateReadingTestData(data, total = data.length) {
  // Count total answers in each question
  const totalAnswers = 4;

  // Get random logic data
  let readingData;
  if (total == data.length) {
    readingData = JSON.parse(JSON.stringify(data));
  } else {
    readingData = helper.getRandomElements(data, total);
  }

  console.log(
    'Reading day test: ',
    readingData.map((datum) => datum.day),
  );

  let flag = true;
  let finalResult = null;

  if (readingData.length == 0) {
    return { totalAnswers: [], testData: [] };
  }

  while (flag) {
    // Get test data
    const result = getTestData(readingData);
    finalResult = result;

    // If flag is false, then break else check answer counts
    flag = helper.checkAnswerCounts(result.totalAnswers, totalAnswers, false);
  }

  // console.log(
  //   'Reading Answers:',
  //   helper.countOccurrences(finalResult.totalAnswers),
  // );
  // console.log(finalResult.testData);
  return finalResult;
}

module.exports = { generateReadingTestData };
