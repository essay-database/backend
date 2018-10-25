const {
  readFile,
  writeFile
} = require('fs');

function read(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, 'utf8', (err, data) => {
      if (err) reject(new Error(`unable to read ${filename}`));
      else resolve(data);
    });
  });
}

function write(filename, data) {
  return new Promise((resolve, reject) => {
    writeFile(filename, data, err => {
      if (err) reject(new Error `unable to write ${filename}`);
      else resolve(`wrote ${filename}`);
    });
  })
}

module.exports = {
  write,
  read
}