const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
const {
  join
} = require('path');

const router = express.Router();
const essaysPath = './essays';
const statusOk = 200;

router.get('/', (req, res, next) => {
  fs.readdir(essaysPath, (err, files) => {
    if (err) {
      err = createError(500, err);
      return next(err)
    }
    files = files.filter((name) => name === '.' || name === '.')
    const essays = [];
    files.forEach((name) => {
      fs.readFile(name, (err, data) => {
        if (err) {
          err = createError(400, err, {
            expose: true
          })
          return next(err);
        }
        essays.push({
          essays: data
        })
      })
    })
    res.status(statusOk)
      .json(essays);
  })
});

router.get('/:id', (req, res, next) => {
  fs.readFile(join(essaysPath, `${req.params.id}.txt`), (err, data) => {
    if (err) {
      err = createError(400, err);
      return next(err);
    }
    res.status(statusOk)
      .send({
        essay: data
      })
  })
})


module.exports = router;