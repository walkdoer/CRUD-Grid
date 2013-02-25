<<<<<<< HEAD
/**
 * Ext.ux.grid.CRUD组件 Controller层-- Grid.CRUD.Controller.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
    /**
     * 组件的Controller层，协调Model层和View层
     *
     */
    'use strict';
    var Model = require('crud/Grid.CRUD.Model.js'),
        config = require('crud/Grid.CRUD.Config.js'),
        View = require('crud/Grid.CRUD.View.js');

    //create namespace
    Ext.ns('Ext.ux.CRUD');

    /*************************************************
     *----------------使用实例
      //Ext.uc.CRUD的使用方法如下：
        var gridPanel = new Ext.ux.CRUD({
            id: 'System:Module:SubModule',
            title: 'MyCrudPanel' ,
            //.... 其他配置项依旧类似于原生Grid配置
            //自定义的配置项
            api: {
                update: 'path/to/update',
                delete: 'path/to/delete',
                create: 'path/to/create',
                read: 'path/to/read'
            },
            toolbar: {
                searchBar: false,//不需要搜索框
                buttons: ['create', 'delete', 'refresh']
            }
        });
     *****************************************************/
    
    var successHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    }, errorHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    }, failHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    };
    Ext.ux.CRUD = Ext.extend(Ext.Panel, {
        initComponent: function() {
            this.layout = 'fit',
            Ext.ux.CRUD.superclass.initComponent.apply(this, arguments);
            //初始化配置模块
            config.init(this.initialConfig);
            //初始化数据库
            var model = new Model({
                storeId: 'mydata',
                data: this.data || this.api,
                fields: config.get('store','fields')
            });
            var view = new View();
            model.on({
                'success': function (action, result, res) {
                    //请求成功
                    successHandler[action](result, res);
                },
                'fail': function (action, record, msg) {
                    //请求成功，只是返回一个失败的结果
                    failHandler[action](record, msg);
                },
                'error': function (action, record, msg) {
                    //请求失败404 500 或者 DataReader配置有错
                    errorHandler[action](record, msg);
                }
            });

            view.on({
                'tbar-btn-delete': function () {
                    //todo 编写删除
                    console.log('删除');
                },
                'tbar-btn-refresh': function () {
                    //todo 编写刷新
                    console.log('刷新');
                },
                'tbar-btn-add': function () {
                    //todo 编写添加
                    console.log('添加');
                }
            });
            
            //初始化界面
            this.add(view.init({
                id: this.id,
                store: model.getStore(),
                columns: this.columns
            }));
        }
    });
});
=======
/**
 * Ext.ux.grid.CRUD组件 Controller层-- Grid.CRUD.Controller.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
    /**
     * 组件的Controller层，协调Model层和View层
     *
     */
    'use strict';

    var Model = require('crud/Grid.CRUD.Model.js'),
        config = require('crud/Grid.CRUD.Config.js'),
        View = require('crud/Grid.CRUD.View.js');
    //create namespace
    Ext.ns('Ext.ux.CRUD');
    /**
     * Clone Function
     * @param {Object/Array} o Object or array to clone
     * @return {Object/Array} Deep clone of an object or an array
     * @author Ing. Jozef Sakáloš
     */
    Ext.ux.clone = function(o) {
        if(!o || 'object' !== typeof o) {
            return o;
        }
        if('function' === typeof o.clone) {
            return o.clone();
        }
        var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
        var p, v;
        for(p in o) {
            if(o.hasOwnProperty(p)) {
                v = o[p];
                if(v && 'object' === typeof v) {
                    c[p] = Ext.ux.util.clone(v);
                }
                else {
                    c[p] = v;
                }
            }
        }
        return c;
    }; // eo function clone
    /*************************************************
     *----------------使用实例
      //Ext.uc.CRUD的使用方法如下：
        var gridPanel = new Ext.ux.CRUD({
            id: 'System:Module:SubModule',
            title: 'MyCrudPanel' ,
            //.... 其他配置项依旧类似于原生Grid配置
            //自定义的配置项
            api: {
                update: 'path/to/update',
                delete: 'path/to/delete',
                create: 'path/to/create',
                read: 'path/to/read'
            },
            toolbar: {
                searchBar: false,//不需要搜索框
                buttons: ['create', 'delete', 'refresh']
            }
        });
     *****************************************************/
    
    var successHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    }, errorHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    }, failHandler = {
        create: function (result, res) {

        },
        delete: function (result, res) {

        },
        update: function (result, res) {

        }
    };
    
    Ext.ux.CRUD = Ext.extend(Ext.Panel, {
        initComponent: function() {
            this.layout = 'fit',
            Ext.ux.CRUD.superclass.initComponent.apply(this, arguments);
            //初始化配置模块
            config.init(this.initialConfig);
            //初始化数据库
            var model = new Model({
                storeId: 'mydata',
                data: this.data || this.api,
                fields: config.get('store','fields')
            });
            var view = new View();
            model.on({
                'success': function (action, result, res) {
                    //请求成功
                    successHandler[action](result, res);
                },
                'fail': function (action, record, msg) {
                    //请求成功，只是返回一个失败的结果
                    failHandler[action](record, msg);
                },
                'error': function (action, record, msg) {
                    //请求失败404 500 或者 DataReader配置有错
                    errorHandler[action](record, msg);
                }
            });
            var viewlisteners = {
                'tbar-btn-delete': function () {
                    //todo 编写删除
                    console.log('删除');
                },
                'tbar-btn-refresh': function () {
                    //todo 编写刷新
                    console.log('刷新');
                },
                'tbar-btn-add': function () {
                    //todo 编写添加
                    console.log('添加');
                    view.addRecord();
                }
            };
            viewlisteners[config.getEvent('view','ROW_DBL_CLICK')] = function () {
                console.log('双击row');
            };
            view.on(viewlisteners);
            
            //初始化界面
            this.add(view.init({
                id: this.id,
                store: model.getStore(),
                columns: config.get('grid', 'columns'),
                noClicksToEdit: config.get('grid', 'noClicksToEdit')
            }));
        }
    });
});

/**
 * 日志的规范 [组建名][组件类型][日志内容][备注]
 */
>>>>>>> 结合rowEditor的编辑器
