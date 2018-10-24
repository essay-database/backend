const {
  join
} = require('path');
const {
  readFile,
  writeFile,
  createWriteStream
} = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const {
  ESSAY_FOLDERID,
  ESSAYS_PATH
} = require('./config.json');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
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
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  readFile(TOKEN_PATH, (err, token) => {
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
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const OPTIONS = {
  orderBy: `createdTime desc`,
  pageSize: 1, // dev only,
  q: `'${ESSAY_FOLDERID}' in parents`
};

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getEssays(auth) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  drive.files.list({
    ...OPTIONS,
    fields: 'nextPageToken, files(id)',
  }, (err, res) => {
    if (err) return console.error(`The API returned an error: ${err}`);
    const files = res.data.files;
    if (files.length) {
      downloadEssays(drive, files);
    } else {
      console.log('No files found.');
    }
  });
}

async function downloadEssays(drive, files) {
  await Promise.all(
    files
    .map((file) => {
      downloadEssay(drive, file.id, join(ESSAYS_PATH, `${file.id}.txt`))
        .catch(err => {
          console.error(err);
        })
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
    }, (err, res) => {
      if (err) return reject(err);
      res.data.on('end', function () {
          console.log(`Finished downloading ${filename}`);
          resolve();
        })
        .on('error', function (err) {
          reject(new Error(`Error during downloading ${filename}: ${err}`));
        })
        .pipe(dest);
    })
  });
}