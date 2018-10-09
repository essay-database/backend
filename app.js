// packages
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
// modules
const drive = require('./drive'); // runs code in drive
const essaysRouter = require('./routes');

const app = express();
app.use(logger('backend:dev'));
app.use(express.json());

app.use('/essays', essaysRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;