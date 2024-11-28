const fs = require('fs');

// Import scripts
const logicScript = require('./logic');
const helperScript = require('./helper');

// Constants
const CWD = process.cwd();

const LEVEL = 'A2';
const SUB_LEVEL = 'L3';
const GROUP = 'L';
const DAY = 'Day';

// Total expected questions per GROUP
const totalMeaningQuestions = 10;

// Get all required directories
const sourcesDir = `${CWD}/sources/${LEVEL}/${SUB_LEVEL}/${GROUP}`;
const dataDir = `${CWD}/data/${LEVEL}/${SUB_LEVEL}`;

// Helper function
function writeData(data) {
  const resultPath = `${dataDir}/${GROUP}.json`;
  fs.writeFileSync(resultPath, JSON.stringify(data), 'utf-8');
}

function getSourceFiles() {
  const files = fs.readdirSync(sourcesDir, 'utf-8');
  return files;
}

function processLogicData(datum) {
  const result = {};
  result.sentence = datum.passage.first_sentence;
  result.questions = datum.questions.map((question) => {
    const item = {
      id: question.id,
      question_name: question.question_name,
      sequence: null,
      answers: null,
      correct_answers: null,
    };
    if (question.type == 'Rearrange (MCQ)') {
      const sequence = datum.passage.shuffled_sentences.map(
        (sentence, index) => {
          return {
            id: index + 1,
            value: sentence,
          };
        },
      );
      const shuffledSequence = helperScript.shuffle(sequence);
      const shuffledIds = shuffledSequence.map((e) => e.id);
      const correctOrder = question.correct_order.map((id) => {
        return shuffledIds.indexOf(id) + 1;
      });
      item.correct_answers = [1];
      item.sequence = shuffledSequence.map((e) => e.value);
      item.answers = [
        { id: 1, value: correctOrder },
        ...logicScript
          .getRandomOrders(
            sequence.map((seq) => seq.id),
            3,
            correctOrder,
          )
          .map((answer, index) => {
            return { id: index + 2, value: answer };
          }),
      ];
    } else {
      item.correct_answers = [question.correct_answer];
      item.answers = question.answers;
    }
    return item;
  });
  return result;
}

function processReadingData(datum) {
  const result = {};
  if (datum.passage_and_questions) {
    result.passage = datum.passage_and_questions.passage;
    result.questions = datum.passage_and_questions.questions;
  } else {
    result.passage = datum.passage;
    result.questions = datum.questions;
  }
  return result;
}

function processSourceFiles(files) {
  const data = [];

  console.log('Files found:', files.length);

  files.forEach((fileName) => {
    console.log('Processing file:', fileName);
    const elements = fileName.split('.json')[0].split('_');
    const fileLevel = elements[0];
    const fileSubLevel = elements[1];
    const fileDay = Number(elements[2].split(GROUP)[0].split(DAY)[1]);

    // Read data
    const filePath = `${sourcesDir}/${fileName}`;
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let finalData = null;

    switch (GROUP) {
      case 'L':
        finalData = processLogicData(fileData);
        break;
      case 'R':
        finalData = processReadingData(fileData);
        break;
      case 'M':
        finalData = fileData;
        if (finalData.length != totalMeaningQuestions) {
          console.log(
            `Length different in "${fileName}": ${finalData.length} != ${totalMeaningQuestions}`,
          );
        }
        break;
    }

    data.push({
      day: fileDay,
      data: finalData,
    });
  });
  data.sort((a, b) => a.day - b.day);
  return data;
}

function main() {
  console.log(`Level: ${LEVEL}`);
  console.log(`Sub Level: ${SUB_LEVEL}`);

  // Process GPT results
  const sourceFiles = getSourceFiles();
  const processedData = processSourceFiles(sourceFiles);
  // console.log(processedData);

  // Write the results to data folder
  writeData(processedData);

  // console.log(`Total tests: ${processedData.length}`);
}

main();
