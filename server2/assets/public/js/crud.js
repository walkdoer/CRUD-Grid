/**
 * 简单配置版
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
            //配置可以关闭
            closable: true,
            //local数据 也可以使用api配置项配置remote数据
            api: {
                update: Portal.data.proxyUrl('crud:todo:update'),
                create: Portal.data.proxyUrl('crud:todo:create'),
                delete: Portal.data.proxyUrl('crud:todo:delete'),
                read: Portal.data.proxyUrl('crud:todo:read')
            },
            store: {
                idProperty: '_id'
            },
            mEditor: {
                add: 'window', //添加的时候使用rowEditor
                edit: 'window' //编辑的时候使用窗口
            },
            search: {
                property: ['title', 'finished', 'type']
            },
            mButtons: ['refresh', 'add', 'delete',  {
                id: 'finished',
                disabled: true,
                iconCls: 'icon-edit',
                mNegaIcon: Portal.util.icon('page_white_delete.png'),
                text: '完成',
                mNegaText: '取消完成',
                handler: function (app) {
                    app.updateRecord({finished: true});
                },
                mNegaHandler: function (app) {
                    app.updateRecord({finished: false});
                }
            }],
            mColumns: [{
                id: 'id',
                type: 'string',
                mEdit: false,
                mWidth: 180,
                dataIndex: '_id'
            }, {
                id: 'title',
                type: 'string',
                fieldLabel: '标题',
                sortable: true,
                mEdit: true,
                allowBlank: false,
                mWidth: '180, 220',
                dataIndex: 'title'
            }, {
                id: 'finished',
                type: 'boolean',
                header: '完成',
                mPosiText: '完成',
                mNegaText: '未完成 red',
                sortable: true,
                mEdit: false,
                mWidth: 85,
                dataIndex: 'finished'
            }, {
                id: 'post_date',
                header   : 'DeadLine',
                allowBlank: true,
                type     : 'datetime',
                renderer : Ext.util.Format.dateRenderer('n/j h:ia'),
                mWidth    : [260],
                sortable : true,
                dataIndex: 'post_date'
            }, {
                id: 'type',
                header: '任务类型',
                type: 'enum',
                multi: true,
                mUrl: Portal.data.proxyUrl('crud:category:read'),
                displayField: 'name',
                valueField: '_id',
                dataIndex: 'type_id'
            }],
            listeners: {
                crud_view_ready: function () {
                    console.log('界面准备好了');
                },
                crud_delete_success: function () {
                    console.log('删除成功');
                },
                crud_delete_error: function () {
                    console.log('删除失败');
                },
                crud_load_success: function () {
                    console.log('加载成功');
                }
            }
        });
        return gridPanel;
    }
    exports.init = init;
});