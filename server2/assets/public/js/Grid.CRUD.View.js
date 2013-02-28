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

    function needRowEditor(conf) {
        if (conf.edit === 'rowEditor' || conf.add === 'rowEditor') {
            return true;
        }
        return false;
    }
    function needClicksToEdit(conf) {
        if (conf.edit === 'window'){
            return true;
        }
        return false;
    }
    var View = Ext.extend(Ext.util.Observable, {
        constructor: function (conf) {
            var that = this,
                //事件
                eventConfig= conf.event,
                //窗口的编号
                windowNum = 0,
                //顶部工具栏的配置方式
                tbarConfig = conf.tbar;
            //将config保存到对像中
            this.config = conf;
            //绑定顶部工具栏按钮的处理函数
            for (var i = 0, len = tbarConfig.items.length; i < len; i++) {
                var button = tbarConfig.items[i];
                console.log(button, button.id);
                this.addEvents(button.id);
                button.handler = function (btn, event) {
                    var record = that.rsm.getSelected();
                    that.fireEvent(btn.id,[btn, event, record]);
                };
            }
            /**
             * 创建window
             * @param  {Object} config 配置
             * @return {Ext.Window}        窗口
             */
            function createWindow(conf) {
                var win, formPanel, fieldType = that.config.fieldType;
                //创建formpanel的字段
                var fieldConfig = conf.fields, fields = [], field;
                for (var i = 0; i < fieldConfig.length; i++) {
                    field = fieldConfig[i];
                    if (field.editable) {
                        //可编辑字段根据数据类型创建field
                        fields.push(new fieldType[field.type](field));
                    }
                }
                conf.id = conf.id + windowNum++;
                console.log(conf.id);
                if (!conf.title) {
                    conf.title = "窗口";
                }
                //创建FormPanel
                conf.buttons = [{
                    text: '保存',
                    disable: true,
                    handler: function () {
                        //todo
                    }
                }, {
                    text: '取消',
                    handler: function () {
                        win.close();
                    }
                }];
                formPanel = new Ext.form.FormPanel({
                    baseCls: 'x-plain',
                    labelWidth: 45,
                    labelSeparator: ':',
                    items: fields
                });
                conf.items = formPanel;
                conf.listeners = {
                    destroy: function () {
                        console.log('window ' + conf.id + 'destroy');
                    }
                };
                //创建窗口
                win = new Ext.Window(conf);
                return win;
            }
            this.init = function (conf) {
                var store = conf.store,
                    idOfTbar = tbarConfig.id,
                    rsm, tbar, editor, mainPanel, mainPanelConfig;

                /**
                 * 改变所有按钮的状态
                 */
                this.changeAllBtnStatu = function () {
                    var record = this.rsm.getSelected();
                    var delBtn = Ext.getCmp(idOfTbar.delete);
                    if (!record) {
                        delBtn.disable();
                    } else {
                        delBtn.enable();
                    }
                };
                /**
                 * 设置按钮状态
                 * @param {String} btn    按钮的ID
                 * @param {Boolean} status [description]
                 */
                this.setBtnStatu = function (btn, status) {
                    var ed = status ? 'enable' : 'disable';
                    Ext.getCmp(idOfTbar[btn])[ed]();
                };
                //行编辑器
                if (needRowEditor(that.config.addEditWay)){
                    editor = new Ext.ux.grid.RowEditor({
                        saveText: '保存',
                        cancelText: '取消',
                        clicksToEdit: 2,
                        noClicksToEdit: needClicksToEdit(that.config.addEditWay),
                        errorSummary: false,
                        listeners: {
                            canceledit: function (rowEditor, press) {
                                // 取消时候需要的操作
                                if (!rowEditor.record.get(that.config.idProperty)) {
                                    store.removeAt(0);
                                }
                            }
                        }
                    });
                }
                this.addRecord = function () {
                    //这里使用clone的原因是 或得到的DefaultData会被改变，
                    //下一次add的时候获得的就是上一次改变过的数据
                    var record = new store.recordType(Ext.ux.clone(this.config.defaultData));
                    editor.stopEditing();
                    store.insert(0, record);
                    editor.startEditing(0);
                };
                /**
                 * 对删除错误之后的界面进行错误修正
                 */
                this.exceptionHandler = function(proxy, type, action, options, res, arg) {
                    var id;
                    var that = this;
                    if (action === 'destroy') {
                        if (arg.lastIndex === store.getTotalCount() - 1) {
                            id = store.getCount();
                        } else {
                            id = arg.lastIndex;
                        }
                        setTimeout(function () {
                            that.rsm.selectRow(id);
                            Ext.getCmp(idOfTbar.delete).enable();
                        }, 400);
                    }
                };
                this.selectRow = function (rowIndex) {
                    this.rsm.selectRow(rowIndex);
                };

                /**
                 * 打开编辑窗口
                 * @param  {Ext.data.Record} record 记录
                 */
                this.openEditWindow = function (record) {
                    //窗口编辑器
                    var editWindow = createWindow({
                        id: that.config.window.add.id,
                        title: '编辑记录',
                        width: 210,
                        height: 300,
                        draggable: true,
                        plain: true,
                        bodyStyle: 'padding:5px',
                        closeAction: 'close',
                        fields: that.config.window.edit.fields
                    });
                    var formPanel = editWindow.items.get(0);
                    formPanel.getForm().loadRecord(record);
                    editWindow.show();
                };
                /**
                 * 打开编辑窗口
                 * @param  {Ext.data.Record} record 记录
                 */
                this.openAddWindow = function () {
                    //窗口编辑器
                    var addWindow = createWindow({
                        id: that.config.window.edit.id,
                        title: '添加记录',
                        width: 210,
                        height: 300,
                        plain: true,
                        bodyStyle: 'padding:5px',
                        closeAction: 'close',
                        fields: that.config.window.add.fields
                    });
                    addWindow.show();
                };
                //生成顶部工具栏
                tbar = new Ext.Toolbar(tbarConfig);
                this.rsm = new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        rowSelect: function (/*sm*/) {
                            that.changeAllBtnStatu();
                        },
                        rowdeselect: function (/*sm*/) {
                            that.changeAllBtnStatu();
                        }
                    }
                });

                mainPanelConfig = {
                    id: conf.id + ':grid',
                    store: store,
                    loadMask: true,
                    border: false,
                    closable: true,
                    autoScroll: true,
                    enableHdMenu: false,
                    sm: this.rsm,
                    columns: conf.columns,
                    tbar: tbar,
                    listeners: {
                        viewready: function () {
                            if (that.config.mode === 'remote') {
                                store.load();
                            }
                        },
                        destroy: function () {
                            console.log('Grid [Ext.grid.GridPanel]: Destroy');
                            //关闭窗口的时候删除绑定的处理函数，下一次重新绑定，避免闭包问题，即使用上一个窗口生成的变量，rsm
                            //store.removeListener('write', afterDelete);
                            //store.removeListener('exception', exceptionHandler);
                        },
                        rowdblclick: function (grid, rowIndex) {
                            console.log('Gird [Ext.grid.GridPanel]: Row double click');
                            var record = that.rsm.getSelected();
                            that.fireEvent(eventConfig.ROW_DBL_CLICK, record);
                        }
                    }
                };
                if (needRowEditor(that.config.addEditWay)){
                    mainPanelConfig.plugins = [editor];
                }
                mainPanel = new Ext.grid.GridPanel(mainPanelConfig);
                return mainPanel;
            };
        }
    });
    return View;
});