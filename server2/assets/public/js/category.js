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
    require('crud/public/js/lib/RowEditor.js');
    require('crud/public/js/Grid.CRUD.App.js');
    require('crud/public/js/lib/Examples.js');
    
    function init(id, cls, title) {
        var gridPanel = new Ext.ux.CRUD({
            id: 'tab' + id,
            title: title,
            //配置可以关闭
            closable: true,
            //local数据 也可以使用api配置项配置remote数据
            api: {
                update: Portal.data.proxyUrl('crud:category:update'),
                create: Portal.data.proxyUrl('crud:category:create'),
                delete: Portal.data.proxyUrl('crud:category:delete'),
                read: Portal.data.proxyUrl('crud:category:read')
            },
            store: {
                idProperty: '_id'
            },
            search: {
                property: ['type']
            },
            /**
             * 选择编辑器, 如果不配置，默认使用rowEditor
             * editor: 'window' 表示编辑和添加的时候全部使用window来进行编辑
             * 或者可以像下面一样分开选择
             */
            mEditor: {
                add: 'window', //添加的时候使用rowEditor
                edit: 'window' //编辑的时候使用窗口
            },
            mButtons: ['add', 'delete', 'refresh'],
            mColumns: [{
                id: 'id',
                type: 'string',
                mEdit: false,
                dataIndex: '_id',
                editable: false
            }, {
                id: 'name',
                type: 'string',
                header: '分类名称',
                fieldLabel: '标题',
                sortable: true,
                allowBlank: false,
                width: 180,
                dataIndex: 'name'
            }, {
                id: 'post_date',
                header   : '更新日期',
                fieldLabel: '更新日期',
                mEdit: false,
                allowBlank: true,
                type     : 'date',
                width    : 85,
                sortable : true,
                //renderer : Ext.util.Format.dateRenderer('n/j h:ia Y'),
                dataIndex: 'post_date'
            }, {
                id: 'type',
                header: '任务类型',
                fieldLabel: '类型',
                type: 'enum',
                /*displayField: 'id', //store的时候需要定义这两个
                valueField: 'name'*/
                /*
                //可以使用本地的数据
                mLocalData: {
                    0: '生活Idea',
                    1: '工作记录',
                    2: '购物清单'
                },*/
                //也可以是连接地址
                mUrl: Portal.data.proxyUrl('crud:category:read'),
                displayField: 'name',
                valueField: '_id',
                hidden: true
            }]
        });
        return gridPanel;
    }
    exports.init = init;
});