const { join } = require("path");
const { createWriteStream } = require("fs");
const { google } = require("googleapis");
const { ESSAY_FOLDERID, ESSAYS_PATH } = require("../config.js");

const OPTIONS = {
  orderBy: `createdTime desc`,
  pageSize: 12,
  q: `'${ESSAY_FOLDERID}' in parents`
};

function getEssaysContent(auth) {
  const drive = google.drive({
    version: "v3",
    auth
  });
  drive.files.list(
    {
      ...OPTIONS,
      fields: "nextPageToken, files(id)"
    },
    (err, res) => {
      if (err) console.error(`API returned error: ${err}`);
      else {
        const { files } = res.data;
        if (files.length) {
          downloadEssays(drive, files);
        } else {
          console.log("No files found.");
        }
      }
    }
  );
}

async function downloadEssays(drive, files) {
  try {
    await Promise.all(
      files.map(file =>
        downloadEssay(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`))
      )
    );
  } catch (e) {
    console.error(e);
  }
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
        if (err) reject(err);
        else
          res.data
            .on("end", () => {
              console.log(`Finished downloading ${filename}`);
              resolve();
            })
            .on("error", err => {
              reject(new Error(`Error during downloading ${filename}: ${err}`));
            })
            .pipe(dest);
      }
    );
  });
}

module.exports = getEssaysContent;
