var http = require('http');
var url = require('url');
var config = require('./conf/config');

var router = require("./route");
var requestHandlers = require("./requestHandlers");
/*
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    res.write(JSON.stringify(query));
    res.end();
}).listen(1337, '127.0.0.1');*/
var handle = {
    error: function (errorMsg) {
        return "Error:" + errorMsg;
    }
};
handle["/todo/new"] = requestHandlers.new;
handle["/todo/read"] = requestHandlers.read;
handle["/todo/save"] = requestHandlers.save;
handle["/todo/edit"] = requestHandlers.edit;
handle["/todo/delete"] = requestHandlers.delete;
handle["/todo/update"] = requestHandlers.update;
handle["/todo/finish"] = requestHandlers.finish;
function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    response.writeHead(200, {"Content-Type": "text/plain"});
    route(handle, pathname, request, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}



start(router.route, handle);