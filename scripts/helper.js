const crypto = require('crypto');

function countOccurrences(array) {
  const count = {};

  for (const element of array) {
    count[element] = (count[element] || 0) + 1; // Increment count for each element
  }

  return count; // Return the count object
}

function checkAnswerCounts(totalAnswers, noAnswers, allOccurred = true) {
  const occurences = countOccurrences(totalAnswers);
  const total = Object.values(occurences).reduce((acc, val) => acc + val, 0);
  //   console.log(total, noAnswers);
  // If not require all occurred, then (noAnswers - 1) required.
  if (allOccurred) {
    // If some answers were not occured then run it again
    if (Object.keys(occurences).length < noAnswers) {
      return true;
    }
  } else {
    if (Object.keys(occurences).length < noAnswers - 1) {
      return true;
    } else {
      return false;
    }
  }
  let flag = false;
  const low = Math.floor(total / noAnswers - total * 0.2);
  const high = Math.floor(total / noAnswers + total * 0.2);
  // console.log(low, high);
  Object.keys(occurences).forEach((key) => {
    if (occurences[key] <= low || occurences[key] >= high) {
      flag = true;
    }
  });

  return flag;
}

function getRandomElements(a, n) {
  if (n == 0) {
    n = a.length;
  }
  const result = [];
  const usedIndices = new Set();

  while (result.length < n) {
    const randomIndex = Math.floor(Math.random() * a.length);

    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      result.push(a[randomIndex]);
    }
  }

  return result;
}

function shuffle(array) {
  const shuffledArray = array.slice(); // Create a copy of the array
  const n = shuffledArray.length;

  for (let i = n - 1; i > 0; i--) {
    // Generate a secure random index between 0 and i
    const j = crypto.randomInt(0, i + 1);
    // Swap elements at indices i and j
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray; // Return the shuffled array
}

// Function to convert the JSON structure to the specified test file format
function generateCombinedTestFormat(meaning, logic, reading) {
  let output = '';

  let questionNumber = 0;

  // Process meaning result
  meaning.testData.forEach((datum) => {
    questionNumber += 1;
    output += `${questionNumber}. ${datum.question_name}\n`;

    datum.answers.forEach((answer, answerIndex) => {
      const option = String.fromCharCode(97 + answerIndex); // 'a', 'b', 'c', etc.
      const isCorrect = datum.correct_answers.includes(answer.id) ? '*' : '';
      output += `${isCorrect}${option}) ${answer.value}\n`;
    });

    output += '\n';
  });

  // Process logic result
  logic.testData.forEach((datum, index) => {
    const testIndex = index + 1;
    output += `Text: Sentence ${testIndex}: ${datum.sentence}\n`;
    output += '\n';
    // console.log(JSON.stringify(datum.questions));
    datum.questions.forEach((question) => {
      questionNumber += 1;
      output += `${questionNumber}. From Sentence ${testIndex}. ${question.question_name}\n`;
      if (question.sequence) {
        output += '\n';
        question.sequence.forEach((sentence, sindex) => {
          output += `\t${sindex + 1}. ${sentence}\n`;
        });
        output += '\n';
      }
      question.answers.forEach((answer, answerIndex) => {
        const option = String.fromCharCode(97 + answerIndex); // 'a', 'b', 'c', etc.
        const isCorrect = question.correct_answers.includes(answer.id)
          ? '*'
          : '';
        output += `${isCorrect}${option}) ${answer.value}\n`;
      });
      output += '\n';
    });
  });

  // Process reading result
  reading.testData.forEach((datum, index) => {
    const passageIndex = index + 1;
    output += `Text: Passage ${passageIndex}: ${datum.passage}\n`;
    output += '\n';

    datum.questions.forEach((question) => {
      questionNumber += 1;
      output += `${questionNumber}. In Passage ${passageIndex}. ${question.question_name}\n`;
      question.answers.forEach((answer, answerIndex) => {
        const option = String.fromCharCode(97 + answerIndex); // 'a', 'b', 'c', etc.
        const isCorrect = question.correct_answers.includes(answer.id)
          ? '*'
          : '';
        output += `${isCorrect}${option}) ${answer.value}\n`;
      });
      output += '\n';
    });
  });

  return output;
}

module.exports = {
  countOccurrences,
  getRandomElements,
  shuffle,
  checkAnswerCounts,
  generateCombinedTestFormat,
};
