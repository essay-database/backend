const {
  google
} = require('googleapis');
const {
  writeFile
} = require('fs');
const {
  DETAILS_SHEETID,
  DETAILS_RANGE,
  DETAILS_PATH
} = require('../config.js');

const OPTIONS = {
  valueRenderOption: 'UNFORMATTED_VALUE'
};

function getEssaysDetails(auth) {
  const sheets = google.sheets({
    version: 'v4',
    auth
  });
  sheets.spreadsheets.values.get({
      spreadsheetId: DETAILS_SHEETID,
      range: DETAILS_RANGE,
      ...OPTIONS
    },
    (err, res) => {
      if (err) return console.error('The API returned an error: ' + err);
      let rows = res.data.values;
      if (rows.length) {
        rows = JSON.stringify(convertObj(rows));
        writeDetails(DETAILS_PATH, rows);
      } else {
        console.log('No data found.');
      }
    }
  );
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

function writeDetails(filename, data) {
  writeFile(filename, data, err => {
    if (err) {
      return console.error(err);
    }
    console.log(`Wrote details in ${filename}`);
  });
}

module.exports = getEssaysDetails;