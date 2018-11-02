const { google } = require("googleapis");
const {
  DETAILS_SHEETID,
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
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: DETAILS_SHEETID,
      range: DETAILS_RANGE,
      ...OPTIONS
    },
    (err, res) => {
      if (err) console.error(`The API returned an error: ${err}`);
      else {
        const rows = res.data.values;
        if (rows.length) {
          const data = JSON.stringify(convertObj(rows));
          write(DETAILS_PATH, data)
            .then(msg => console.log(msg))
            .catch(err => console.error(err));
        } else {
          console.log("No data found.");
        }
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

module.exports = getEssaysDetails;
