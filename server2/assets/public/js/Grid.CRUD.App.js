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

    var Model = require('crud/public/js/Grid.CRUD.Model.js'),
        config = require('crud/public/js/Grid.CRUD.Config.js'),
        View = require('crud/public/js/Grid.CRUD.View.js');
    //create namespace
    Ext.ns('Ext.ux.CRUD');
    /**
     * Clone Function
     * @param {Object/Array} o Object or array to clone
     * @return {Object/Array} Deep clone of an object or an array
     * @author Ing. Jozef Sakáloš
     */
    Ext.ux.clone = function (o) {
        if (!o || 'object' !== typeof o) {
            return o;
        }
        if ('function' === typeof o.clone) {
            return o.clone();
        }
        var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
        var p, v;
        for (p in o) {
            if (o.hasOwnProperty(p)) {
                v = o[p];
                if (v && 'object' === typeof v) {
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
    Ext.ux.CRUD = Ext.extend(Ext.Panel, {
        initComponent: function() {
            var that = this,
                reloadMethod; //store.reload() or store.loadData()
            if (!!that.data) {
                reloadMethod = 'loadData';
            } else if (!!that.api) {
                reloadMethod = 'reload';
            }
            this.layout = 'fit',
            Ext.ux.CRUD.superclass.initComponent.apply(this, arguments);
            //初始化配置模块
            config.init(this.initialConfig);
            //初始化数据库
            var model = new Model({
                storeId: 'mydata',
                data: this.data || this.api,
                reader: config.get('store', 'reader')
            });

            var tbarConfig = config.get('grid', 'tbar');
            tbarConfig.id = config.getId('grid', 'tbar');
            var view = new View({
                event: config.get('event', 'view'), //View模块用到的事件
                tbar: tbarConfig,//顶部工具拦的配置
                fieldType: config.get('fieldType'),//字段类型与对应Ext编辑字段的对应关系 string: Ext.form.TextField
                idProperty: config.get('store', 'reader', 'idProperty'),// id字段
                defaultData: config.get('store', 'defaultData'),//Grid数据的默认构造
                window: config.get('window'),//窗口的配置
                mode: config.get('mode'),// local 或者 remote
                addEditWay: config.get('grid', 'addEditWay'),
                recordType: model.getStore().recordType //对RecordType的引用
            });
            //声明处理函数
            var successHandler = {
                create: function (store, action, result, res, rs) {
                    //todo
                    console.log('创建成功');
                    if (config.get('grid', 'addEditWay', 'add') === 'window') {
                        view.closeWindow('add');
                    }
                },
                delete: function (store, action, result, res, rs) {
                    var nextIndex,
                        index = rs.lastIndex,
                        count = store.getCount();
                    if (count === 0) {
                        view.changeAllBtnStatu();
                        return;
                    }
                    if (index === 0) {
                        nextIndex = 0;
                    } else if (index === count) {
                        nextIndex = index - 1;
                    } else {
                        nextIndex = index;
                    }
                    view.selectRow(nextIndex);
                    view.changeAllBtnStatu();
                },
                update: function (store, action, result, res, rs) {
                    //todo
                    console.log('更新成功');
                    view.closeWindow('edit', rs.get(config.get('store', 'reader', 'idProperty')));
                    console.log('edit window close');
                }
            }, errorHandler = {
                create: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                delete: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                update: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                read: function (action, record, msg) {
                    console.log(action, record, msg);
                }
            }, failHandler = {
                create: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                delete: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                update: function (action, record, msg) {
                    console.log(action, record, msg);
                },
                read: function (action, record, msg) {
                    console.log(action, record, msg);
                }
            };
            model.on({
                'success': function (store, action, result, res, rs) {
                    //请求成功
                    successHandler[action](store, action, result, res, rs);
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
            var idOfTbar = config.getId('grid', 'tbar'),
                viewlisteners = {};
            viewlisteners[idOfTbar.add] = function () {
                //添加
                console.log('添加');
                if (config.get('grid', 'addEditWay', 'add') === 'rowEditor') {
                    view.addRecord();
                } else {
                    view.openAddWindow();
                }
            };
            viewlisteners[idOfTbar.refresh] = function () {
                //刷新
                console.log('刷新');
                model.getStore()[reloadMethod](that.data);
            };
            viewlisteners[idOfTbar.delete] = function (record) {
                //记录
                view.setBtnStatu('delete', false);
                model.getStore().remove(record);
            };
            viewlisteners[config.getEvent('view', 'ROW_DBL_CLICK')] = function (record) {
                //使用Window进行编辑
                if (config.get('grid', 'addEditWay', 'edit') === 'window') {
                    view.openEditWindow(record);
                }
                //mRowEditor 会自动启用
            };
            viewlisteners[config.getEvent('view', 'SAVE_RECORD')] = function (record, fieldValues) {
                model.saveRecord(record);
            };
            viewlisteners[config.getEvent('view', 'UPDATE_RECORD')] = function (record, fieldValues) {
                console.log('UPDATE_RECORD');
                model.updateRecord(record, fieldValues);
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
