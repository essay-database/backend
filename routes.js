const express = require('express');
const fs = require('fs');
const {
  join
} = require('path');

const router = express.Router();
const essaysPath = './essays';
const statusOk = 200;

function readFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(name, (err, data) => {
      if (err)
        reject(`unable to readFile ${filename}`);
      else
        resolve(data.length);
    });
  })
}

router.get('/', (req, res, next) => {
  fs.readdir(essaysPath, async (err, files) => {
    if (err) return createError(500, err, next)
    files = files.filter((name) => name.endsWith('.txt'));
    const essays = await Promise.all(files.map(name => readFile(name))).catch(err => next(err));
    res.status(statusOk)
      .json(essays);
  })
});

router.get('/:id', async (req, res, next) => {
  let data;
  try {
    data = await readFile(join(essaysPath, `${req.params.id}.txt`))
  } catch (error) {
    return next(error)
  }
  res.status(statusOk)
    .send({
      essay: data
    })
})


module.exports = router;