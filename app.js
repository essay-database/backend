// packages
const express = require('express');
// modules
const trackChanges = require('./drive'); // runs code in drive
const essaysRouter = require('./routes');
const {
  createError
} = require('./shared');

const app = express();
app.use(express.json());
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
  res.send('error');
});

// trackChanges();
module.exports = app;