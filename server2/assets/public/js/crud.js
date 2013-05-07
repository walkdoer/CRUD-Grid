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
    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    function change(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '</span>';
        }
        return val;
    }

    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    function pctChange(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '%</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    }
    function init(id, cls, title) {
        var gridPanel = new Ext.ux.CRUD({
            id: 'tab' + id,
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
                idProperty: 'id'
            },
            /**
             * 选择编辑器, 如果不配置，默认使用rowEditor
             * editor: 'window' 表示编辑和添加的时候全部使用window来进行编辑
             * 或者可以像下面一样分开选择
             */
            mEditor: {
                add: 'rowEditor', //添加的时候使用rowEditor
                edit: 'rowEditor' //编辑的时候使用窗口
            },
            search: {
                property: ['title']
            },
            mButtons: ['add', 'delete', 'refresh', {
                id: 'finishe',
                disabled: true,
                whenEnable: function (record) {
                    //演示该如何改变按钮状态
                    if (record && !record.get('finished')) {
                        return true;
                    } else {
                        return false;
                    }
                },
                text: '完成',
                iconCls: 'icon-edit',
                handler: function (app) {
                    //改变记录的状态
                    app.updateRecord({
                        finished: true
                    });
                }
            }],
            mColumns: [{
                id: 'id',
                type: 'string',
                dataIndex: '_id',
                editable: false
            }, {
                id: 'title',
                type: 'string',
                //editable 字段可编辑时可以不配置editable
                //因为默认就是可编辑的
                //editable: true, 
                header: '标题',
                fieldLabel: '标题',
                sortable: true,
                allowBlank: false,
                width: 180,
                dataIndex: 'title'
            }, {
                id: 'finished',
                type: 'boolean',
                fieldLabel: '完成',
                header: '完成',
                sortable: true,
                width: 60,
                dataIndex: 'finished'
            }, {
                id: 'post_date',
                header   : '更新日期',
                fieldLabel: '更新日期',
                editable: false,
                allowBlank: true,
                type     : 'string',
                // dateFormat: 'n/j h:ia',
                width    : 85,
                sortable : true,
                renderer : Ext.util.Format.dateRenderer('n/j h:ia Y'),
                dataIndex: 'post_date'
            }]
        });
        return gridPanel;
    }
    exports.init = init;
});
    /*
     var myData = [
        ['3m Co',                               71.72, 0.02,  0.03,  '9/1 12:00am'],
        ['Alcoa Inc',                           29.01, 0.42,  1.47,  '9/1 12:00am'],
        ['Altria Group Inc',                    83.81, 0.28,  0.34,  '9/1 12:00am'],
        ['American Express Company',            52.55, 0.01,  0.02,  '9/1 12:00am'],
        ['American International Group, Inc.',  64.13, 0.31,  0.49,  '9/1 12:00am'],
        ['AT&T Inc.',                           31.61, -0.48, -1.54, '9/1 12:00am'],
        ['Boeing Co.',                          75.43, 0.53,  0.71,  '9/1 12:00am'],
        ['Caterpillar Inc.',                    67.27, 0.92,  1.39,  '9/1 12:00am'],
        ['Citigroup, Inc.',                     49.37, 0.02,  0.04,  '9/1 12:00am'],
        ['E.I. du Pont de Nemours and Company', 40.48, 0.51,  1.28,  '9/1 12:00am'],
        ['Exxon Mobil Corp',                    68.1,  -0.43, -0.64, '9/1 12:00am'],
        ['General Electric Company',            34.14, -0.08, -0.23, '9/1 12:00am'],
        ['General Motors Corporation',          30.27, 1.09,  3.74,  '9/1 12:00am'],
        ['Hewlett-Packard Co.',                 36.53, -0.03, -0.08, '9/1 12:00am'],
        ['Honeywell Intl Inc',                  38.77, 0.05,  0.13,  '9/1 12:00am'],
        ['Intel Corporation',                   19.88, 0.31,  1.58,  '9/1 12:00am'],
        ['International Business Machines',     81.41, 0.44,  0.54,  '9/1 12:00am'],
        ['Johnson & Johnson',                   64.72, 0.06,  0.09,  '9/1 12:00am'],
        ['JP Morgan & Chase & Co',              45.73, 0.07,  0.15,  '9/1 12:00am'],
        ['McDonald\'s Corporation',             36.76, 0.86,  2.40,  '9/1 12:00am'],
        ['Merck & Co., Inc.',                   40.96, 0.41,  1.01,  '9/1 12:00am'],
        ['Microsoft Corporation',               25.84, 0.14,  0.54,  '9/1 12:00am'],
        ['Pfizer Inc',                          27.96, 0.4,   1.45,  '9/1 12:00am'],
        ['The Coca-Cola Company',               45.07, 0.26,  0.58,  '9/1 12:00am'],
        ['The Home Depot, Inc.',                34.64, 0.35,  1.02,  '9/1 12:00am'],
        ['The Procter & Gamble Company',        61.91, 0.01,  0.02,  '9/1 12:00am'],
        ['United Technologies Corporation',     63.26, 0.55,  0.88,  '9/1 12:00am'],
        ['Verizon Communications',              35.57, 0.39,  1.11,  '9/1 12:00am'],
        ['Wal-Mart Stores, Inc.',               45.45, 0.73,  1.63,  '9/1 12:00am']
    ];*/
            //grid的列
            /*columns: [
                {
                    id       : 'company',
                    type: 'string',
                    header   : 'Company',
                    width    : 160,
                    sortable : true,
                    dataIndex: 'company'
                },
                {
                    header   : 'Price',
                    type     : 'float',
                    width    : 75,
                    sortable : true,
                    renderer : 'usMoney',
                    dataIndex: 'price'
                },
                {
                    header   : 'Change',
                    type     : 'float',
                    width    : 75,
                    sortable : true,
                    renderer : change,
                    dataIndex: 'change'
                },
                {
                    header   : '% Change',
                    type     : 'float',
                    width    : 75,
                    sortable : true,
                    renderer : pctChange,
                    dataIndex: 'pctChange'
                },
                {
                    header   : 'Last Updated',
                    type     : 'date',
                    dateFormat: 'n/j h:ia',
                    width    : 85,
                    sortable : true,
                    renderer : Ext.util.Format.dateRenderer('n/j h:ia'),
                    dataIndex: 'lastChange'
                },
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [{
                        icon   : '../shared/icons/fam/delete.gif',  // Use a URL in the icon config
                        tooltip: 'Sell stock',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = store.getAt(rowIndex);
                            alert("Sell " + rec.get('company'));
                        }
                    }, {
                        getClass: function(v, meta, rec) {          // Or return a class from a function
                            if (rec.get('change') < 0) {
                                this.items[1].tooltip = 'Do not buy!';
                                return 'alert-col';
                            } else {
                                this.items[1].tooltip = 'Buy stock';
                                return 'buy-col';
                            }
                        },
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = store.getAt(rowIndex);
                            alert("Buy " + rec.get('company'));
                        }
                    }]
                }
            ]*/