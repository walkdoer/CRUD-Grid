/**
 * Ext.ux.grid.CRUD组件 Model层-- Grid.CRUD.Controller.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function (require, exports) {
    /**
     * 数据层，发送请求道服务器，将服务器的响应结果交给Controller层进行处理
     *
     */
    'use strict';
    
    var _ = require('crud/public/js/Grid.CRUD.Common.js');
    //引入StoreFactory
    var createStore = function (conf) {
        var defaultConf,
            data = conf.data,
            store = Ext.StoreMgr.get(conf.storeId);
        if (store) {
            console.log('already have store');
            return store;
        }
        if (!_.isArray(data)) {
            defaultConf = {
                proxy: new Ext.data.HttpProxy({
                    api: {
                        read: { url: conf.data.read, method: 'GET' },
                        create: { url: conf.data.create, method: 'POST' },
                        update: { url: conf.data.update, method: 'POST' },
                        destroy: { url: conf.data.delete, method: 'POST' }
                    }
                }),
                autoSave: false,
                autoDestroy: true,
                reader: new Ext.data.JsonReader(conf.reader),
                writer: new Ext.data.JsonWriter({
                    writeAllFields: true,
                    encode: true
                }),
                listeners: {
                    destroy: function () {
                        console.log('store.destroy');
                    }
                }
            };
            store = new Ext.data.Store(defaultConf);
            return store;
        } else {
            var dataFields = [], fields = conf.reader.fields, f, fn;
            for (var i = 0; i < fields.length; i++) {
                f = fields[i];
                fn = {};
                fn.name = f.name;
                if (f.type === 'enum') {
                    fn.type = 'string';
                } else {
                    fn.type = f.type;
                }
                dataFields.push(fn);
            }
            store = new Ext.data.ArrayStore({
                /**
                 * 配置项是一个数组，例如
                   [
                       {name: 'company'},
                       {name: 'price',      type: 'float'},
                       {name: 'change',     type: 'float'},
                       {name: 'pctChange',  type: 'float'},
                       {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
                   ]
                 */
                fields: dataFields
            });
            store.loadData(data);
            return store;
        }
    };

    var successFunc = {}, errorFunc = {};
    //根据config.api的配置来生成具备增删改查的 Store [Ext.data.Store]
    var Model = Ext.extend(Ext.util.Observable, {
        constructor: function (config) {
            //引用上下文
            var that = this;
            //创建store
            var store = createStore(config);

            store.on('beforeload', function () {
                console.log('store load');
            });
            store.on('clear', function () {
                console.log('store clear');
            });
            store.on('exception', function (proxy, type, action, options, res, arg) {
                var record = Ext.isArray(arg) ? arg[0] : arg,
                    msg = res.msg || res.message || Ext.util.JSON.decode(res.responseText).msg + '<br/>[module]' + config.module;
                if (action === 'destroy') {
                    action = 'delete';
                }
                //A valid response was returned from the server having successProperty === false. T
                if (type === 'remote') {
                    that.fireEvent('fail', action, options, record, msg);
                //An invalid response from the server was returned: either 404, 500
                //or the response meta-data does not match that defined in the DataReader
                } else {
                    that.fireEvent('error', action, options, record, msg);
                }
                if (errorFunc[action] && typeof errorFunc[action] === 'function') { 
                    errorFunc[action](); 
                }
            });
            store.on('write', function (store, action, result, res, rs) {
                store.sort('id', 'ASC');
                if (action === 'destroy') {
                    action = 'delete';
                }
                if (successFunc[action] && typeof successFunc[action] === 'function') { 
                    successFunc[action]();
                }
                that.fireEvent('success', store, action, result, res, rs);
            });

            store.on('beforesave', function (store, data) {
                console.info(store, data);
            });

            store.on('beforewrite', function (store, action, record, arg) {
                console.log("record:", record);
            });

            store.on('load', function (store, records, options) {
                that.fireEvent('success', store, 'read', records, options);
            });
            
            this.getStore = function () {
                return store;
            };
            this.addEvents('success', 'error', 'fail');
        },
        saveRecord: function (record) {
            var store = this.getStore();
            if (record) {
                store.insert(0, record);
            }
            store.save();
        },
        removeRecord: function (record) {
            var store = this.getStore();
            if (record) {
                store.remove(record);
                store.save();
            }
        },
        /**
         * 更新记录
         * @param  {Array[Ext.data.Recored]} records     [需要修改的记录]
         * @param  {Object}                  fieldValues [修改的键值对]
         * @param  {Object}                  params      [传回给服务器的额外参数]
         * @param  {Function}                success     [成功回调]
         * @param  {Function}                error       [失败回调]
         */
        updateRecord: function (records, fieldValues, params, success, error) {
            var fieldName, rec, store = this.getStore(), key;
            if (!_.isArray(records)) {
                records = [].concat(records);
            }
            for (var i = 0; i < records.length; i++) {
                rec = records[i];
                for (fieldName in fieldValues) {
                    rec.set(fieldName, fieldValues[fieldName]);
                }
            }
            for (key in params) {
                store.setBaseParam(key, params[key]);
            }
            successFunc.update = success;
            errorFunc.update = error;
            store.save();
        }
    });
    return Model;
});