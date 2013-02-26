var db = require('./common/db');
var url = require('url');
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
        console.log(JSON.stringify(result(true, '加载成功', rows)));
        res.write(JSON.stringify(result(true, '加载成功', rows)));
        res.end();
    });
};

exports.new = function(req, res, next) {
    console.log('newController');
    var query = url.parse(req.url, true).query,
        title = query.title;
    console.log("###########333"+ title);
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
    var id = req.params.id;
    db.todo.removeById(id, function(err) {
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