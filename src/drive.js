const {
  join
} = require('path');
const {
  createWriteStream
} = require('fs');
const {
  google
} = require('googleapis');
const {
  ESSAY_FOLDERID,
  ESSAYS_PATH
} = require('../config.js');

const OPTIONS = {
  orderBy: `createdTime desc`,
  pageSize: 12, // dev only,
  q: `'${ESSAY_FOLDERID}' in parents`
};

function getEssaysContent(auth) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  drive.files.list({
      ...OPTIONS,
      fields: 'nextPageToken, files(id)'
    },
    (err, res) => {
      if (err) return console.error(`API returned error: ${err}`);
      const files = res.data.files;
      if (files.length) {
        downloadEssays(drive, files);
      } else {
        console.log('No files found.');
      }
    }
  );
}

async function downloadEssays(drive, files) {
  await Promise.all(
    files.map(file => {
      downloadEssay(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`)).catch(
        err => {
          console.error(err);
        }
      );
    })
  );
}

function downloadEssay(drive, fileId, filename) {
  return new Promise((resolve, reject) => {
    const dest = createWriteStream(filename);
    drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain'
      }, {
        responseType: 'stream'
      },
      (err, res) => {
        if (err) return reject(err);
        res.data
          .on('end', function () {
            console.log(`Finished downloading ${filename}`);
            resolve();
          })
          .on('error', function (err) {
            reject(new Error(`Error during downloading ${filename}: ${err}`));
          })
          .pipe(dest);
      }
    );
  });
}

module.exports = getEssaysContent;