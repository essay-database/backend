const express = require('express');
const router = express.Router();
const fs = require('fs');
const {
  join
} = require('path');
const essaysPath = './essays';
const statusOk = 200;

function createErrorCustom(status, next) {
  createError(status);
  next(err)
}

router.get('/', (req, res, next) => {
  fs.readdir(essaysPath, (err, files) => {
    if (err) {
      err.status = 400;
      return next(err)
    }
    files = files.filter((name) => name === '.' || name === '.')
    const essays = [];
    files.forEach((name) => {
      fs.readFile(name, (err, data) => {
        if (err) return next(err)
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
    if (err) return next(err)
    res.status(statusOk)
      .send({
        essay: data
      })
  })
})


module.exports = router;