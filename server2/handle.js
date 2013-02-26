/**
 * handle.js
 */
'use strict';
var url = require('url'),
    mime = require('./conf/mime'),
    fs = require('fs'),
    path = require('path');
var getHandler = {},
    postHandler = {},
    commonHandler = {
        error: function (request, response, errorMsg) {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            if (typeof errorMsg !== 'string') {
                errorMsg = errorMsg.toString();
            }
            response.end(errorMsg);
        },
        pathNotExist: function (request, response, pathname) {
            console.log(pathname);
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('This request URL ' + pathname + ' was not found on this server.');
            response.end();
        },
        readFile: function (request, response, next) {
            var pathname = url.parse(request.url).pathname;
            var realPath = './assets' + pathname;
            var ext = path.extname(realPath);
            ext = ext ? ext.slice(1) : 'unknow';
            var contentType = mime[ext];
            fs.exists(realPath, function (exists) {
                if (!exists) {
                    response.writeHead(404, {'Content-Type': 'text/plain'});
                    response.write('This request URL ' + pathname + ' was not found on this server.');
                    response.end();
                } else {
                    fs.readFile(realPath, 'binary', function(err, file){
                        if (err) {
                            return next(err);
                        } else {
                            console.log(file);
                            response.writeHead(200, {'Content-Type': contentType});
                            response.write(file, 'binary');
                            response.end();
                        }
                    });
                }
            });
        }
    },
    handler = {
        get: getHandler,
        post: postHandler,
        common: commonHandler,
    };


exports.get = function (router, callback) {
    getHandler[router] = callback;
};
exports.common = function (router, callback) {
    commonHandler[router] = callback;
};
exports.post = function (router, callback) {
    postHandler[router] = callback;
};
exports.method = function (name, methodName) {
    name = name.toLowerCase();
    console.log(name, methodName, typeof handler[name][methodName]);
    return handler[name][methodName];
};