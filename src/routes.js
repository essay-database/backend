const express = require('express');
const {
  readdir
} = require('fs');
const {
  join
} = require('path');
const {
  createEssay,
  getEssay,
  createError
} = require('./api');

const ROUTER = express.Router();
const ESSAYS_PATH = './essays';
const STATUS_OK = 200;

ROUTER.get('/', (req, res, next) => {
  readdir(ESSAYS_PATH, async (err, files) => {
    if (err) return createError(500, err.message, next);
    files = files.filter((name) => name.endsWith('.txt'));
    const essays = await Promise.all(files.map(name => getEssay(join(ESSAYS_PATH, name)))).catch(err => createError(500, err.message, next));
    res.status(STATUS_OK)
      .json(essays);
  })
});

ROUTER.get('/:id', async (req, res, next) => {
  let data;
  try {
    data = await getEssay(join(ESSAYS_PATH, `${req.params.id}.txt`))
  } catch (error) {
    return createError(404, error.message, next);
  }
  res.status(STATUS_OK)
    .send({
      essay: data
    })
})

ROUTER.post('/upload', (req, res, next) => {
  createEssay(req.body.filename, req.body.meta).then(() => {
    res.status(STATUS_OK).send({
      success: true
    })
  }).catch(err => createError(400, err.message, next));
});

module.exports = ROUTER;