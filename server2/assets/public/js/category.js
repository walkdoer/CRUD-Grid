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
            closable: true,//配置可以关闭
            api: {
                update: Portal.data.proxyUrl('crud:category:update'),
                create: Portal.data.proxyUrl('crud:category:create'),
                delete: Portal.data.proxyUrl('crud:category:delete'),
                read: Portal.data.proxyUrl('crud:category:read')
            },
            store: {idProperty: '_id'},
            search: {property: ['name']},
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
                mEdit: false,
                allowBlank: true,
                type     : 'date',
                width    : 85,
                sortable : true,
                dataIndex: 'post_date'
            }, {
                id: 'type',
                header: '任务类型',
                fieldLabel: '类型',
                type: 'enum',
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