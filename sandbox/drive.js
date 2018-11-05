/* eslint-disable */
const fs = require("fs");
const readline = require("readline");
const {
  google
} = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
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
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({
    version: "v3",
    auth
  });
  drive.files.list({
      pageSize: 13,
      q: `'1H8P-D5dLkq4nq2AnjPk8cr3DRR_efS9J' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name)",
    },
    (err, res) => {
      if (err) return console.log(`The API returned an error: ${err}`);
      const files = res.data.files;
      if (files.length) {
        for (const file of files) {
          download(drive, file.id)
        }
      } else {
        console.log("No files found.");
      }
    }
  );
}

function download(drive, fileId) {
  var dest = fs.createWriteStream(`${fileId}.txt`);
  drive.files.export({
      fileId,
      mimeType: "text/plain"
    }, {
      responseType: "stream"
    },
    (err, res) => {
      if (err) console.log(`error exporting file: ${fileId}`)
      else
        res.data
        .on("end", () => {
          console.log('Done');
        })
        .on("error", err => {
          console.log('Error during download ', fileId);
        })
        .pipe(dest);
    }
  );

}