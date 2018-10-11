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

const orderByOptions = [
  'createdDate',
  'folder',
  'lastViewedByMeDate',
  'modifiedByMeDate',
  'modifiedDate',
  'quotaBytesUsed',
  'recency',
  'sharedWithMeDate',
  'starred',
  'title'
];

const essaysPath = './essays';

// TODO change to watching ??
function getEssaysAndTrackChanges(auth) {
  const drive = google.drive({
    version: 'v2',
    auth
  });
  getEssays(drive);
  trackChanges(drive)
}

function getEssays(drive) {
  if (!secrets || !secrets.folderId) {
    console.error(`folderId not found`);
  } else {
    fs.readdir(essaysPath, (err, files) => {
      if (err || files.length === 0)
        retrieveAllEssaysInFolder(drive, secrets.folderId, sendEssays);
    });
  }
}

async function sendEssays(drive, files) {
  if (files) {
    await Promise.all(
      files
      .map((file) => {
        downloadFile(drive, file.id, join(essaysPath, `${file.id}.txt`))
          .catch(err => {
            console.error('Error fetching file', err);
          })
      })
    )
  } else {
    console.error('no files found');
  }
}

const options = {
  orderBy: `${orderByOptions[0]} desc`,
  maxResults: 12, // dev only
}

function retrieveAllEssaysInFolder(drive, folderId, callback) {
  function retrievePageOfChildren(pageToken, result) {
    drive.children.list({
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
          callback(drive, result);
        }
      }
    );
  };
  retrievePageOfChildren('', []);
}

// shared

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

// changes //

const updateInterval = 1000 * 50; // dev only

async function trackChanges(drive) {
  let token = '';
  setInterval(async () => {
    getChanges(drive, token, applyChanges);
  }, updateInterval);
}

function getChanges(drive, token, callback) {
  function childHelper(pageToken, results) {
    drive.changes.list({
      pageToken: pageToken
    }, function (err, res) {
      if (err) {
        return console.error('The API list returned an error: ' + err);
      } else {
        results = results.concat(res.items);
        pageToken = res.nextPageToken;
        newStartPageToken = res.newStartPageToken;
        if (pageToken) {
          childHelper(pageToken, results);
        } else {
          callback({
            items: results,
            newStartPageToken,
          })
        }
      }
    });
  }
  childHelper(token, []);
}

async function applyChanges({
  items: changes,
  newStartPageToken
}) {
  if (changes) {
    await Promise.all(changes.map((change) => applyChange(change).catch(err => console.error(`unable to apply changes to ${file.fileId}: ${err}`))));
  } else {
    console.error(`no changes found!`);
  }
}

function applyChange(change) {
  return new Promise((resolve, reject) => {
    const filename = join(essaysPath, `${changes.fileId}.txt`);
    if (change.deleted) {
      fs.unlink(filename, (err) => {
        if (err)
          reject(err);
        else
          resolve();
      })
    } else if (change.file) {
      downloadFile(drive, changes.fileId, filename).then(() => resolve()).catch((err) => reject(err));
    } else {
      reject(`no change to apply`)
    }
  });
}