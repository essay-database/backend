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

module.exports = {
	getEssay
}