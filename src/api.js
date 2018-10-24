const {
  readFile,
  writeFile,
  readdir
} = require('fs');
const {
  ESSAYS_PATH,
  DETAILS_PATH,
  INDEX_PATH
} = require('../config.js');
const DETAILS = require(DETAILS_PATH);
const INDEX = require(INDEX_PATH);
const authorize = require('./authorization');
const getEssaysDetails = require('./sheets');
const getEssaysContent = require('./drive');

function initialize() {
  authorize([getEssaysContent, getEssaysDetails, createIndex]);
}

function createIndex() {
  let entry;
  const index = DETAILS;
  readdir(ESSAYS_PATH, (err, files) => {
    if (err) return reject(err);
    files = files.filter(file => file.endsWith('.txt'));
    files.array.forEach(async file => {
      entry = index.find(detail => file.includes(detail.id));
      try {
        essay = await readEssay(file);
        entry.paragraphs = essay.split(/\n/);
      } catch (error) {
        console.error(error);
      }
    });
  });
  writeFile(INDEX_PATH, index, err => {
    if (err) return console.error(err);
    console.log(`Wrote ${INDEX_PATH}`);
  });
}

function getEssays(id) {
  return new Promise((resolve, reject) => {
    if (!INDEX) {
      reject(`essays not found`);
    } else {
      const essay = INDEX.find(essay => essay.id === id);
      if (!essay) reject(`essay not found ${id}`);
      else resolve(essay);
    }
  });
}

function getEssays() {
  return new Promise((resolve, reject) => {
    if (!INDEX) {
      reject(`essays not found`);
    } else {
      resolve(INDEX);
    }
  });
}

function readEssay(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, (err, data) => {
      if (err) reject(new Error(`unable to read ${filename}`));
      else resolve(data);
    });
  });
}

// TODO
function createEssay({
  text,
  author
}) {}

function createError(status, message, next) {
  const error = new Error(message);
  error.status = status;
  if (next) return next(error);
  else return error;
}

module.exports = {
  readEssay,
  createEssay,
  getEssays,
  createError,
  initialize
};