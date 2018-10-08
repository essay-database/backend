const http = require('http');
const app = require('express')
const drive = require('./drive');
const routes = require('./routes')

app.use('essays', routes)

function startWebServer() {
  http.createServer(function(request, response) {
      response.writeHead(200, { 'Content-Type': 'json' });
      response.end('Hello World\n');
    })
    .listen(8124);
  console.log('Server running at http://127.0.0.1:8124/');
}


startWebServer();