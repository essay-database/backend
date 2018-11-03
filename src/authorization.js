const { readFile, writeFile } = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
// If modifying these scopes, delete token.json.
const { SCOPES } = require("../config.js");

const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

// Load client secrets from a local file.
function initialize(callbacks) {
  return new Promise((resolve, reject) => {
    readFile(CREDENTIALS_PATH, "utf8", (err, content) => {
      if (err)
        reject(Error(`Error loading client secret file: ${err.message}`));
      // Authorize a client with credentials, then call the Google Sheets API.
      else resolve(authorize(JSON.parse(content), callbacks));
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callbacks The callback to call with the authorized client.
 */
function authorize(credentials, callbacks) {
  const { clientSecret, clientId, redirectUris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUris[0]
  );
  return new Promise(resolve => {
    // Check if we have previously stored a token.
    readFile(TOKEN_PATH, "utf8", (err, token) => {
      if (err) resolve(getNewToken(oAuth2Client, callbacks));
      else {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(execCallbacks(callbacks, oAuth2Client));
      }
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callbacks The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callbacks) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err)
          reject(Error(`Error while trying to retrieve access token: ${err}`));
        else {
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          writeFile(TOKEN_PATH, JSON.stringify(token), err => {
            if (err) reject(err);
            else {
              console.log("Token stored to", TOKEN_PATH);
              resolve(execCallbacks(callbacks, oAuth2Client));
            }
          });
        }
      });
    });
  });
}

function execCallbacks(callbacks, oAuth2Client) {
  return Promise.all(callbacks.map(callback => callback(oAuth2Client)));
}

module.exports = initialize;
