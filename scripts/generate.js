const fs = require('fs');
const crypto = require('crypto');

// const DB = 'Meaning';
const DB = 'Logic';
const LEVEL = 'A1';
const CWD = process.cwd();

const noWordsInTest = 60;

const databaseDir = `${CWD}/databases/${DB}/${LEVEL}`;

const wordsDataFilePath = `${databaseDir}/result.json`;

const testFile = `test.txt`;

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

function countOccurrences(array) {
  const count = {};

  for (const element of array) {
    count[element] = (count[element] || 0) + 1; // Increment count for each element
  }

  return count; // Return the count object
}

// Get random words
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

function loadWordsData() {
  return JSON.parse(fs.readFileSync(wordsDataFilePath, 'utf8'));
}

// Load all words
const wordsData = loadWordsData();

// Get random words
const randomWords = getRandomElements(
  wordsData.map((wordsDatum) => wordsDatum.word),
  noWordsInTest,
);
console.log('Random words:', randomWords);

// Load words data
const filteredWordsData = wordsData.filter(
  (datum) => randomWords.indexOf(datum.word) != -1,
);
console.log('Word selected: ', filteredWordsData.length);

const totalAnswers = [];

// Shuffle words 2 times
const shuffledWords = shuffle(shuffle(filteredWordsData))

// Get random questions from words
const testData = shuffledWords.map((datum) => {
  // Get random 1 question for each word
  const question = getRandomElements(datum.questions, 1)[0];
  // Shuffle answers of that question 3 times
  for (let i = 0; i < 3; i++) {
    question.answers = shuffle(question.answers);
  }
  totalAnswers.push(
    question.answers.findIndex(
      (answer) => answer.id == question.correct_answers[0],
    ),
  );
  return question;
});
// console.log(testData);
console.log(countOccurrences(totalAnswers));

// Generate the Canvas output
const formattedOutput = convertToTestFormat(testData);
// console.log(formattedOutput);

// Write the test formated results
fs.writeFileSync(testFile, formattedOutput, 'utf-8');
