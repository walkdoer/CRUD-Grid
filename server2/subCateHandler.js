'use strict';
var db = require('./common/db');
var util = require('./common/util');
db.bind('subCate');
exports.read = function (req, res, next) {
    var data = req.params,
        params = {};
    console.log('=======read========');
    if (data && data.type) {
        console.log(data.type);
        console.log(db.ObjectID.createFromHexString(data.type));
        params.parentId = data.type;
    }
    db.subCate.findItems(params, {
        sort: {
            id: 1
        }
    }, function (err, rows) {
        console.dir(rows);
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
    console.dir(data);
    if (!name) {
        res.write(JSON.stringify(util.result(false, '名称不可以为空')));
        res.end();
        return;
    }
    if (!data.parentId) {
        res.write(JSON.stringify(util.result(false, '父类类型不可以为空')));
        res.end();
        return;
    }
    db.subCate.save({
        name: name,
        parentId:  data.parentId,
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
    db.subCate.update({
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
    db.subCate.removeById(db.ObjectID.createFromHexString(id), function (err) {
        if (err) {
            return next(err);
        }
        res.write(JSON.stringify(util.result(true, '删除成功')));
        res.end();
    });
};