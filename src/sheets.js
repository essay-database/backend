const { google } = require("googleapis");
const {
  DETAILS_SHEET_ID,
  DETAILS_RANGE,
  DETAILS_PATH
} = require("../config.js");
const { write } = require("./shared");

const OPTIONS = {
  valueRenderOption: "UNFORMATTED_VALUE"
};

function getEssaysDetails(auth) {
  const sheets = google.sheets({
    version: "v4",
    auth
  });
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: DETAILS_SHEET_ID,
        range: DETAILS_RANGE,
        ...OPTIONS
      },
      (err, res) => {
        if (err) reject(Error`The API returned an error: ${err}`);
        else {
          const rows = res.data.values;
          if (rows && rows.length) {
            const data = JSON.stringify(convertObj(rows));
            resolve(write(DETAILS_PATH, data));
          } else {
            reject(Error("No data found."));
          }
        }
      }
    );
  });
}

function convertObj(rows) {
  let headers;
  const results = [];
  rows.forEach((row, idx) => {
    if (idx === 0) {
      headers = row;
    } else {
      const obj = {};
      row.forEach((cell, idx) => {
        obj[headers[idx]] = cell;
      });
      results.push(obj);
    }
  });
  return results;
}

module.exports = getEssaysDetails;
