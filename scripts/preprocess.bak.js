const fs = require('fs');

// Get current working directory
const CWD = process.cwd();
const TYPE = 'Meaning';
const LEVEL = "A1"

// Get all required directories
const gptResultsDir = `${CWD}/gpt-results/${TYPE}`;
// const databaseInfoDir = `${CWD}/info/${TYPE}`;
const databaseDir = `${CWD}/databases/${TYPE}`;

// const logsDir = `${databaseInfoDir}/logs`;
// const statsDir = `${databaseInfoDir}/stats`;
// const wordsDir = `${databaseInfoDir}/words`;

/********* Initial *********/
const { timeId, timeText } = getCurrentTimeInfo();
const logFilePath = `${logsDir}/preprocess_${timeId}.log`;
createLog();

/********* Files *********/
const currentWordListFile = `${wordsDir}/words.txt`;
const currentStatFile = `${statsDir}/stats.txt`;

const newWordListFile = `${wordsDir}/words_${timeId}.txt`;
const newStatFile = `${statsDir}/stats_${timeId}.txt`;

const newDatabaseFile = `${databaseFixedDir}/result.json`;

console.info(`GPT results directory: ${gptResultsDir}`);
console.info(`Logs directory: ${logsDir}`);

/********* Constants *********/
const currentWords = getCurrentWordList(currentWordListFile);
const currentStats = getCurrentStats(currentStatFile);

/********* Helper *********/
function getCurrentTimeInfo() {
  const now = new Date();

  const year = now.getFullYear();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dateInfo = [year, month, day, hour, minutes, seconds];
  return {
    timeId: dateInfo.join('_'),
    timeText: `${month}-${day}-${year} ${hour}:${minutes}:${seconds}`,
  };
}

/********* Log Section *********/
function writeLog(info) {
  fs.appendFileSync(logFilePath, info + '\n');
}

function createLog() {
  const info = `Log created at ${timeText}`;
  fs.writeFileSync(logFilePath, info + '\n');
}

/********* Words Section *********/
function getCurrentWordList(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const fileData = fs.readFileSync(path, 'utf-8');
  return fileData.replace(/\r\n/g, '\n').split('\n');
}

function writeNewWordList(words) {
  fs.writeFileSync(currentWordListFile, words.join('\n') + '\n', 'utf-8');
  fs.writeFileSync(newWordListFile, words.join('\n') + '\n', 'utf-8');
}

/********* Stat Section *********/
function getCurrentStats() {
  if (!fs.existsSync(currentStatFile)) {
    return null;
  }
  const fileData = fs.readFileSync(currentStatFile, 'utf-8');
  const stats = JSON.parse(fileData);
  return stats;
}

function writeNewStats(stats) {
  // Overwrite the current stats file
  fs.writeFileSync(currentStatFile, JSON.stringify(stats), 'utf-8');
  // Write an extra one as a new one
  fs.writeFileSync(newStatFile, JSON.stringify(stats), 'utf-8');
}

/********* Database Section *********/
function writeNewDatabase(data) {
  fs.writeFileSync(newDatabaseFile, JSON.stringify(data), 'utf-8');
}

/********* GPT Section *********/
function getGptJsonFiles() {
  const jsonFiles = fs.readdirSync(gptResultsDir, 'utf-8');
  return jsonFiles;
}

function processGptJsonFiles(jsonFiles) {
  const words = [];
  const wordsInfo = [];
  const data = [];
  jsonFiles.forEach((jsonFile) => {
    // Read data
    const jsonPath = `${gptResultsDir}/${jsonFile}`;
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Process data
    jsonData.forEach((jsonDatum) => {
      words.push(jsonDatum.word);
      wordsInfo.push({
        word: jsonDatum.word,
        questionIds: jsonDatum.questions.map((question) => question.id),
      });
      data.push(jsonDatum);
    });
  });
  return { words, data, wordsInfo };
}

/********* Main *********/
function main() {
  // Initialize
  // Print previous stats if exist
  if (currentStats) {
    writeLog(`Previous stats: ${JSON.stringify(currentStats)}`);
  }

  // Start
  const newStats = {};

  if (currentWords) {
    newStats.previousWords = currentWords;
  }

  // Process GPT results
  const gptJsonFiles = getGptJsonFiles();
  newStats.jsonFiles = gptJsonFiles;

  const gptResult = processGptJsonFiles(gptJsonFiles);
  newStats.newWords = gptResult.words;
  console.log(gptResult);
  writeNewWordList(gptResult.words);

  // Export the results to database folder
  writeNewDatabase(gptResult.data);

  // Write new stats
  writeLog(`Current stats: ${JSON.stringify(newStats)}`);
  console.log();
  console.log('New stats:', newStats);

  // writeNewStats(newStats);
}

main();
