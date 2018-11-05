const { join } = require("path");
const { createWriteStream } = require("fs");
const { google } = require("googleapis");
const { ESSAY_FOLDER_ID, ESSAYS_PATH, ESSAYS_FILE } = require("../config.js");
const { write } = require("./shared");

const ESSAYS_DATA = require(ESSAYS_FILE);

const OPTIONS = {
  orderBy: `createdTime desc`,
  pageSize: 13,
  q: `'${ESSAY_FOLDER_ID}' in parents and trashed = false`
};

function fetchEssaysText(auth) {
  const drive = google.drive({
    version: "v3",
    auth
  });
  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        ...OPTIONS,
        fields: "nextPageToken, files(id,createdTime)"
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          const { files } = res.data;
          if (files && files.length) {
            downloadEssays(drive, files)
              .then(() => files)
              .then(files => writeCreateTime(files))
              .then(msg => resolve(msg))
              .catch(err => reject(err));
          } else {
            reject(Error("no files found."));
          }
        }
      }
    );
  });
}

function writeCreateTime(files) {
  const data = ESSAYS_DATA;
  for (const { id, createdTime } of files) {
    const entry = data.find(entry => entry.id === id);
    if (entry) entry.dateUploaded = createdTime;
    else console.error(`entry not found: ${id}`);
  }
  return new Promise((resolve, reject) => {
    write(ESSAYS_FILE, JSON.stringify(data))
      .then(msg => resolve(msg))
      .catch(err => reject(err));
  });
}

function downloadEssays(drive, files) {
  return Promise.all(
    files.map(file =>
      downloadEssay(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`)).catch(
        err => err.message
      )
    )
  );
}

function downloadEssay(drive, fileId, filename) {
  return new Promise((resolve, reject) => {
    const dest = createWriteStream(filename);
    drive.files.export(
      {
        fileId,
        mimeType: "text/plain"
      },
      {
        responseType: "stream"
      },
      (err, res) => {
        if (err) reject(Error(`error exporting file: ${filename}`));
        else
          res.data
            .on("end", () => {
              resolve(`finished downloading ${filename}`);
            })
            .on("error", () => {
              reject(Error(`error downloading ${filename}`));
            })
            .pipe(dest);
      }
    );
  });
}

module.exports = fetchEssaysText;
