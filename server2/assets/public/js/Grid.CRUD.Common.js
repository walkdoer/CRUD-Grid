/**
 * Ext.ux.grid.CRUD组件 Common函数-- Grid.CRUD.Common.js
 * zhangmhao@gmail.com
 * 2013-4-10 10：21
 */
define(function (require, exports) {
    'use strict';
    var FONT_WIDTH_CN = 14,
        FONT_WIDTH_EN = 7;
    var addCssByStyle = function addCssByStyle(cssString) {
        var doc = document;
        var style = doc.createElement("style");
        style.setAttribute("type", "text/css");

        if (style.styleSheet) {// IE
            style.styleSheet.cssText = cssString;
        } else {// w3c
            var cssText = doc.createTextNode(cssString);
            style.appendChild(cssText);
        }

        var heads = doc.getElementsByTagName("head");
        if (heads.length) {
            heads[0].appendChild(style);
        }
        else {
            doc.documentElement.appendChild(style);
        }
    };

    function is(type, obj) {
        if (Object.prototype.toString.call(obj).indexOf(type) > 0) {
            return true;
        }
        return false;
    }
    function isWindow(obj) { return obj !== null && obj === obj.window; }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && obj.__proto__ === Object.prototype;
    }
    function cloneObject(obj, except) {
        var clone = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (typeof(obj[i]) === "object") {
                    if (except.indexOf(i) < 0) {
                        clone[i] = cloneObject(obj[i]);
                    } else {
                        clone[i] = obj[i];
                    }
                } else {
                    clone[i] = obj[i];
                }
            }

        }
        return clone;
    }
    /**
     * 设置BaseParam
     * @param {Ext.data.Store} store
     * @param {Object}         params 参数
     */
    function setBaseParam(store, params) {
        if (!params) { return; }
        for (var key in params) {
            store.setBaseParam(key, params[key]);
        }
    }
    /**
     * 将两个Object合体
     * @param  {Object} a
     *
     * @param  {Object} b
     * @return {Object}
     */
    function extend(target, source, deep) {
        var key;
        for (key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                extend(target[key], source[key], deep);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }
    function isArray(a) { return is('Array', a); }

    function isObject(a) { return is('Object', a); }
    exports.extend = function (target) {
        var deep, args = Array.prototype.slice.call(arguments, 1);
        if (typeof target === 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function (arg) { extend(target, arg, deep); });
        return target;
    };

    function lowerCaseObjectKey(obj) {
        if (!obj) { return null; }
        var newObj = {};
        for (var key in obj) {
            newObj[key.toLowerCase()] = obj[key];
        }
        return newObj;
    }

    function getMean(data) {
        var min = Number.MAX_VALUE, //最小值
            max = 0, //最大值
            sum = 0,
            d;
        for (var i = data.length - 1; i >= 0; i--) {
            d = data[i];
            if (d > max) {
                max = d;
            }
            if (d < min) {
                min = d;
            }
            sum += d;
        }
        sum = sum - min - max;//去掉两个极端值
        return sum / (data.length - 2);
    }

    /**
     * 将obj中exception中的key值排除掉
     * @param  {Object} obj       待处理的对象
     * @param  {Array} exception  要排除的key数组
     * @return {Object}           需要处理的对象
     */
    function except(inputObj, exception) {
        var obj = inputObj;
        var newObj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                //key值在排除项外，则可以获得
                if (exception.indexOf(key) < 0) {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }
    var TYPES = {
        STRING: 'string',
        BIGSTRING: 'bigstring',
        BOOLEAN: 'boolean',
        DATE: 'date',
        TIME: 'time',
        DATETIME: 'datetime',
        INT: 'int',
        ENUM: 'enum',
        FLOAT: 'float'
    },
    FIELD_TYPE = {
        'string': Ext.form.TextField,
        'bigString': Ext.form.TextArea,
        'boolean': Ext.form.Checkbox,
        'date': Ext.form.DateField,
        'float': Ext.form.NumberField,
        'time': Ext.form.TimeField,
        'int': Ext.form.NumberField,
        'enum': Ext.form.ComboBox,
        /*扩展插件*/
        'datetime': Ext.ux.form.DateTimeField,
        'multiEnum': Ext.ux.form.LovCombo
    };

    /* 备注:
    EXT 有以下几种数据类型，剩下的需要自定义了
        auto (Default, implies no conversion)
        string
        int
        float
        boolean
        date
     */
    /**
     * 计算文字宽度
     */
    exports.calTextWidth = function calTextWidth(str) {
        var width = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                width += FONT_WIDTH_CN;
            } else {
                width += FONT_WIDTH_EN;
            }
        }
        return width;
    };
    exports.isEmpty = function (a) {
        return a === undefined || a === null || a === '';
    };
    exports.SEARCH_FIELD_WIDTH = {
        'boolean': 50
    };
    exports.TYPES = TYPES;
    exports.addCssByStyle = addCssByStyle;
    exports.CRUD_FIELD_ALL = 'crud_field_all_rsfx',
    exports.ALL_NOT_EDITABLE = 0;
    exports.ADD_EDITABLE = 1;
    exports.TRUE = 'crud_true',
    exports.FALSE = 'crud_false',
    exports.EDIT_EDITABLE = 2;
    exports.ALL_EDITABLE = 3;
    exports.except = except;
    exports.getMean = getMean;
    exports.cloneObject = cloneObject;
    exports.FONT_WIDTH_CN = FONT_WIDTH_CN;
    exports.FONT_WIDTH_EN = FONT_WIDTH_EN;
    exports.WIN_SPAN = 40;
    exports.WIN_HEIGHT_SPAN = 75;
    exports.FIELD_TYPE = FIELD_TYPE;
    exports.lowerCaseObjectKey = lowerCaseObjectKey;
    exports.is = is;
    exports.isObject = isObject;
    exports.isArray = isArray;
    exports.setBaseParam = setBaseParam;
});