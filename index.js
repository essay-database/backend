const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { secrets } = require('./secrets.json');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
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

function sendEssays(files) {
  console.log(files);
}

function getEssays(auth) {
  const { folderId = null } = secrets;
  if (!secrets) {
    console.error(`folderId not found`);
  } else {
    retrieveAllEssaysInFolder(auth, folderId, sendEssays);
  }
}

function retrieveAllEssaysInFolder(auth, folderId, callback) {
  var retrievePageOfChildren = function(request, result, drive) {
    drive.children.list(
      {
        folderId: '1H8P-D5dLkq4nq2AnjPk8cr3DRR_efS9J',
        maxResults: 1000
      },
      (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        result = result.concat(res.items);
        var nextPageToken = res.nextPageToken;
        if (nextPageToken) {
          request = gapi.client.drive.children.list({
            folderId: folderId,
            pageToken: nextPageToken
          });
          retrievePageOfChildren(request, result);
        } else {
          callback(result);
        }
      }
    );
  };
  var initialRequest = google.drive.children.list({
    folderId: folderId
  });
  var drive = google.drive({ version: 'v2', auth });
  retrievePageOfChildren(initialRequest, [], drive);
}
