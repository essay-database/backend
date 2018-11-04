const { readdir } = require("fs");
const { join } = require("path");
const { ESSAYS_PATH, DETAILS_PATH, COLLECTION_PATH } = require("../config.js");
const { write, read } = require("./shared");

let DETAILS;
let ESSAYS;
try {
  DETAILS = require(DETAILS_PATH);
  ESSAYS = require(COLLECTION_PATH);
} catch (e) {
  console.error(`error loading file: ${e}`); // should not throw error
}
const authorize = require("./authorization");
const getEssaysDetails = require("./sheets");
const getEssaysContent = require("./drive");

function initialize() {
  return new Promise((resolve, reject) => {
    authorize([getEssaysContent, getEssaysDetails, createIndex])
      .then(msg => resolve(msg))
      .catch(err => reject(err));
  });
}

function getEssay(id) {
  return new Promise((resolve, reject) => {
    if (!ESSAYS) {
      reject(Error`essays not found`);
    } else {
      const essay = ESSAYS.find(essay => essay.id === id);
      if (!essay) reject(Error`essay not found ${id}`);
      else resolve(essay);
    }
  });
}

function getFeatured() {
  return new Promise((resolve, reject) => {
    if (!ESSAYS) reject(Error("essays not found"));
    else resolve(ESSAYS.filter(essay => essay.featured === true));
  });
}

function getEssays() {
  return new Promise((resolve, reject) => {
    if (!ESSAYS) {
      reject(Error`essays not found`);
    } else {
      resolve(ESSAYS);
    }
  });
}

function createError(status, message, next) {
  const error = new Error(message);
  error.status = status;
  if (next) return next(error);
  return error;
}

function createIndex() {
  return new Promise((resolve, reject) => {
    readdir(ESSAYS_PATH, (err, files) => {
      if (err) reject(err);
      else {
        formatFiles(files.filter(file => file.endsWith(".txt")), DETAILS)
          .then(files => write(COLLECTION_PATH, JSON.stringify(files)))
          .then(msg => resolve(msg))
          .catch(err => resolve(err));
      }
    });
  });
}

function formatFile(file, index) {
  return new Promise((resolve, reject) => {
    const entry = index.find(detail => file.includes(detail.id));
    if (entry)
      read(join(ESSAYS_PATH, file))
        .then(essay => {
          const sep = "||";
          let paragraphs = essay.replace(/[\n\r]+/g, sep);
          paragraphs = paragraphs.replace(/\uFEFF/g, "");
          paragraphs = paragraphs.split(sep);
          entry.paragraphs = paragraphs;
          // delete essay.links;
          // delete essay.featured;
          // delete essay.email;
          // dateUploaded: faker.date.recent(RECENT_DAYS)
          resolve(essay);
        })
        .catch(err => reject(err));
    else reject(Error("entry not found"));
  });
}

function formatFiles(files, index) {
  return Promise.all(files.map(file => formatFile(file, index)));
}

module.exports = {
  getEssay,
  getEssays,
  createError,
  initialize,
  getFeatured
};
