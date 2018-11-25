const { readFile, writeFile } = require("fs");

function read(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, "utf8", (err, data) => {
      if (err) reject(Error(`unable to read ${filename}`));
      else resolve(data);
    });
  });
}

function write(filename, data) {
  return new Promise((resolve, reject) => {
    writeFile(filename, data, err => {
      if (err) reject(Error(`unable to write ${filename}`));
      else resolve(`wrote ${filename}`);
    });
  });
}

function selectRandom(array) {
  return array[getRandomInt(0, array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
  write,
  read,
  selectRandom
};
