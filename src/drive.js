const {
  ESSAY_FOLDERID
} = require('./secrets.json');
const ESSAYS_PATH = '../essays';
const OPTIONS = {
  orderBy: `createdDate desc`,
  maxResults: 12, // dev only
};

function getEssaysContent(auth) {
  const drive = google.drive({
    version: 'v2',
    auth
  });
  retrieveAllEssays(drive, ESSAY_FOLDERID, downloadFiles);
}

function retrieveAllEssays(drive, folderId, callback) {
  function retrievePageOfChildren(pageToken, result) {
    drive.children.list({
        folderId: folderId,
        orderBy: OPTIONS.orderBy,
        maxResults: OPTIONS.maxResults,
        pageToken
      },
      (err, res) => {
        if (err) return console.error('The API list returned an error: ' + err);
        result = result.concat(res.data.items);
        const nextPageToken = res.nextPageToken;
        if (nextPageToken) {
          retrievePageOfChildren(nextPageToken, result);
        } else {
          callback(drive, result);
        }
      }
    );
  };
  retrievePageOfChildren('', []);
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
    const dest = fs.createWriteStream(filename);
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
      })
  });
}

module.exports = {
  getEssaysContent
}