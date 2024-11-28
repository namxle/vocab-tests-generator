const readline = require('readline');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

// Import scripts
const helperScript = require('./helper');
const meaningScript = require('./meaning');
const logicScript = require('./logic');
const readingScript = require('./reading');

// Fixed constants
const CWD = process.cwd();
const tests = {
  daily: 'Daily',
  weekly: 'Weekly',
  unit: 'Unit',
};
const weeks = {
  week1: 'Week 1',
  week2: 'Week 2',
};

const dataDir = `${CWD}/data`;
const exportsDir = `${CWD}/exports`;

// Dynamic constants
const possibleLevels = getDirectories(dataDir);
// console.log(possibleLevels);

// Questions
const mainQuestion = [
  {
    type: 'input',
    name: 'outfile',
    message: 'Enter output file name:',
    validate: (value) => {
      if (value && value.trim() != '') {
        return true;
      }
      return 'Output file name cannot be empty or just spaces.';
    },
  },
  {
    type: 'list',
    name: 'inputTest',
    message: 'Select type of test to be generated:',
    choices: Object.values(tests),
  },
  {
    type: 'list',
    name: 'inputLevel',
    message: 'Select level:',
    choices: possibleLevels,
  },
];

async function run() {
  const { inputTest, inputLevel, outfile } = await inquirer.prompt(
    mainQuestion,
  );
  const levelDir = path.join(dataDir, inputLevel);
  const { inputSubLevel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'inputSubLevel',
      message: 'Select sub level:',
      choices: getDirectories(levelDir),
    },
  ]);

  const meaningData = loadMeaningData(levelDir, inputSubLevel);
  const logicData = loadLogicData(levelDir, inputSubLevel);
  const readingData = loadReadingData(levelDir, inputSubLevel);

  const outputFile = `${exportsDir}/${outfile}`;

  const days = meaningData.map((item) => Number(item.day));

  const startDayFirstWeek = 1;
  const endDayFirstWeek = 7;
  const startDaySecondWeek = 8;
  const endDaySecondWeek = 14;

  let finalResult = null;
  let formatedTest = null;

  switch (inputTest) {
    case tests.daily:
      const start = Math.min(...days);
      const end = Math.max(...days);
      const { inputDay, inputTotalWords } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputDay',
          message: `Enter a day between ${start} and ${end}:`,
          validate: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < start || num > end) {
              return `Please enter a valid day between ${start} and ${end}.`;
            }
            return true;
          },
        },
      ]);

      const meaningDayData = meaningData.find((item) => item.day == inputDay)[
        'data'
      ];
      console.log();
      console.log(
        'Words: ',
        meaningDayData.map((item) => item.word).join(', '),
      );

      // Generate test
      finalResult = meaningScript.generateMeaningTestData(meaningDayData);

      // Convert to Canvas test format
      formatedTest = meaningScript.convertToTestFormat(finalResult.testData);
      fs.writeFileSync(outputFile, formatedTest, 'utf-8');
      break;
    case tests.weekly:
      const { inputWeek } = await inquirer.prompt([
        {
          type: 'list',
          name: 'inputWeek',
          message: 'Select week:',
          choices: Object.values(weeks),
        },
      ]);
      const weekDayStart =
        inputWeek == weeks.week1 ? startDayFirstWeek : startDaySecondWeek;
      const weekDayEnd =
        inputWeek == weeks.week1 ? endDayFirstWeek : endDaySecondWeek;

      // Meaning data
      const meaningWeekData = meaningData
        .filter((datum) => datum.day >= weekDayStart && datum.day <= weekDayEnd)
        .reduce((mergedArray, datum) => {
          return mergedArray.concat(datum.data);
        }, []);
      const meaningResult =
        meaningScript.generateMeaningTestData(meaningWeekData);

      // Logic data
      const logicWeekData = logicData.filter(
        (datum) => datum.day >= weekDayStart && datum.day <= weekDayEnd,
      );
      const logicResult = logicScript.generateLogicTestData(logicWeekData, 2);

      // Reading data
      const readingWeekData = readingData.filter(
        (datum) => datum.day >= weekDayStart && datum.day <= weekDayEnd,
      );
      const readingResult = readingScript.generateReadingTestData(
        readingWeekData,
        3,
      );

      // Generate combine results
      formatedTest = helperScript.generateCombinedTestFormat(
        meaningResult,
        logicResult,
        readingResult,
      );
      fs.writeFileSync(outputFile, formatedTest, 'utf-8');
      break;

    case tests.unit:
      break;
  }
  console.log();
  console.log('Done!');
}

function getDirectories(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true }) // Read directory contents
      .filter((dirent) => dirent.isDirectory()) // Filter only directories
      .map((dirent) => dirent.name); // Get directory names
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
    return [];
  }
}

function loadMeaningData(dir, sublevel) {
  return JSON.parse(
    fs.readFileSync(path.join(dir, sublevel, 'M.json'), 'utf8'),
  );
}

function loadLogicData(dir, sublevel) {
  return JSON.parse(
    fs.readFileSync(path.join(dir, sublevel, 'L.json'), 'utf8'),
  );
}

function loadReadingData(dir, sublevel) {
  return JSON.parse(
    fs.readFileSync(path.join(dir, sublevel, 'R.json'), 'utf8'),
  );
}

function countOccurrences(array) {
  const count = {};

  for (const element of array) {
    count[element] = (count[element] || 0) + 1; // Increment count for each element
  }

  return count; // Return the count object
}

run();
