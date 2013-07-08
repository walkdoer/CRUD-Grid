'use strict';
var db = require('./common/db'),
    util = require('./common/util');

db.bind('todo');
exports.read = function (req, res, next) {
    console.log('read');
    db.todo.findItems({}, {
        sort: {
            id: 1,
            finished: 1
        }
    }, function (err, rows) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '加载成功', rows)));
        res.end();
    });
};

exports.new = function (req, res, next) {
    console.log('newController');
    var data,
        title;
    try {
        data = req.params.data;
        title = data.title || '';
    } catch (e) {
        console.log(e);
        return next(e);
    }
    title = title.trim();
    if (!title) {
        res.write(JSON.stringify(util.result(false, '添加失败')));
        res.end();
        return;
    }
    if (!data.type_id) {
        res.write(JSON.stringify(util.result(false, '添加失败, 没有选择类型')));
        res.end();
        return;
    }
    db.todo.save({
        title: title,
        type_id: data.type_id,
        subType: data.subType,
        post_date: new Date()
    }, function (err, row) {
        if (err) {
            console.log("error");
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '添加成功', row)));
        res.end();
    });
};

exports.view = function (req, res, next) {
    console.log('viewController');
};

exports.edit = function (req, res, next) {
    var data = req.params.data;
    var id = data._id;
    console.log(id);
    db.todo.update({
        _id: db.ObjectID.createFromHexString(id)
    }, {
        $set: {
            title: data.title,
            type_id: data.type_id,
            subType: data.subType,
            finished: data.finished
        }
    }, {
        raw: true
    }, function  (err, row) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '编辑成功', data)));
        res.end();
    });
};

exports.save = function (req, res, next) {
    var id = req.params.id;
    var title = req.body.title || '';
    title = title.trim();
    if (!title) {
        return res.render('error.html', {
            message: '标题是必须的'
        });
    }
    db.todo.update(id, {
        $set: {
            title: title
        }
    }, function (err, res) {
        console.log('########' + err);
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '编辑成功', res)));
        res.end();
    });
};

exports.delete = function (req, res, next) {
    var id = req.params.data;
    if (!id) {
        res.write(JSON.stringify(util.result(false, '删除失败')));
        res.end();
        return;
    }
    console.log(id, id.length);
    db.todo.removeById(db.ObjectID.createFromHexString(id), function (err) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '删除成功')));
        res.end();
    });
};

exports.finish = function (req, res, next) {
    var finished = req.query.status === 'yes' ? 1 : 0;
    var id = req.params.id;
    db.todo.update({
        _id: db.ObjectID.createFromHexString(id)
    }, {
        $set: {
            finished: finished
        }
    }, function (err, res) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '改变状态成功', res)));
        res.end();
    });
};