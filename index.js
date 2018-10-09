const http = require('http');
const app = require('express');
const drive = require('./drive');
const routes = require('./routes');

app.use('essays', routes);

function startServer() {
  drive();
  app.listen(port, () => console.log(`Server listening on port ${port}!`));
}

startServer();