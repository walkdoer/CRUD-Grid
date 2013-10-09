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
                update: Portal.data.proxyUrl('crud:category:update'),
                create: Portal.data.proxyUrl('crud:category:create'),
                delete: Portal.data.proxyUrl('crud:category:delete'),
                read: Portal.data.proxyUrl('crud:category:read')
            },
            store: {idProperty: '_id'},
            search: {property: ['name', 'type']},
            mButtons: ['add', 'delete', 'refresh'],
            mColumns: [{
                id: 'thi is aid',
                type: 'string',
                //mEdit: false,
                dataIndex: '_id'
                //editable: false
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
                width    : '150, 80',
                sortable : true,
                dataIndex: 'post_date'
            }, {
                id: 'type',
                header: '等级',
                type: 'enum',
                mLocalData: [[1, '低'], [2, '中'], [3, '高']],
                mEdit: false
            }]
        });
        return gridPanel;
    }
    exports.init = init;
});