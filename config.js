const {
  join
} = require('path');

export default {
  "ESSAY_FOLDERID": "1H8P-D5dLkq4nq2AnjPk8cr3DRR_efS9J",
  "DETAILS_SHEETID": "1VNyrb7Nj5CMo2EARqJKjf99VeYEWWvb4HsSdIOQWiJA",
  "DETAILS_RANGE": "essays!A1:J14",
  "SCOPES": ["https://www.googleapis.com/auth/drive"],
  "ESSAYS_PATH": join(__dirname, "essays"),
  "DETAILS_PATH": join(this.ESSAYS_PATH, 'details.json'),
  "INDEX_PATH": join(this.ESSAYS_PATH, 'index.json')
}