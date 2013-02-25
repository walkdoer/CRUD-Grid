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
                fields: config.get('store','fields')
            });
            var view = new View();
            //声明处理函数
            var successHandler = {
                create: function (store,action, result, res, rs) {
                    //todo
                    console.log('创建成功');
                },
                delete: function (store,action, result, res, rs) {
                    var nextIndex,
                        index = rs.lastIndex,
                        count = store.getCount();
                    if (action === 'destroy') {
                        if (count === 0) {
                            view.changeBtnStatu();
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
                        view.changeBtnStatu();
                    } else {
                        view.changeBtnStatu();
                    }
                },
                update: function (store,action, result, res, rs) {
                    //todo
                    console.log('更新成功');
                }
            }, errorHandler = {
                create: function (result, res) {
                    console.log(result,res);
                },
                delete: function (result, res) {
                    console.log(result,res);
                },
                update: function (result, res) {
                    console.log(result,res);
                }
            }, failHandler = {
                create: function (action, record, msg) {
                    console.log(action, record,msg);
                },
                delete: function (action, record, msg) {
                    console.log(action, record,msg);
                },
                update: function (action, record, msg) {
                    console.log(action, record,msg);
                }
            };
            model.on({
                'success': function (store, action, result, res, rs) {
                    //请求成功
                    successHandler[action](store,action, result, res, rs);
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
            var idOfTbar = config.getId('grid','tbar'),
                viewlisteners = {};
            viewlisteners[idOfTbar.add] = function () {
                //todo 编写添加
                console.log('添加');
                view.addRecord();
            };
            viewlisteners[idOfTbar.refresh] = function () {
                //todo 编写刷新
                console.log('刷新');
                model.getStore()[reloadMethod](that.data || that.api);
            };
            viewlisteners[idOfTbar.delete] = function (record) {
                //删除记录
                model.getStore().remove(record);
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
