'use strict';
var db = require('./common/db');
var url = require('url');

function isArray(a) {
    if (Object.prototype.toString.call(a).indexOf('Array') > 0) {
        return true;
    }
    return false;
}

function result(succsss, msg, data) {
    var result = {
        success: succsss,
        msg: msg
    };
    if(isArray(data)) {
        //是数组，不需要转化
        result.data = data;
    } else if (!!data) {
        //不是数组，需要变成数组
        result.data = [data];
    }
    return result;
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
    var data,
        title;
    try {
        data = JSON.parse(req.params.data);
        title = data.title || '';
    } catch (e) {
        return next(e);
    }
    title = title.trim();
    if(!title) {
        res.write(JSON.stringify(result(false, '添加失败')));
        res.end();
        return;
    }
    db.todo.save({
        title: title,
        post_date: new Date()
    }, function(err, row) {
        if(err) {
            return next(err);
        }
        res.write(JSON.stringify(result(true, '添加成功', row)));
        res.end();
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
        res.end();
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
        res.end();
    });
};

exports.delete = function(req, res, next) {
    var id = JSON.parse(req.params.data);
    if (!id) {
        res.write(JSON.stringify(result(false, '删除失败')));
        res.end();
        return;
    }
    console.log(id, id.length);
    db.todo.removeById(db.ObjectID.createFromHexString(id), function(err) {
        if(err) {
            return next(err);
        }
        res.write(JSON.stringify(result(true, '删除成功')));
        res.end();
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
        res.write(JSON.stringify(result(true, '改变状态成功', result)));
        res.end();
    });
};