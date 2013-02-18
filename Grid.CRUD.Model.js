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

    function isArray(a) {
        if (Object.prototype.toString.call(a).indexOf('Array') > 0) {
            return true;
        }
        return false;
    }
    //引入StoreFactory
    var createStore = function (config) {
        var store, defaultConf,
            data = config.data,
            store = Ext.StoreMgr.get(config.storeId);
        if (store) {
            console.log('already have store');
            return store;
        }
        if (!isArray(data)) {
            defaultConf = {
                proxy: new Ext.data.HttpProxy({
                    api: {
                        load: { url: config.read, method: 'POST' },
                        create: { url: config.create, method: 'POST' },
                        update: { url: config.update, method: 'POST' },
                        destroy: { url: config.delete, method: 'POST' }
                    }
                }),
                autoSave: true,
                reader: new Ext.data.JsonReader({
                    successProperty: 'success',
                    idProperty: 'id',
                    messageProperty: 'msg',
                    totalProperty: 'count',
                    root: 'list',
                    fields: config.fields
                }),
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
            store = new Ext.data.ArrayStore({
                fields: [
                   {name: 'company'},
                   {name: 'price',      type: 'float'},
                   {name: 'change',     type: 'float'},
                   {name: 'pctChange',  type: 'float'},
                   {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
                ]
            });
            store.loadData(data);
            return store;
        }
    };

    //根据config.api的配置来生成具备增删改查的 Store [Ext.data.Store]
    var Model = Ext.extend(Ext.util.Observable, {
        constructor: function (config) {
            //引用上下文
            var that = this;
            //定义store
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
                    that.fireEvent('fail', [action, record, msg]);
                //An invalid response from the server was returned: either 404, 500
                //or the response meta-data does not match that defined in the DataReader
                } else {
                    that.fireEvent('error', [action, record, msg]);
                }
            });
            store.on('write', function (store, action, result, res /*rs*/) {
                store.sort('id', 'ASC');
                if (action === 'destroy') {
                    action = 'delete';
                }
                that.fireEvent('success', [action, result, res]);
            });
            this.getStore = function () {
                return store;
            };
            this.addEvents('success','error', 'fail');
        }
    });
    return Model;
});