const express = require('express');
const essaysRouter = require('./src/routes');
const {
  createError,
  initialize
} = require('./src/api');

const app = express();
app.use(express.json());

app.get('/init', (req, res) => {
  await initialize();
  res.status(200).send('OK');
})

app.use('/essays', essaysRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, 'Not found'));
});

// error handler
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500);
  console.error(err);
  res.send('an error occured');
});

module.exports = app;