const {
	google
} = require('googleapis');
const {
	writeFile
} = require('fs');
const {
	join
} = require('path');
const {
	DETAILS_SHEETID,
	DETAILS_RANGE,
	ESSAYS_PATH
} = require('./config.json');

const OPTIONS = {
	valueRenderOption: 'UNFORMATTED_VALUE'
}

function getEssaysDetails(auth) {
	const sheets = google.sheets({
		version: 'v4',
		auth
	});
	sheets.spreadsheets.values.get({
		spreadsheetId: DETAILS_SHEETID,
		range: DETAILS_RANGE,
		...OPTIONS
	}, (err, res) => {
		if (err) return console.error('The API returned an error: ' + err);
		const rows = res.data.values;
		if (rows.length) {
			return writeDetails(join(ESSAYS_PATH, 'index.json'), rows);
		} else {
			console.log('No data found.');
		}
	});
}

function writeDetails(filename, rows) {
	writeFile(filename, rows, (err) => {
		if (err) {
			console.error(err);
		}
	})
}

module.exports = {
	getEssaysDetails
}