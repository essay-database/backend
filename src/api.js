const {
	readFile
} = require('fs');
const {
	ESSAYS_PATH,
	DETAILS_PATH,
	INDEX_PATH
} = require('../config.json');
const authorize = require('./authorization');
const getEssaysDetails = require('./sheets');
const getEssaysContent = require('./drive');

function initialize() {
	authorize([getEssaysContent, getEssaysDetails, createIndex]);
}

function createIndex() {

}

function getEssays() {
	return new Promise((resolve, reject) => {
		readdir(ESSAYS_PATH, async (err, files) => {
			if (err) return reject(err);
			files = files.filter((name) => name.endsWith('.txt'));
			let essays;
			try {
				essays = await Promise.all(files.map(name => getEssay(name)));
			} catch (err) {
				return createError(500, err.message, next);
			}
			res.status(STATUS_OK)
				.json(essays);
		});
	});

}

function getEssay(filename) {
	return new Promise((resolve, reject) => {
		readFile(filename, (err, data) => {
			if (err)
				reject(new Error(`unable to read ${filename}`));
			else
				resolve({
					data
				});
		});
	});
}

// TODO
function createEssay({
	text,
	author
}) {}

function createError(status, message, next) {
	const error = new Error(message);
	console.error(message);
	error.status = status;
	if (next) return next(error);
	else return error;
}

module.exports = {
	getEssay,
	createEssay,
	getEssays,
	createError,
	initialize
}