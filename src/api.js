const initialize = require('./authorization');
const {
    getEssaysDetails
} = require('./sheets');
const {
    getEssaysContent
} = require('./drive');

initialize([getEssaysContent, getEssaysDetails]);