const { readdir } = require("fs");
const { join } = require("path");
const { ESSAYS_PATH, SPREADSHEET_FILE, ESSAYS_FILE } = require("../config.js");
const { write, read } = require("./shared");

let SPREADSHEET_DATA;
let ESSAYS_DATA;

const authorize = require("./authorization");
const fetchEssaysDetails = require("./sheets");
const fetchEssaysText = require("./drive");

try {
  SPREADSHEET_DATA = require(SPREADSHEET_FILE);
  ESSAYS_DATA = require(ESSAYS_FILE);
} catch (e) {
  console.error(`error loading file: ${e}`);
}

function initialize() {
  return new Promise((resolve, reject) => {
    authorize([fetchEssaysDetails, fetchEssaysText, createEssaysData])
      .then(msgs => resolve(msgs))
      .catch(err => reject(err));
  });
}

function getEssay(id) {
  return new Promise((resolve, reject) => {
    if (!ESSAYS_DATA) {
      reject(Error(`essays not found`));
    } else {
      const essay = ESSAYS_DATA.find(essay => essay.id === id);
      if (!essay) reject(Error(`essay not found ${id}`));
      else resolve(essay);
    }
  });
}

function getEssays() {
  return new Promise((resolve, reject) => {
    if (!ESSAYS_DATA) {
      reject(Error(`essays not found`));
    } else {
      resolve(ESSAYS_DATA);
    }
  });
}

function getFeaturedEssays() {
  return new Promise((resolve, reject) => {
    if (!ESSAYS_DATA) reject(Error("essays not found"));
    else resolve(ESSAYS_DATA.filter(essay => essay.featured === true));
  });
}

function createEssaysData() {
  return new Promise((resolve, reject) => {
    readdir(ESSAYS_PATH, (err, fileNames) => {
      if (err) reject(err);
      else {
        compileEssays(
          fileNames.filter(file => file.endsWith(".txt")),
          SPREADSHEET_DATA
        )
          .then(files => write(ESSAYS_FILE, JSON.stringify(files)))
          .then(msgs => resolve(msgs))
          .catch(err => resolve(err));
      }
    });
  });
}

function format(essay, essayText) {
  const sep = "||";
  let paragraphs = essayText.replace(/[\n\r]+/g, sep);
  paragraphs = paragraphs.replace(/\uFEFF/g, "");
  paragraphs = paragraphs.split(sep);
  essay.paragraphs = paragraphs;
  delete essay.links;
  delete essay.author;
  delete essay.email;
  return essay;
}

function compileEssay(fileName, data) {
  return new Promise((resolve, reject) => {
    const essay = data.find(detail => fileName.includes(detail.id));
    if (essay)
      read(join(ESSAYS_PATH, fileName))
        .then(essayText => resolve(format(essay, essayText)))
        .catch(err => reject(err));
    else reject(Error(`essay not found: ${fileName}`));
  });
}

function compileEssays(files, data) {
  return Promise.all(
    files.map(file => compileEssay(file, data).catch(err => err.message))
  );
}

function createError(status, message, next) {
  const error = new Error(message);
  error.status = status;
  if (next) return next(error);
  return error;
}

module.exports = {
  getEssay,
  getEssays,
  createError,
  initialize,
  getFeaturedEssays
};
