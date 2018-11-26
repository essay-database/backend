const { readdir } = require("fs");
const { join } = require("path");
const {
  ESSAYS_PATH,
  SPREADSHEET_FILE,
  ESSAYS_FILE,
  IMAGES_FILE
} = require("../config.js");
const { write, read, selectRandom } = require("./shared");

const LARGE_WIDTH = 1920;
const LARGE_HEIGHT = (LARGE_WIDTH * 3) / 5;
const SMALL_WIDTH = 400;
const SMALL_HEIGHT = 300;
let SPREADSHEET_DATA;
let IMAGES_DATA;

try {
  IMAGES_DATA = require(IMAGES_FILE);
  SPREADSHEET_DATA = require(SPREADSHEET_FILE);
} catch (e) {
  console.error(`api: error loading file: ${e}`);
}

function createEssaysAPI() {
  return new Promise((resolve, reject) => {
    readdir(ESSAYS_PATH, (err, fileNames) => {
      if (err) reject(err);
      else {
        assembleEssays(
          fileNames.filter(file => file.endsWith(".txt")),
          SPREADSHEET_DATA
        )
          .then(files => files.filter(file => !(file instanceof Error)))
          .then(files => write(ESSAYS_FILE, JSON.stringify(files)))
          .then(msgs => resolve(msgs))
          .catch(err => resolve(err));
      }
    });
  });
}

function assembleEssays(files, data) {
  return Promise.all(
    files.map(file => assembleEssay(file, data).catch(err => err))
  );
}

function assembleEssay(fileName, data) {
  return new Promise((resolve, reject) => {
    const essay = data.find(detail => fileName.includes(detail.id));
    if (essay)
      read(join(ESSAYS_PATH, fileName))
        .then(essayText => resolve(format(essay, essayText)))
        .catch(err => reject(err));
    else reject(Error(`api: essay not found: ${fileName}`));
  });
}

function format(essay, essayText) {
  const sep = "||";
  let paragraphs = essayText.replace(/[\n\r]+/g, sep);
  paragraphs = paragraphs.replace(/\uFEFF/g, "");
  paragraphs = paragraphs.split(sep);
  essay.paragraphs = paragraphs;
  const { smallImageURL, largeImageURL } = getImage();
  return {
    ...essay,
    tag: getTag(essay),
    smallImageURL,
    largeImageURL
  };
}

const getImage = picsum();

function picsum() {
  const images = IMAGES_DATA.map(img => img.id);
  return () => {
    const randomIndex = selectRandom(images);
    return {
      largeImageURL: `https://picsum.photos/${LARGE_WIDTH}/${LARGE_HEIGHT}?image=${randomIndex}`,
      smallImageURL: `https://picsum.photos/${SMALL_WIDTH}/${SMALL_HEIGHT}?image=${randomIndex}`
    };
  };
}

function getTag(essay) {
  const { featured } = essay;
  delete essay.featured;
  if (featured) return "featured";
  return Math.random() < 0.5 ? "new" : "popular";
}

module.exports = createEssaysAPI;
