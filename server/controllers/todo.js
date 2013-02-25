/**
 * todo - conf/config.js
 * zhangmhao@gmail.com
 */
'use strict';

var config = require('../conf/config');
var db = require('../common/db');

function result(succsss, msg, data) {
    return {
        succsss: succsss,
        msg: msg,
        data: data
    };
}
exports.read = function(req, res, next) {
    console.log('read');
    db.todo.findItems({}, {
        sort: {
            id: 1,
            finished: 1
        }
    }, function(err, rows) {
        if(err) {
            return next(err);
        }
        res.write(JSON.stringify(result(true, '加载成功', rows)));
        res.end();
    });
};

exports.new = function(req, res, next) {
    console.log('newController');
    var title = req.body.title || '', msg;
    title = title.trim();
    if(!title) {
        msg = '标题是必须的';
    }
    db.todo.save({
        title: title,
        post_date: new Date()
    }, function(err, row) {
        if(err) {
            return next(err);
        }
        res.write(JSON.stringify(result(true, '添加成功')));
    });
};

exports.view = function(req, res, next) {
    console.log('viewController');
};

exports.edit = function(req, res, next) {
    var id = req.params.id;
    db.todo.findById(id, function(err, row) {
        if(err) {
            return next(err);
        }
        if(!row) {
            return next();
        }
        res.write(JSON.stringify(result(true, '编辑成功', row)));
    });
};

exports.save = function(req, res, next) {
    var id = req.params.id;
    var title = req.body.title || '';
    title = title.trim();
    if(!title) {
        return res.render('error.html', {
            message: '标题是必须的'
        });
    }
    db.todo.updateById(id, {
        $set: {
            title: title
        }
    }, function(err, result) {
        if(err) {
            return next(err);
        }
        res.write(JSON.stringify(result(true, '编辑成功', result)));
    });
};

exports.delete = function(req, res, next) {
    var id = req.params.id;
    db.todo.removeById(id, function(err) {
        if(err) {
            return next(err);
        }
        JSON.stringify(result(true, '删除成功'));
    });
};

exports.finish = function(req, res, next) {
    var finished = req.query.status === 'yes' ? 1 : 0;
    var id = req.params.id;
    db.todo.updateById(id, {
        $set: {
            finished: finished
        }
    }, function(err, result) {
        if(err) {
            return next(err);
        }
        JSON.stringify(result(true, '改变状态成功', result));
    });
};