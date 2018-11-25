const { join } = require("path");
const { createWriteStream } = require("fs");
const { google } = require("googleapis");
const {
  ESSAY_FOLDER_ID,
  ESSAYS_PATH,
  SPREADSHEET_FILE
} = require("../config.js");
const { write } = require("./shared");

const SPREADSHEET_DATA = require(SPREADSHEET_FILE);

const OPTIONS = {
  orderBy: `createdTime desc`,
  pageSize: 100,
  q: `'${ESSAY_FOLDER_ID}' in parents and trashed = false`,
  fields: "nextPageToken, files(id,createdTime)"
};

function fetchEssaysText(auth) {
  const drive = google.drive({
    version: "v3",
    auth
  });
  return new Promise((resolve, reject) => {
    drive.files.list(OPTIONS, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const { files } = res.data;
        if (files && files.length) {
          downloadEssays(drive, files)
            .then(msgs => {
              msgs.forEach(msg => console.log(msg));
              console.log(`drive: ${files.length} files downloaded`);
            })
            .then(() => updateCreationTime(files))
            .then(msg => resolve(msg))
            .catch(err => reject(err));
        } else {
          reject(Error("no files found."));
        }
      }
    });
  });
}

function updateCreationTime(files) {
  const data = SPREADSHEET_DATA;
  for (const { id, createdTime } of files) {
    const entry = data.find(entry => entry.id === id);
    if (entry) entry.dateUploaded = createdTime;
    else console.error(`drive: entry not found: ${id}`);
  }
  return new Promise((resolve, reject) => {
    write(SPREADSHEET_FILE, JSON.stringify(data))
      .then(msg => resolve(msg))
      .catch(err => reject(err));
  });
}

function downloadEssays(drive, files) {
  return Promise.all(
    files.map(file =>
      downloadEssay(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`)).catch(
        err => err
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
        if (err) {
          console.error(`drive: error exporting file: ${fileId}\nretrying...`);
          setTimeout(
            () => resolve(downloadEssay(drive, fileId, filename)),
            500
          );
        } else
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
