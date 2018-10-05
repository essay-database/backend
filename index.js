const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const secrets = require('./secrets.json');
const { join } = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), getEssays);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
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

function getEssays(auth) {
  if (!secrets || !secrets.folderId) {
    console.error(`folderId not found`);
  } else {
    retrieveAllEssaysInFolder(auth, secrets.folderId, sendEssays);
  }
}

function retrieveAllEssaysInFolder(auth, folderId, callback) {
  const retrievePageOfChildren = function(drive, { pageToken }, result) {
    drive.children.list(
      {
        folderId: folderId,
        maxResults: 1000,
        orderBy: orderByOptions[1],
        pageToken
      },
      (err, res) => {
        if (err) return console.error('The API returned an error: ' + err);
        result = result.concat(res.data.items);
        const nextPageToken = res.nextPageToken;
        if (nextPageToken) {
          retrievePageOfChildren(drive, { pageToken: nextPageToken }, result);
        } else {
          callback(result, drive);
        }
      }
    );
  };
  const drive = google.drive({ version: 'v2', auth });
  retrievePageOfChildren(drive, {}, []);
}

function mkdirCustom(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
async function sendEssays(files, drive) {
  if (files) {
    const dir = './tmp';
    mkdirCustom(dir);
    await Promise.all(
      files.map(({ id: fileId }, idx) => {
        // downloadFile(drive, fileId, join(dir, `essay${idx}.txt`));
      })
    );
  } else {
    console.error('no files found');
  }
}
function downloadFile(drive, fileId, fileName) {
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(fileName);
    drive.files
      .export({
        fileId: fileId,
        mimeType: 'text/plain'
      })
      .on('end', function() {
        console.log('Done');
        resolve(true);
      })
      .on('error', function(err) {
        console.err('Error during download', err);
        reject(false);
      })
      .pipe(dest);
  });
}
