const { join } = require("path");

module.exports = {
  ESSAY_FOLDER_ID: "1H8P-D5dLkq4nq2AnjPk8cr3DRR_efS9J",
  SPREADSHEET_SHEET_ID: "1VNyrb7Nj5CMo2EARqJKjf99VeYEWWvb4HsSdIOQWiJA",
  SPREADSHEET_RANGE: "essays",
  SCOPES: ["https://www.googleapis.com/auth/drive"],
  ESSAYS_PATH: join(__dirname, "essays"),
  get SPREADSHEET_FILE() {
    return join(this.ESSAYS_PATH, "spreadsheet.json");
  },
  get ESSAYS_FILE() {
    return join(this.ESSAYS_PATH, "essays.json");
  },
  get IMAGES_FILE() {
    return join(this.ESSAYS_PATH, "picsum.json");
  }
};
