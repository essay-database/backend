const {
    DETAILS_SHEETID,
    DETAILS_RANGE
} = require('./secrets.json');

function getEssays(auth) {
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    sheets.spreadsheets.values.get({
        spreadsheetId: DETAILS_SHEETID,
        range: DETAILS_RANGE,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            rows.map((row) => {
                console.log(row);
            });
        } else {
            console.log('No data found.');
        }
    });
}

module.exports = {
    getEssays
}