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

    //监听
    var LISTENERS_TYPE = {
        'string' : 'keyup',
        'bigString': 'keyup',
        'boolean' : 'check'
    };
    
    function serializeForm(form) {
        var fElements = form.elements || (document.forms[form] || Ext.getDom(form)).elements, 
            hasSubmit = false, 
            encoder = encodeURIComponent, 
            name, 
            data = '', 
            type, 
            hasValue;

        Ext.each(fElements, function (element) {
            name = element.name;
            type = element.type;
    
            if (!element.disabled && name) {
                if (/select-(one|multiple)/i.test(type)) {
                    Ext.each(element.options, function (opt) {
                        if (opt.selected) {
                            hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                            data += String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                        }
                    });
                } else if (!(/file|undefined|reset|button/i.test(type))) {
                    if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                        data += encoder(name) + '=' + encoder(element.value) + '&';
                        hasSubmit = /submit/i.test(type);
                    }
                }
            }
        });
        return data.substr(0, data.length - 1);
    }

    function needRowEditor(conf) {
        if (conf.edit === 'rowEditor' || conf.add === 'rowEditor') {
            return true;
        }
        return false;
    }
    function needClicksToEdit(conf) {
        if (conf.edit === 'window') {
            return true;
        }
        return false;
    }
    var View = Ext.extend(Ext.util.Observable, {
        constructor: function (conf) {
            var that = this,
                //事件
                eventConfig = conf.event,
                //顶部工具栏的配置方式
                tbarConfig = conf.tbar;
            //将config保存到对像中
            this.config = conf;
            //绑定顶部工具栏按钮的处理函数
            for (var i = 0, len = tbarConfig.items.length; i < len; i++) {
                var button = tbarConfig.items[i];
                this.addEvents(button.id);
                if (!!button.handler) {continue;}
                button.handler = function (btn, event) {
                    var record = that.rsm.getSelected();
                    that.fireEvent(btn.id, [btn, event, record]);
                };
            }
            /**
             * 创建window
             * @param  {Object} config 配置
             * @return {Ext.Window}        窗口
             */
            function createWindow(conf, record) {
                var win, formPanel, fieldType = that.config.fieldType,
                    saveBtnId = conf.id + ':btn:save',
                    cancelBtnId = conf.id + ':btn:cancel',
                    beginFieldString;
                //创建formpanel的字段
                var fieldConfig = conf.fields, fields = [], field;
                for (var i = 0; i < fieldConfig.length; i++) {
                    field = fieldConfig[i];
                    if (field.editable) {
                        field.listeners = {};
                        field.listeners[LISTENERS_TYPE[field.type]] = function () {
                            console.log("field change");
                            Ext.getCmp(saveBtnId).enable();
                        };
                        //可编辑字段根据数据类型创建field
                        fields.push(new fieldType[field.type](field));
                    }
                }
                if (!conf.title) {
                    conf.title = "窗口";
                }
                //创建FormPanel
                conf.buttons = [{
                    id: saveBtnId,
                    text: '保存',
                    disabled: true,
                    handler: function () {
                        var basicForm = formPanel.getForm(),
                            saveRecord,
                            fieldValues = basicForm.getFieldValues();
                        //添加框是不带记录
                        if (!record) {
                            saveRecord = new that.config.recordType(Ext.ux.clone(that.config.defaultData));
                            for (var key in fieldValues) {
                                if (fieldValues.hasOwnProperty(key)) {
                                    saveRecord.set(key, fieldValues[key]);
                                }
                            }
                        } else {
                            saveRecord = record;
                        }
                        that.fireEvent(conf.mEvent.ok, saveRecord, fieldValues);
                    }
                }, {
                    id: cancelBtnId,
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
                conf.modal = !conf.mMultiWin;
                conf.listeners = {
                    destroy: function () {
                        console.log('window ' + conf.id + 'destroy');
                    },
                    beforeclose: function () {
                        if (win.fromSaveBtn) { return; }
                        var endFieldString = serializeForm(formPanel.getForm().getEl());
                        if (endFieldString !== beginFieldString) {
                            //如果还没有确认过
                            if (!win.alreadyConfirm) {
                                Ext.Msg.confirm('请确认', '真的要退出吗？',
                                function (button, text) {
                                    if (button === "yes") {
                                        win.alreadyConfirm = true;
                                        win.close();
                                    }
                                });
                                return false;
                            }
                            //已经确认，直接关闭
                            return true;
                        }
                    }
                };
                //创建窗口
                win = new Ext.Window(conf);
                win.show();
                //如果有记录就将记录加载进窗口
                if (record) {
                    formPanel.getForm().loadRecord(record);
                    beginFieldString = serializeForm(formPanel.getForm().getEl());
                }
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
                    for (var btnName in idOfTbar) {
                        console.log(btnName + ':' + idOfTbar[btnName]);
                    }
                };

                this.getCurrentRecord = function () {
                    return this.rsm.getSelected();
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
                if (needRowEditor(that.config.addEditWay)) {
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
                this.exceptionHandler = function (proxy, type, action, options, res, arg) {
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
                        id: that.config.window.edit.id + ':' + record.id,
                        title: '编辑记录',
                        width: 210,
                        height: 300,
                        draggable: true,
                        plain: true,
                        bodyStyle: 'padding:5px',
                        closeAction: 'close',
                        fields: that.config.window.edit.fields,
                        mMultiWin: true,//多窗口 ,自定义的字段全部带上m
                        mEvent: {
                            ok: eventConfig.UPDATE_RECORD
                        }
                    }, record);
                };
                /**
                 * 打开编辑窗口
                 * @param  {Ext.data.Record} record 记录
                 */
                this.openAddWindow = function () {
                    //窗口编辑器
                    var addWindow = createWindow({
                        id: that.config.window.add.id,
                        title: '添加记录',
                        width: 210,
                        height: 300,
                        plain: true,
                        bodyStyle: 'padding:5px',
                        closeAction: 'close',
                        fields: that.config.window.add.fields,
                        mEvent: {
                            ok: eventConfig.SAVE_RECORD
                        }
                    });
                };

                this.closeWindow = function (type, recordId) {
                    var id = that.config.window[type].id,
                        win;

                    if (!!recordId) {
                        id = that.config.window[type].id + ':' + recordId;
                    }
                    win = Ext.getCmp(id);
                    if (!win) { return; }
                    win.fromSaveBtn = true;//强制关闭
                    win.close();
                };

                this.isWindowOpen = function (type, recordId) {
                    var id = that.config.window[type].id,
                        win;

                    if (!!recordId) {
                        id = that.config.window[type].id + ':' + recordId;
                    }
                    win = Ext.getCmp(id);
                    if (!win) { return false; }
                    return true;
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
                        },
                        rowdblclick: function (grid, rowIndex) {
                            console.log('Gird [Ext.grid.GridPanel]: Row double click');
                            var record = that.rsm.getSelected();
                            that.fireEvent(eventConfig.ROW_DBL_CLICK, record);
                        }
                    }
                };
                if (needRowEditor(that.config.addEditWay)) {
                    mainPanelConfig.plugins = [editor];
                }
                mainPanel = new Ext.grid.GridPanel(mainPanelConfig);
                return mainPanel;
            };
        },
        error: function (msg) {
            Ext.Msg.alert('错误', msg);
        }
    });
    return View;
});