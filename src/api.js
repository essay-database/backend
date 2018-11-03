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
  console.error(`error loading file: ${e}`);
}
const authorize = require("./authorization");
const getEssaysDetails = require("./sheets");
const getEssaysContent = require("./drive");

function initialize() {
  return authorize([getEssaysContent, getEssaysDetails, createIndex]);
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
  const index = DETAILS;
  readdir(ESSAYS_PATH, async (err, files) => {
    if (err) console.error(err);
    else {
      const filesFiltered = files.filter(file => file.endsWith(".txt"));
      for (const file of filesFiltered) {
        const entry = index.find(detail => file.includes(detail.id));
        if (entry) {
          try {
            const essay = await read(join(ESSAYS_PATH, file));
            const sep = "||";
            let paragraphs = essay.replace(/[\n\r]+/g, sep);
            paragraphs = paragraphs.replace(/\uFEFF/g, "");
            paragraphs = paragraphs.split(sep);
            entry.paragraphs = paragraphs;
            delete essay.links;
            delete essay.featured;
            delete essay.email;
            // dateUploaded: faker.date.recent(RECENT_DAYS),
          } catch (error) {
            console.error(error);
          }
        } else {
          console.error(`entry not found: ${file}`);
        }
      }
      write(COLLECTION_PATH, JSON.stringify(index));
    }
  });
}

module.exports = {
  getEssay,
  getEssays,
  createError,
  initialize,
  getFeatured
};
