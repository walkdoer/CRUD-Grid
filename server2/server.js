'use strict';
var http = require('http'),
    url = require('url'),
    router = require('./route'),
    handle = require('./handle'),
    todoHandlers = require('./todoHandlers'),
    cateHandlers = require('./cateHandlers');

/*todo*/
handle.post('/todo/new', todoHandlers.new);
handle.get('/todo/read', todoHandlers.read);
handle.post('/todo/save', todoHandlers.save);
handle.post('/todo/edit', todoHandlers.edit);
handle.post('/todo/delete', todoHandlers.delete);
handle.post('/todo/update', todoHandlers.update);
handle.post('/todo/finish', todoHandlers.finish);

/*category*/
handle.post('/cate/create', cateHandlers.create);
handle.get('/cate/read', cateHandlers.read);
handle.post('/cate/read', cateHandlers.read);
handle.post('/cate/delete', cateHandlers.destroy);
handle.post('/cate/update', cateHandlers.update);


function start(route) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        response.writeHead(200, {'Content-Type': 'text/plain'});
        route(pathname, request, response);
    }

    http.createServer(onRequest).listen(8080);
    console.log('Server has started.');
}



start(router.route);