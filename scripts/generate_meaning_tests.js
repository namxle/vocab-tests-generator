const fs = require('fs');
const crypto = require('crypto');

const DB = 'Meaning';
const LEVEL = 'A1';
const TYPE = 'daily';
const CWD = process.cwd();

const noWordsInTest = 60;

const databaseDir = `${CWD}/databases/${DB}/${LEVEL}/${TYPE}`;
const exportDir = `${CWD}/exports`;

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

function loadWordsData(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function getGptJsonFiles() {
  const jsonFiles = fs.readdirSync(databaseDir, 'utf-8');
  return jsonFiles;
}

function getTestData(wordsData) {
  const totalAnswers = [];
  const testData = wordsData.map((datum) => {
    // Get random 1 question for each word
    const question = datum.questions[0];
    // Shuffle answers of that question 5 times
    for (let i = 0; i < 6; i++) {
      question.answers = shuffle(question.answers);
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

function checkAnswerCounts(totalAnswers, noAnswers) {
  const occurences = countOccurrences(totalAnswers);
  const total = Object.values(occurences).reduce((acc, val) => acc + val, 0);
  //   console.log(total, noAnswers);
  // If some answers were not occured then run it again
  if (Object.keys(occurences).length < noAnswers) {
    return true;
  }
  let flag = false;
  const low = Math.floor(total / noAnswers - total * 0.2);
  const high = Math.floor(total / noAnswers + total * 0.2);
  //   console.log(low, high);
  Object.keys(occurences).forEach((key) => {
    if (occurences[key] <= low || occurences[key] >= high) {
      flag = true;
    }
  });

  return flag;
}

const jsonFiles = getGptJsonFiles();

jsonFiles.every((jsonFile) => {
  // Load all words
  const wordsData = loadWordsData(databaseDir + '/' + jsonFile);

  // Shuffle words 2 times
  //   const words = wordsData.map((data) => data.word);
  //   const shuffledWords = shuffle(shuffle(words));
  //   console.log(shuffledWords)

  const noAnswers = [
    ...new Set(wordsData.map((item) => item.questions[0].answers.length)),
  ];

  let flag = true;
  let finalResult = null;
  while (flag) {
    flag = noAnswers.length == 1 ? true : false;
    // Get test data
    const result = getTestData(wordsData);
    finalResult = result;
    if (!flag) {
      return flag;
    }
    flag = checkAnswerCounts(result.totalAnswers, noAnswers[0]);
  }

  console.log(jsonFile, ': ', countOccurrences(finalResult.totalAnswers));

  // Generate the Canvas output
  const testFile = `${exportDir}/${jsonFile.split('.')[0]}.txt`;
  const formattedOutput = convertToTestFormat(finalResult.testData);
  // console.log(formattedOutput);

  // Write the test formated results
  fs.writeFileSync(testFile, formattedOutput, 'utf-8');
  return true;
});
