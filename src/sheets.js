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
} = require('../config.json');

const OPTIONS = {
	valueRenderOption: 'UNFORMATTED_VALUE'
}
const FILENAME = 'index.json';

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
		let rows = res.data.values;
		if (rows.length) {
			rows = JSON.stringify(convertToObj(res.data.values));
			return writeDetails(join(ESSAYS_PATH, FILENAME), rows);
		} else {
			console.log('No data found.');
		}
	});
}

function convertToObj(rows) {
	let headers;
	let obj;
	const results = [];
	rows.forEach((row, idx) => {
		if (idx === 0) {
			headers = row;
		} else {
			row.map((cell, idx) => ({
				[headers[idx]]: cell
			}));
			results.push(obj);
		}
	});
	return results;
}

function writeDetails(filename, rows) {
	writeFile(filename, rows, (err) => {
		if (err) {
			console.error(err);
		}
	})
}

module.exports = getEssaysDetails;