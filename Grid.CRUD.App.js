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
        view = require('crud/Grid.CRUD.View.js');

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
            //初始化配置
            config.init(this.initialConfig);
            //初始化数据库
            var model = new Model({
                storeId: 'mydata',
                data: this.data || this.api,
                fields: config.get('store','fields')
            });
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
            
            //初始化界面
            this.add(view.init({
                id: this.id,
                store: model.getStore(),
                columns: this.columns
            }));
        }
    });
});