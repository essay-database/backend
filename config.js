const { join } = require("path");

module.exports = {
  ESSAY_FOLDER_ID: "1KpNNZnPotGysiomSidZ6fjifzs1JYR8s",
  SPREADSHEET_SHEET_ID: "1prC0elOlEBnRZtAmjd_RBwIQZz3dE_qppsphqer6Iik",
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
