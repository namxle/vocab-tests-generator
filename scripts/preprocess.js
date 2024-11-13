const fs = require('fs');

// Get current working directory
const CWD = process.cwd();
// const DB = 'Meaning';
const DB = 'Logic';
const LEVEL = 'A1';

// Get all required directories
const gptResultsDir = `${CWD}/gpt-results/${DB}`;
const databaseDir = `${CWD}/databases/${DB}/${LEVEL}`;

/********* Files *********/
const newDatabaseFile = `${databaseDir}/result.json`;
console.info(`GPT results directory: ${gptResultsDir}`);

/********* Constants *********/

/********* Helper *********/

/********* Words Section *********/

/********* Stat Section *********/

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

  // Get only specific type of
  const jsonFilesFiltered = jsonFiles.filter((jsonFile) => {
    const level = jsonFile.split('_')[0];
    return level == LEVEL;
  });

  console.log('JSON file found:', jsonFiles.length);
  console.log('JSON file filtered:', jsonFilesFiltered.length);

  jsonFilesFiltered.forEach((jsonFile) => {
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
  // Process GPT results
  const gptJsonFiles = getGptJsonFiles();

  const gptResult = processGptJsonFiles(gptJsonFiles);
  console.log(gptResult);

  // Export the results to database folder
  writeNewDatabase(gptResult.data);

  console.log(`Level: ${LEVEL}`);
  console.log(`DB: ${DB}`);
  console.log(`Total words: ${gptResult.words.length}`);
}

main();
