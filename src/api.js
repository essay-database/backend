const {
	readFile
} = require('fs');
const initialize = require('./authorization');
const {
	getEssaysDetails
} = require('./sheets');
const {
	getEssaysContent
} = require('./drive');

// run on load from routes.js
initialize([getEssaysContent, getEssaysDetails]);

function getEssay(filename) {
	return new Promise((resolve, reject) => {
		readFile(filename, (err, data) => {
			if (err)
				reject(new Error(`unable to read ${filename}`));
			else
				resolve({
					content: data
				});
		});
	})
}

// TODO
function createEssay({
	text,
	author
}) {

}

function createError(status, message, next) {
	const error = new Error(message);
	error.status = status;
	if (next) return next(error);
	else return error
}

module.exports = {
	getEssay,
	createEssay,
	createError
}