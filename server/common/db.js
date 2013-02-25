/**
* todo - common/db.js
* zhangmhao@gmail.com
*/

'use strict';

var mongoskin = require('mongoskin'),
	config = require('../conf/config'),
	db = mongoskin.db(config.db),
	noop = function () {
		// body...
	};

db.bind('todo');
db.todo.ensureIndex({finished: 1}, noop);

module.exports = db;