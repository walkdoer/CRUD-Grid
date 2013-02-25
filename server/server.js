/**
 * todo - conf/config.js
 * zhangmhao@gmail.com
 */
'use strict';
require('./lib/patch');
var connect = require('connect');
var render = require('connect-render');
var urlrouter = require('urlrouter');
var config = require('./conf/config');
var todo = require('./controllers/todo');

var app = connect();

app.use('/public', connect.static(__dirname + '/public', {maxAge: 3600000 * 24 * 30}));

app.use(connect.cookieParser());
app.use(connect.query());
app.use(connect.bodyParser());
app.use(connect.session({secret: config.session_secret}));
app.use(connect.csrf());
app.use(render({
	root: __dirname + '/views',
	layout: 'layout.html',
	cache: config.debug//debug模式不使用cache
}));

/**
 * 路由 Router
 */
var router = urlrouter(function (app) {
	app.get('/todo', todo.read);
	app.post('/todo/new', todo.new);
	app.get('/todo/:id', todo.view);
	app.get('/todo/:id/edit', todo.edit);
	app.post('/todo/:id/edit', todo.save);
	app.get('/todo/:id/delete', todo.delete);
	app.get('/todo/:id/finish', todo.finish);
	app.get('/refresh', todo.refresh);
});

app.use(router);

app.listen(config.port);
console.log('Server start on ' + config.port);