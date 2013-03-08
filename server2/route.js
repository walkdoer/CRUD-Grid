'use strict';
var mime = require('./conf/mime').types;
var staticPath = '/public/';
var qs = require('querystring');
var handle = require('./handle');
function isStaticPath(path) {
    //如果path是public，且所请求的文件是合法的
    var pathArray = path.split('.'),
        ext = pathArray[pathArray.length-1];
    if (path.indexOf(staticPath) === 0 &&
        !!mime[ext]) {
        return true;
    }
    return false;
}
function route(pathname, request, response) {
    console.log(JSON.stringify(handle));
    if (isStaticPath(pathname)) {
        //这里要记住惨痛的教训，不return导致下面的代码依旧执行
        return handle.method('common', 'readFile')(request, response,function (err) {
            handle.method('common', 'error')(request, response, err);
        });
    }
    var method = handle.method(request.method, pathname);
    if (method) {
        //转化参数
        if (request.method.toLowerCase() === 'post') {
            var body = '';
            request.on('data', function (data) {
                body += data;
            });
            request.on('end', function () {
                var params = qs.parse(body);
                request.body = body;
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        if ((typeof key).toLowerCase() === 'string') {
                            params[key] = JSON.parse(params[key]);
                        }
                    }
                }
                request.params = params;
                method(request, response, function (err) {
                    handle.method('common', 'error')(request, response, err);
                });
            });
        } else {
            method(request, response, function (err) {
                handle.method('common', 'error')(request, response, err);
            });
        }
        
    } else {
        handle.method('common', 'pathNotExist')(request, response, pathname);
    }
}

exports.route = route;