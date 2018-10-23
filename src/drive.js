const ESSAYS_PATH = './essays';
const OPTIONS = {
  orderBy: `createdDate desc`,
  maxResults: 12, // dev only
}

function getEssaysContent(auth) {
  DRIVE = google.drive({
    version: 'v2',
    auth
  });
  if (!secrets || !secrets.essaysFolderID) {
    console.error(`essaysFolderID not found`);
  } else {
    fs.readdir(ESSAYS_PATH, (err, files) => {
      if (err || files.length === 0) {
        retrieveAllEssays(secrets.essaysFolderID, sendEssays);
      }
      getEssayDetails();
    });
  }
}


async function sendEssays(files) {
  if (files) {
    await Promise.all(
      files
      .map((file) => {
        downloadFile(file.id, join(ESSAYS_PATH, `${file.id}.txt`))
          .catch(err => {
            console.error('Error fetching file', err);
          })
      })
    );
    watchFiles(files.map(f => f.id));
  } else {
    console.error('no files found');
  }
}

function retrieveAllEssays(folderId, callback) {
  function retrievePageOfChildren(pageToken, result) {
    DRIVE.children.list({
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
          callback(result);
        }
      }
    );
  };
  retrievePageOfChildren('', []);
}

function downloadFile(fileId, filename) {
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(filename);
    DRIVE.files
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
              console.log(`Finished downloading ${filename}`);
              resolve();
            })
            .on('error', function (err) {
              reject(new Error(`Error during downloading ${filename}: ${err}`));
            })
            .pipe(dest);
        }
      })
  });
}

// create new document
function getNewID() {
  return new Promise((resolve, reject) => {
    DRIVE.files.generateIds((err, res) => {
      if (err) return reject(err)
      else {
        resolve(res.data.ids[0]);
      }
    })
  });
}

// function createMetaData(metaData) {
//   if (secrets && secrets.detailsFileID) {

//   } else {
//     console.error('could not file detailsFileID');
//   }
// }

async function createEssay(filePath, metaData) {
  const id = await getNewID().catch(err => {
    console.error(err);
    return getRandomID();
  });
  const fileMetadata = {
    'title': id,
    'mimeType': 'application/vnd.google-apps.document'
  };
  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(filePath)
  };
  DRIVE.files.insert({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      console.error(err);
    } else {
      console.log('File Id:', file.id);
      assert.equal(file.id, id);
    }
  });
}

// watch Files

// function watchFile(fileId, channelId, channelType, channelAddress) {
//   var resource = {
//     'id': channelId,
//     'type': channelType,
//     'address': channelAddress
//   };
//   var request = gapi.client.drive.files.watch({
//     'fileId': fileId,
//     'resource': resource
//   });
//   request.execute(function (channel) {
//     console.log(channel);
//   });
// }

// function watchFiles(fileIds) {
//   const channelId = getID();
//   const channelType = 'web_hook';
//   const channelAddress = "/updates";
//   fileIds.forEach(id => {
//     watchFile(id, channelId, channelType, channelAddress);
//   });
// }

// exports

module.exports = {
  createEssay,
  getEssaysContent
}