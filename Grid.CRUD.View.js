<<<<<<< HEAD
/**
 * Ext.ux.grid.CRUD组件 View层 -- Grid.CRUD.View.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function (require, exports) {
    /**
     * View层主要做用户界面的响应和更新用户界面
     * 为了组件可以放置于不同的容器中，组件选择继承于Ext.Panel
     * 界面组成
     *  ---工具栏 [Ext.Toolbar]    包括 搜索栏 和 CRUD按钮
     *  ---表格   [Ext.grid.GridPanel]   展现数据的界面
     *  ---窗口
     *      |---添加窗口      [Ext.Window]
     *      |---编辑窗口      [Ext.Window]
     *      |---删除提示窗口  [Ext.Window]
     *      |---消息提示窗口  [Ext.Window]
     *
     * 组件内部的组件通过接口的形式来通信，而组件与组件外部则通过组件通信
     */
    'use strict';

    var config = require('crud/Grid.CRUD.Config.js');
    
    var View = Ext.extend(Ext.util.Observable, {
        constructor: function () {
            var that = this,
                //获取顶部工具栏的配置方式
                tbarConfig = config.get('grid','tbar');
            //绑定顶部工具栏按钮的处理函数
            for (var i = 0, len = tbarConfig.items.length; i < len; i++) {
                var button = tbarConfig.items[i];
                console.log(button, button.id);
                this.addEvents(button.id);
                button.handler = function (btn, event) {
                    that.fireEvent(btn.id,[btn, event]);
                };
            }
            this.init = function (config) {
                var store = config.store,
                    btnConf = config.buttons,
                    rsm, mainPanel, tbar;

                function changeBtnStatu(record) {
                    var delBtn = Ext.getCmp(btnConf.delete.id);
                    if (!record) {
                        delBtn.disable();
                    } else {
                        delBtn.enable();
                    }
                }
                /**
                 * 处理删除之后的操作
                 */
                function afterDelete(store, action, result, res, rs) {
                    var nextIndex,
                        index = rs.lastIndex,
                        count = store.getCount();
                    if (action === 'destroy') {
                        if (count === 0) {
                            Ext.getCmp(btnConf.delete.id).disable();
                            return;
                        }
                        if (index === 0) {
                            nextIndex = 0;
                        } else if (index === count) {
                            nextIndex = index - 1;
                        } else {
                            nextIndex = index;
                        }
                        rsm.selectRow(nextIndex);
                        Ext.getCmp(btnConf.delete.id).enable();
                    } else {
                        changeBtnStatu(rsm.getSelected());
                    }
                }

                /**
                 * 对删除错误之后的界面进行错误修正
                 */
                function exceptionHandler(proxy, type, action, options, res, arg) {
                    var id;
                    if (action === 'destroy') {
                        if (arg.lastIndex === store.getTotalCount() - 1) {
                            id = store.getCount();
                        } else {
                            id = arg.lastIndex;
                        }
                        setTimeout(function () {
                            rsm.selectRow(id);
                            Ext.getCmp(btnConf.delete.id).enable();
                        }, 400);
                    }
                }

                //生成顶部工具栏
                tbar = new Ext.Toolbar(tbarConfig);
                rsm = new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        rowSelect: function (sm) {
                            console.log('selectRow');
                        },
                        rowdeselect: function (sm) {
                            console.log('deSelectRow');
                        }
                    }
                });
                mainPanel = new Ext.grid.GridPanel({
                    id: config.id,
                    store: store,
                    loadMask: true,
                    border: false,
                    closable: true,
                    autoScroll: true,
                    enableHdMenu: false,
                    sm: rsm,
                    columns: config.columns,
                    tbar: tbar,
                    listeners: {
                        viewready: function () {
                            //store.load();
                        },
                        destroy: function () {
                            console.log('Grid [Ext.grid.GridPanel] destroy');
                            //关闭窗口的时候删除绑定的处理函数，下一次重新绑定，避免闭包问题，即使用上一个窗口生成的变量，rsm
                            store.removeListener('write', afterDelete);
                            store.removeListener('exception', exceptionHandler);
                        },
                        rowdblclick: function (grid, rowIndex) {
                           console.log('row double click');
                        }
                    }
                });
                return mainPanel;
            };
        }
    });
    return View;
=======
/**
 * Ext.ux.grid.CRUD组件 View层 -- Grid.CRUD.View.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function (require, exports) {
    /**
     * View层主要做用户界面的响应和更新用户界面
     * 为了组件可以放置于不同的容器中，组件选择继承于Ext.Panel
     * 界面组成
     *  ---工具栏 [Ext.Toolbar]    包括 搜索栏 和 CRUD按钮
     *  ---表格   [Ext.grid.GridPanel]   展现数据的界面
     *  ---窗口
     *      |---添加窗口      [Ext.Window]
     *      |---编辑窗口      [Ext.Window]
     *      |---删除提示窗口  [Ext.Window]
     *      |---消息提示窗口  [Ext.Window]
     *
     * 组件内部的组件通过接口的形式来通信，而组件与组件外部则通过组件通信
     */
    'use strict';

    var config = require('crud/Grid.CRUD.Config.js');
    
    var View = Ext.extend(Ext.util.Observable, {
        constructor: function () {
            var that = this,
                //事件
                event= config.get('event', 'view'),
                //顶部工具栏的配置方式
                tbarConfig = config.get('grid','tbar');
            //绑定顶部工具栏按钮的处理函数
            for (var i = 0, len = tbarConfig.items.length; i < len; i++) {
                var button = tbarConfig.items[i];
                console.log(button, button.id);
                this.addEvents(button.id);
                button.handler = function (btn, event) {
                    that.fireEvent(btn.id,[btn, event]);
                };
            }
            
            this.init = function (conf) {
                var store = conf.store,
                    btnConf = conf.buttons,
                    rsm, mainPanel, tbar, editor;

                function changeBtnStatu(record) {
                    var delBtn = Ext.getCmp(btnConf.delete.id);
                    if (!record) {
                        delBtn.disable();
                    } else {
                        delBtn.enable();
                    }
                }
                editor = new Ext.ux.grid.RowEditor({
                    saveText: '保存',
                    cancelText: '取消',
                    clicksToEdit: 2,
                    noClicksToEdit: conf.noClicksToEdit,
                    errorSummary: false,
                    listeners: {
                        canceledit: function (rowEditor, press) {
                            // 取消时候需要的操作
                            console.log(rowEditor.record.data);
                            if (rowEditor.record.data.id === '') {
                                store.removeAt(0);
                            }
                        }
                    }
                });
                this.addRecord = function () {
                    //这里使用clone的原因是 或得到的DefaultData会被改变，
                    //下一次add的时候获得的就是上一次改变过的数据
                    var record = new store.recordType(Ext.ux.clone(config.get('store','defaultData')));
                    editor.stopEditing();
                    store.insert(0, record);
                    editor.startEditing(0);
                };
                /**
                 * 处理删除之后的操作
                 */
                function afterDelete(store, action, result, res, rs) {
                    var nextIndex,
                        index = rs.lastIndex,
                        count = store.getCount();
                    if (action === 'destroy') {
                        if (count === 0) {
                            Ext.getCmp(btnConf.delete.id).disable();
                            return;
                        }
                        if (index === 0) {
                            nextIndex = 0;
                        } else if (index === count) {
                            nextIndex = index - 1;
                        } else {
                            nextIndex = index;
                        }
                        rsm.selectRow(nextIndex);
                        Ext.getCmp(btnConf.delete.id).enable();
                    } else {
                        changeBtnStatu(rsm.getSelected());
                    }
                }

                /**
                 * 对删除错误之后的界面进行错误修正
                 */
                function exceptionHandler(proxy, type, action, options, res, arg) {
                    var id;
                    if (action === 'destroy') {
                        if (arg.lastIndex === store.getTotalCount() - 1) {
                            id = store.getCount();
                        } else {
                            id = arg.lastIndex;
                        }
                        setTimeout(function () {
                            rsm.selectRow(id);
                            Ext.getCmp(btnConf.delete.id).enable();
                        }, 400);
                    }
                }

                //生成顶部工具栏
                tbar = new Ext.Toolbar(tbarConfig);
                rsm = new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        rowSelect: function (sm) {
                            console.log('Gird [Ext.grid.GridPanel]: SelectRow');
                        },
                        rowdeselect: function (sm) {
                            console.log('Gird [Ext.grid.GridPanel]: DeSelectRow');
                        }
                    }
                });
                mainPanel = new Ext.grid.GridPanel({
                    id: conf.id,
                    store: store,
                    loadMask: true,
                    border: false,
                    closable: true,
                    autoScroll: true,
                    enableHdMenu: false,
                    sm: rsm,
                    plugins: [editor],
                    columns: conf.columns,
                    tbar: tbar,
                    listeners: {
                        viewready: function () {
                            //store.load();
                        },
                        destroy: function () {
                            console.log('Grid [Ext.grid.GridPanel]: Destroy');
                            //关闭窗口的时候删除绑定的处理函数，下一次重新绑定，避免闭包问题，即使用上一个窗口生成的变量，rsm
                            store.removeListener('write', afterDelete);
                            store.removeListener('exception', exceptionHandler);
                        },
                        rowdblclick: function (grid, rowIndex) {
                            console.log('Gird [Ext.grid.GridPanel]: Row double click');
                            that.fireEvent(event.ROW_DBL_CLICK);
                        }
                    }
                });
                return mainPanel;
            };
        }
    });
    return View;
>>>>>>> 结合rowEditor的编辑器
});