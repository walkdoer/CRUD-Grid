'use strict';

function isArray(a) {
    if (Object.prototype.toString.call(a).indexOf('Array') > 0) {
        return true;
    }
    return false;
}

function result(succsss, msg, data) {
    var res = {
        success: succsss,
        msg: msg
    };
    if (isArray(data)) {
        //是数组，不需要转化
        res.data = data;
    } else if (!!data) {
        //不是数组，需要变成数组
        res.data = [data];
    }
    return res;
}

exports.isArray = isArray;
exports.result = result;