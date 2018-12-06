const authorize = require("./authorization");
const fetchSheets = require("./sheets");
const fetchDrive = require("./drive");
const createAPIEssaysFile = require("./essaysHelpers");
const { write } = require("./shared");
const { ESSAYS_FILE } = require("../config.js");

let ESSAYS_DATA;
try {
  ESSAYS_DATA = require(ESSAYS_FILE);
} catch (e) {
  console.error(`api: error loading file: ${e}`);
  write(ESSAYS_FILE, JSON.stringify({}));
}

function initialize() {
  return new Promise((resolve, reject) => {
    authorize([fetchSheets, fetchDrive, createAPIEssaysFile])
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

function getEssays(tag) {
  return new Promise((resolve, reject) => {
    if (!ESSAYS_DATA) {
      reject(Error(`essays not found`));
    } else {
      let essays = ESSAYS_DATA;
      if (tag) essays = essays.filter(essay => essay.tag === tag);
      resolve(essays);
    }
  });
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
  initialize,
  createError
};
