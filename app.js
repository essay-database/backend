const app = require('express');

const routes = require('./routes');


app.use('essays', routes);

module.exports = app;