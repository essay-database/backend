const { join } = require("path");

module.exports = {
  ESSAY_FOLDERID: "1H8P-D5dLkq4nq2AnjPk8cr3DRR_efS9J",
  DETAILS_SHEETID: "1VNyrb7Nj5CMo2EARqJKjf99VeYEWWvb4HsSdIOQWiJA",
  DETAILS_RANGE: "essays!A1:L14",
  SCOPES: ["https://www.googleapis.com/auth/drive"],
  ESSAYS_PATH: join(__dirname, "essays"),
  get DETAILS_PATH() {
    return join(this.ESSAYS_PATH, "details.json");
  },
  get INDEX_PATH() {
    return join(this.ESSAYS_PATH, "index.json");
  }
};
