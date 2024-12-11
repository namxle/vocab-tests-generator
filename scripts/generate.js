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
  all_daily: 'All Daily',
  daily: 'Daily',
  weekly: 'Weekly',
  unit: 'Unit',
  custom: 'Custom',
};
const weeks = {
  week1: 'Week 1',
  week2: 'Week 2',
};

const databases = {
  meaning: 'M.json',
  logic: 'L.json',
  reading: 'R.json',
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

  const meaningData = loadData(levelDir, inputSubLevel, databases.meaning);
  const logicData = loadData(levelDir, inputSubLevel, databases.logic);
  const readingData = loadData(levelDir, inputSubLevel, databases.reading);

  const outputFile = `${exportsDir}/${outfile}`;

  const days = meaningData.map((item) => Number(item.day));
  const start = Math.min(...days);
  const end = Math.max(...days);

  const startDayFirstWeek = 1;
  const endDayFirstWeek = 7;
  const startDaySecondWeek = 8;
  const endDaySecondWeek = 14;

  let finalResult = null;
  let formatedTest = null;

  switch (inputTest) {
    case tests.all_daily:
      for (let day = start; day <= end; day++) {
        let meaningDayData = meaningData.find((item) => item.day == day)[
          'data'
        ];
        console.log();
        console.log(
          `Day: ${day}.`,
          `Words: ${meaningDayData.map((item) => item.word).join(', ')}`,
        );

        // Generate test
        finalResult = meaningScript.generateMeaningTestData(meaningDayData);

        // Convert to Canvas test format
        formatedTest = meaningScript.convertToTestFormat(finalResult.testData);
        fs.writeFileSync(outputFile + day + '.txt', formatedTest, 'utf-8');
      }
      break;
    case tests.daily:
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
    case tests.custom:
      const meaningCustomData = meaningData.reduce((mergedArray, datum) => {
        return mergedArray.concat(datum.data);
      }, []);
      const meaningCustomResult =
        meaningScript.generateMeaningTestData(meaningCustomData);

      const logicCustomResult = logicScript.generateLogicTestData(logicData);

      const readingCustomResult =
        readingScript.generateReadingTestData(readingData);

      // Generate combine results
      formatedTest = helperScript.generateCombinedTestFormat(
        meaningCustomResult,
        logicCustomResult,
        readingCustomResult,
      );
      fs.writeFileSync(outputFile, formatedTest, 'utf-8');

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

function loadData(dir, sublevel, db) {
  const fpath = path.join(dir, sublevel, db);
  if (fs.existsSync(fpath)) {
    return JSON.parse(fs.readFileSync(fpath, 'utf8'));
  }
  return [];
}

function countOccurrences(array) {
  const count = {};

  for (const element of array) {
    count[element] = (count[element] || 0) + 1; // Increment count for each element
  }

  return count; // Return the count object
}

run();
