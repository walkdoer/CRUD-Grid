'use strict';
var http = require('http'),
    url = require('url'),
    router = require('./route'),
    handle = require('./handle'),
    requestHandlers = require('./requestHandlers');

handle.post('/todo/new', requestHandlers.new);
handle.get('/todo/read', requestHandlers.read);
handle.post('/todo/save', requestHandlers.save);
handle.post('/todo/edit', requestHandlers.edit);
handle.post('/todo/delete', requestHandlers.delete);
handle.post('/todo/update', requestHandlers.update);
handle.post('/todo/finish', requestHandlers.finish);

function start(route) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    response.writeHead(200, {'Content-Type': 'text/plain'});
    route(pathname, request, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log('Server has started.');
}



start(router.route);