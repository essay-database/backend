// packages
const express = require('express');
const {
  readFile,
  readdir
} = require('fs');
const {
  join
} = require('path');
// modules
const {
  createError
} = require('./shared');

const router = express.Router();
const essaysPath = './essays';
const statusOk = 200;

function readFileWrapper(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, (err, data) => {
      if (err)
        reject(new Error(`unable to readFile ${filename}`));
      else
        resolve(data.length);
    });
  })
}

router.get('/', (req, res, next) => {
  readdir(essaysPath, async (err, files) => {
    if (err) return createError(500, err.message, next);
    files = files.filter((name) => name.endsWith('.txt'));
    const essays = await Promise.all(files.map(name => readFileWrapper(join(essaysPath, name)))).catch(err => createError(404, err.message, next));
    res.status(statusOk)
      .json(essays);
  })
});

router.get('/:id', async (req, res, next) => {
  let data;
  try {
    data = await readFileWrapper(join(essaysPath, `${req.params.id}.txt`))
  } catch (error) {
    return createError(404, err.message, next);
  }
  res.status(statusOk)
    .send({
      essay: data
    })
})


module.exports = router;