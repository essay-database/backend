const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const secrets = require('./secrets.json');
const {
  join
} = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';
let DRIVE;

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), getEssaysAndTrackChanges);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

// end of authorization
const essaysPath = './essays';
const updateInterval = 1000 * 20; // dev only
const options = {
  orderBy: `createdDate desc`,
  maxResults: 12, // dev only
}

function getEssaysAndTrackChanges(auth) {
  DRIVE = google.drive({
    version: 'v2',
    auth
  });
  getEssays();
  trackChanges();

}

function getEssays() {
  if (!secrets || !secrets.folderId) {
    console.error(`folderId not found`);
  } else {
    fs.readdir(essaysPath, (err, files) => {
      if (err || files.length === 0)
        retrieveAllEssaysInFolder(secrets.folderId, sendEssays);
    });
  }
}

async function sendEssays(files) {
  if (files) {
    await Promise.all(
      files
      .map((file) => {
        downloadFile(file.id, join(essaysPath, `${file.id}.txt`))
          .catch(err => {
            console.error('Error fetching file', err);
          })
      })
    )
  } else {
    console.error('no files found');
  }
}

function retrieveAllEssaysInFolder(folderId, callback) {
  function retrievePageOfChildren(pageToken, result) {
    DRIVE.children.list({
        folderId: folderId,
        orderBy: options.orderBy,
        maxResults: options.maxResults,
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

// shared

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
  DRIVE
}

function createMetaData(metaData) {

}

function createDocument(filePath, metaData) {
  const id = getNewID();
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
      // Handle error
      console.error(err);
    } else {
      console.log('File Id:', file.id);
    }
  });
}

module.exports = {
  createDocument
}