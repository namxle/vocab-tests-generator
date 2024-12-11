const fs = require('fs');
const helper = require('./helper');

// Function to convert the JSON structure to the specified test file format
function convertToTestFormat(questions) {
  let output = '';

  questions.forEach((question, index) => {
    // Append question number and question text
    output += `${index + 1}. ${question.question_name}\n`;

    // Append answers with options (a), (b), etc., marking correct answers with "*"
    question.answers.forEach((answer, answerIndex) => {
      // If the question has more than 1 correct answer
      let option = String.fromCharCode(97 + answerIndex) + ')';
      let isCorrect;
      if (question.correct_answers.length > 1) {
        option = '';
        isCorrect = question.correct_answers.includes(answer.id) ? '[*]' : '[]';
      } else {
        isCorrect = question.correct_answers.includes(answer.id) ? '*' : '';
      }
      output += `${isCorrect}${option} ${answer.value}\n`;
    });

    // Add a newline after each question block
    output += '\n';
  });

  return output;
}

function getTestData(data) {
  const totalAnswers = [];
  const testData = data.map((datum) => {
    // Get random 1 question for each word
    const question = helper.getRandomElements(datum.questions, 1)[0];
    // Shuffle answers of that question 5 times
    for (let i = 0; i < 6; i++) {
      question.answers = helper.shuffle(question.answers);
    }

    question.correct_answers.forEach((ans) => {
      totalAnswers.push(
        question.answers.findIndex((answer) => answer.id == ans),
      );
    });
    return question;
  });
  return { totalAnswers, testData };
}

function generateMeaningTestData(data, total = data.length) {
  // Count total answers available in each question
  const totalAnswers = [
    ...new Set(data.map((item) => item.questions[0].answers.length)),
  ];

  // Get random words
  let wordsData;
  if (total == data.length) {
    wordsData = JSON.parse(JSON.stringify(data));
  } else {
    wordsData = helper.getRandomElements(data, total);
  }

  let flag = true;
  let finalResult = null;

  if (wordsData.length == 0) {
    return { totalAnswers: [], testData: [] };
  }

  while (flag) {
    // Flag to mark if continue generate test data
    flag = totalAnswers.length == 1 ? true : false;

    // Get test data
    const result = getTestData(wordsData);
    finalResult = result;

    // If flag is false, then break else check answer counts
    if (!flag) return result;
    flag = helper.checkAnswerCounts(result.totalAnswers, totalAnswers[0]);
  }

  // console.log(
  //   'Meaning Answers:',
  //   helper.countOccurrences(finalResult.totalAnswers),
  // );
  // console.log(finalResult);
  return finalResult;
}

module.exports = { generateMeaningTestData, convertToTestFormat };
