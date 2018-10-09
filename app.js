// packages
const express = require('express');
const createError = require('http-errors');
// modules
const trackChanges = require('./drive'); // runs code in drive
const essaysRouter = require('./routes');

const app = express();
app.use(express.json());

app.use('/essays', essaysRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;