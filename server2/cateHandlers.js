'use strict';
var db = require('./common/db');
var util = require('./common/util');
db.bind('cate');
exports.read = function (req, res, next) {
    console.log('read');
    db.cate.findItems({}, {
        sort: {
            id: 1
        }
    }, function (err, rows) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '加载成功', rows)));
        res.end();
    });
};

exports.create = function (req, res, next) {
    console.log('newController');
    var data,
        name;
    try {
        data = req.params.data;
        name = data.name || '';
    } catch (e) {
        return next(e);
    }
    name = name.trim();
    if (!name) {
        res.write(JSON.stringify(util.result(false, '名称不可以为空')));
        res.end();
        return;
    }
    db.cate.save({
        name: name,
        post_date: new Date()
    }, function (err, row) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '添加成功', row)));
        res.end();
    });
};

exports.update = function (req, res, next) {
    var data = req.params.data;
    var id = data._id;
    console.log(id);
    db.cate.update({
        _id: db.ObjectID.createFromHexString(id)
    }, {
        $set: {
            name: data.name
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



exports.destroy = function (req, res, next) {
    var id = req.params.data;
    if (!id) {
        res.write(JSON.stringify(util.result(false, '删除失败')));
        res.end();
        return;
    }
    console.log(id, id.length);
    db.cate.removeById(db.ObjectID.createFromHexString(id), function (err) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '删除成功')));
        res.end();
    });
};