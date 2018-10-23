const initialize = require('./authorization');
const {
    getEssays: getEssaysDetails
} = require('./sheets');
const {
    getEssays: getEssaysContent
} = require('./drive');


initialize([getEssaysContent, getEssaysDetails]);