const {
  google
} = require('googleapis');
const {
  join
} = require('path');
const {
  createWriteStream
} = require('fs');
const {
  ESSAY_FOLDERID,
  ESSAYS_PATH
} = require('./config.json');


const OPTIONS = {
  orderBy: `createdDate desc`,
  maxResults: 1, // dev only,
  q: ``
};

function getEssaysContent(auth) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  retrieveAllEssays(drive, downloadFiles);
}

function retrieveAllEssays(drive, callback) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  drive.files.list({
    fields: 'nextPageToken, files(id, name)',
    ...OPTIONS
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      callback(drive, files);
    } else {
      console.log('No files found.');
    }
  });
}

async function downloadFiles(drive, files) {
  if (files) {
    await Promise.all(
        files
        .map((file) => {
          downloadFile(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`))
        })
      ).then(res => res.forEach(console.log))
      .catch(err => {
        console.error(err);
      });
  } else {
    console.error('no files found');
  }
}

function downloadFile(drive, fileId, filename) {
  return new Promise((resolve, reject) => {
    const dest = createWriteStream(filename);
    drive.files
      .export({
        fileId: fileId,
        mimeType: 'text/plain'
      }, {
        responseType: 'stream'
      }, (err, res) => {
        if (err) {
          reject(err)
        } else {
          res.data
            .on('end', function () {
              resolve(`Finished downloading ${filename}`);
            })
            .on('error', function (err) {
              reject(new Error(`Error during downloading ${filename}: ${err}`));
            })
            .pipe(dest);
        }
      });
  });
}

module.exports = {
  getEssaysContent
}