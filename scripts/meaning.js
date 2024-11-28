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
      const option = String.fromCharCode(97 + answerIndex); // 'a', 'b', 'c', etc.
      const isCorrect = question.correct_answers.includes(answer.id) ? '*' : '';
      output += `${isCorrect}${option}) ${answer.value}\n`;
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

    totalAnswers.push(
      question.answers.findIndex(
        (answer) => answer.id == question.correct_answers[0],
      ),
    );
    return question;
  });
  return { totalAnswers, testData };
}

function generateMeaningTestData(data, totalWords = data.length) {
  // Count total answers available in each question
  const totalAnswers = [
    ...new Set(data.map((item) => item.questions[0].answers.length)),
  ];

  // Get random words
  const wordsData = helper.getRandomElements(data, totalWords);

  let flag = true;
  let finalResult = null;

  while (flag) {
    // Flag to mark if continue generate test data
    flag = totalAnswers.length == 1 ? true : false;

    // Get test data
    const result = getTestData(wordsData);
    finalResult = result;

    // If flag is false, then break else check answer counts
    if (!flag) return flag;
    flag = helper.checkAnswerCounts(result.totalAnswers, totalAnswers[0]);
  }

  // console.log(
  //   'Meaning Answers:',
  //   helper.countOccurrences(finalResult.totalAnswers),
  // );
  //   console.log(finalResult);
  return finalResult;
}

module.exports = { generateMeaningTestData, convertToTestFormat };
