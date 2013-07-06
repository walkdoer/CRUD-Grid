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
    require('crud/public/js/Grid.CRUD.App.js');
    function init(id, cls, title) {
        var gridPanel = new Ext.ux.CRUD({
            id: 'tab:' + id,
            title: title,
            closable: true,//配置可以关闭
            api: {
                update: Portal.data.proxyUrl('crud:subCate:update'),
                create: Portal.data.proxyUrl('crud:subCate:create'),
                delete: Portal.data.proxyUrl('crud:subCate:delete'),
                read: Portal.data.proxyUrl('crud:subCate:read')
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
                header: '子分类名称',
                fieldLabel: '标题',
                sortable: true,
                allowBlank: false,
                width: 180
            }, {
                id: 'post_date',
                header   : '更新日期',
                mEdit: false,
                allowBlank: true,
                type     : 'date',
                width    : 85,
                sortable : true
            }, {
                id: 'parentId',
                header: '父类任务类型',
                fieldLabel: '父类任务类型',
                type: 'enum',
                mUrl: Portal.data.proxyUrl('crud:category:read'),
                displayField: 'name',
                valueField: '_id'
            }]
        });
        return gridPanel;
    }
    exports.init = init;
});