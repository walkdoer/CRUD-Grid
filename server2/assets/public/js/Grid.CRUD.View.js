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

    var _ = require('crud/public/js/Grid.CRUD.Common.js');
    //监听
    var LISTENERS_TYPE = {
            'string'   : 'keyup',
            'bigString': 'keyup',
            'int'      : 'keyup',
            'float'    : 'keyup',
            'time'     : 'select',
            'date'     : 'change',
            'enum'     : 'change',      
            'boolean'  : 'check'
        },
        FIELD_TYPE       = _.FIELD_TYPE,
        FALSE            = _.FALSE,
        TRUE             = _.TRUE,
        CRUD_FIELD_ALL   = _.CRUD_FIELD_ALL,
        BTN_CHECK_EXCEPT = ['sysadd', 'sysrefresh'];
    
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
    
            if (name) {
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
        if (!conf) {
            return false;
        }
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

    function defaultNeedEnable(record) {
        if (record) {
            return true;
        } else {
            return false;
        }
    }
    var View = Ext.extend(Ext.util.Observable, {
        constructor: function (conf) {
            var that = this,
                editWindowsIDs = {},
                //事件
                eventConfig = conf.event,
                //最后一个编辑窗口的位置
                lastEditWinPos = null,
                //顶部工具栏的配置方式
                buttonsBarConfig = conf.buttonsBarConfig;
            //将config保存到对像中
            this.config = conf;
            //加载资源的loadMask
            this.loadResMask = null;
            var getDataMethod = conf.singleSelect ? 'getSelected' : 'getSelections';

            function getEditWindow(recordId) {
                if (!_.isEmpty(editWindowsIDs[recordId])) {
                    console.info('window ' + editWindowsIDs[recordId] +
                        ' found for record[' + recordId + ']');
                    return Ext.getCmp(editWindowsIDs[recordId]);
                }
                console.info('window not found for record[' + recordId + ']');
                return null;
            }

            function removeEditWindow(recordId) {
                var noWinExist = true;//所有窗口已经关闭
                delete editWindowsIDs[recordId];
                for (var win in editWindowsIDs) {
                    if (editWindowsIDs.hasOwnProperty(win)) {
                        noWinExist = false;
                    }
                }
                if (noWinExist) {
                    console.log('恢复位置');
                    lastEditWinPos = null;
                }
            }
            function setEditWindow(recordId, winId) {
                editWindowsIDs[recordId] = winId;
            }

            //添加事件
            for (var eventName in eventConfig) {
                this.addEvents(eventName);
            }
            //绑定顶部工具栏按钮的处理函数
            for (var i = 0, len = !buttonsBarConfig ? 0 : buttonsBarConfig.items.length; i < len; i++) {
                var button = buttonsBarConfig.items[i];
                this.addEvents(button.id);
                //用户自定义的按钮
                if (button.belongToUser) {
                    console.info('初始化用户自定义按钮' + button.id);
                    button.handler = (function (button) {
                        var userHandler = button.handler;//用户的处理函数
                        return function (btn, event) {
                            var records, data;
                            records = that.rsm[getDataMethod]();
                            that.fireEvent(btn.id, btn, event, records, data, userHandler);
                        };
                    })(button);
                } else {
                    console.info('初始化系统自带按钮' + button.id);
                    button.handler = function (btn, event) {
                        var records = that.rsm[getDataMethod]();
                        that.fireEvent(btn.id, btn, event, records);
                    };
                }
            }
            /**
             * 创建window
             * @param  {Object} config 配置
             * @return {Ext.Window}        窗口
             */
            function createWindow(conf, record) {
                var win, formPanel,
                    isCreate = true,//是否创建为创建记录
                    editMode, //编辑模式
                    saveBtnId = conf.id + ':btn:save',
                    idPrefix = '',
                    cancelBtnId = conf.id + ':btn:cancel',
                    defaultValues = {},
                    beginFieldString;
                if (record) {
                    isCreate = false;
                    idPrefix = conf.id + ':window:edit:field:';
                    editMode = _.EDIT_EDITABLE;//编辑框可编辑
                } else {
                    idPrefix = conf.id + ':window:add:field:';
                    editMode = _.ADD_EDITABLE;//添加框可编辑
                }
                //创建formpanel的字段
                var fieldConfig = conf.fields, fields = [];
                for (var i = 0; i < fieldConfig.length; i++) {
                    var item = _.cloneObject(fieldConfig[i], ['mStore', 'mLocalData', 'store', 'editStore']);
                    if (!_.isEmpty(item.defaultValue)) {
                        defaultValues[item.dataIndex] = item.defaultValue;
                    }

                    (function (orgnFldItem) {
                        var fieldConfItem;
                        if (orgnFldItem.mEditMode === editMode || 
                            orgnFldItem.mEditMode === _.ALL_EDITABLE) {
                            if (_.isEmpty(orgnFldItem.listeners)) {
                                orgnFldItem.listeners = {};
                            }

                            if (orgnFldItem.type === 'enum') {
                                fieldConfItem = {
                                    id: idPrefix + orgnFldItem.id + ':' + Math.round(Math.random() * 10000),
                                    fieldLabel: orgnFldItem.fieldLabel,
                                    store: orgnFldItem.editStore, //direct array data
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    width: orgnFldItem.width,
                                    mode: orgnFldItem.mMode,
                                    emptyText: orgnFldItem.emptyText,
                                    valueField: orgnFldItem.valueField || orgnFldItem.dataIndex,
                                    displayField: orgnFldItem.displayField === undefined ? 'displayText'
                                                                            : orgnFldItem.displayField,
                                    editable: orgnFldItem.editable,
                                    valueNotFoundText: orgnFldItem.valueNotFoundText === undefined ? '没有该选项'
                                                                                    : orgnFldItem.valueNotFoundText,
                                    forceSelection: true,
                                    blankText : '请选择',
                                    dataIndex: orgnFldItem.dataIndex,
                                    name: orgnFldItem.id,
                                    selectOnFocus: true,
                                    allowBlank: false,
                                    listeners: {
                                        afterrender: function (combo) {
                                            //combo.setValue(combo.store.getAt(selectPos).data[orgnFldItem.dataIndex]);
                                        }
                                    }
                                };
                            } else {
                                fieldConfItem = _.except(orgnFldItem, ['type', 'editable', 'mEditMode']);
                                fieldConfItem.id = idPrefix + fieldConfItem.id + Math.round(Math.random() * 10000);
                                fieldConfItem.name = orgnFldItem.dataIndex;
                            }
                            var orgnEventHandler = fieldConfItem.listeners[LISTENERS_TYPE[orgnFldItem.type]];
                            fieldConfItem.listeners[LISTENERS_TYPE[orgnFldItem.type]] = function (field, rec, index) {
                                var btn = Ext.getCmp(saveBtnId);
                                if (record && field.getValue() === record.get(field.getName())) {
                                    btn.disable();
                                } else {
                                    btn.enable();
                                }
                                if (orgnEventHandler) {
                                    orgnEventHandler(field, rec, index, win);
                                }
                            };
                            //可编辑字段根据数据类型创建field
                            fields.push(new FIELD_TYPE[orgnFldItem.type](fieldConfItem));
                        }
                    })(item);
                    
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
                        var basicForm = formPanel.getForm();
                        if (!basicForm.isValid()) {
                            console.log('表单没有填写完整');
                            return;
                        }
                        var saveRecord,
                            fieldValues = basicForm.getFieldValues();
                        //将没有在form表单编辑的默认值加入record
                        for (var fieldName in defaultValues) {
                            if (_.isEmpty(fieldValues[fieldName])) {
                                fieldValues[fieldName] = defaultValues[fieldName];
                            }
                        }

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
                    labelWidth: conf.labelWidth,
                    labelSeparator: ':',
                    items: fields
                });

                conf.items = formPanel;
                conf.modal = !conf.mMultiWin;
                conf.listeners = _.extend({}, conf.listeners, {
                    destroy: function () {
                        console.log('window ' + conf.id + 'destroy');
                        if (record) {
                            removeEditWindow(record.id);
                        }
                    },
                    show: function () {
                        //显示
                        beginFieldString = serializeForm(formPanel.getForm().getEl());
                        that.fireEvent(eventConfig.WINDOW_SHOW, win, record);
                    },
                    activate: function () {
                        console.info('窗口' + conf.id + '激活');
                        that.fireEvent(eventConfig.WINDOW_SHOW, win, record);
                    },
                    afterrender: function () {
                        var form = formPanel.getForm();
                        form.setValues(defaultValues);
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
                });
                //创建窗口
                win = new Ext.Window(conf);
                win.getFormPanel = function () {
                    return formPanel;
                };
                formPanel.disableAllFields = function () {
                    for (var i = 0; i < fields.length; i++) {
                        fields[i].disable();
                    }
                };
                formPanel.getField = function (id) {
                    for (var i = 0; i < fields.length; i++) {
                        if (fields[i].name === id) {
                            return fields[i];
                        }
                    }
                };
                win.loadRecord = function (record) {
                    //如果有记录就将记录加载进窗口
                    if (record) {
                        formPanel.getForm().loadRecord(record);
                    }
                    beginFieldString = serializeForm(formPanel.getForm().getEl());
                };
                return win;
            }

            console.log('#######初始化init函数');
            this.init = function (conf) {
                var store = conf.store,
                    idOfBtnTbar = buttonsBarConfig && buttonsBarConfig.mIdList,
                    columnModel,
                    tbar, editor, mainPanel, mainPanelConfig;

                /**
                 * 改变所有按钮的状态
                 */
                this.changeAllBtnStatu = function () {
                    var record = this.rsm[getDataMethod]();
                    var needEnable;
                    for (var btnName in idOfBtnTbar) {
                        //添加按钮和刷新按钮不需要改变状态
                        if (BTN_CHECK_EXCEPT.indexOf(btnName) >= 0) {
                            continue;
                        }
                        var btn = Ext.getCmp(idOfBtnTbar[btnName]);
                        console.log(btnName);
                        if (!btn) { continue; }
                        needEnable = btn.initialConfig.whenEnable;
                        if (!needEnable) { needEnable = defaultNeedEnable; }
                        if (needEnable(record)) {
                            btn.enable();
                        } else {
                            btn.disable();
                        }
                    }
                };

                this.getCurrentRecord = function () {
                    return this.rsm[getDataMethod]();
                };
                /**
                 * 设置按钮状态
                 * @param {String} btn    按钮的ID
                 * @param {Boolean} status [description]
                 */
                this.setBtnStatu = function (btn, status) {
                    var ed = status ? 'enable' : 'disable';
                    Ext.getCmp(idOfBtnTbar[btn])[ed]();
                };
                //行编辑器
                if (needRowEditor(that.config.addEditWay)) {
                    console.log('needRowEditor');
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
                            },
                            afteredit: function (editor, changes, r) {
                                
                                that.fireEvent(eventConfig.SAVE_RECORD_OF_ROWEDITOR, r, changes);
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
                            Ext.getCmp(idOfBtnTbar.delete).enable();
                        }, 400);
                    }
                };
                this.selectRow = function (rowIndex) {
                    this.rsm.selectRow(rowIndex);
                };

                this.selectRecord = function (records) {
                    if (!_.isArray(records)) {
                        records = [records];
                    }
                    this.rsm.selectRecords(records);
                };

                /**
                 * 打开编辑窗口
                 * @param  {Ext.data.Record} record 记录
                 */
                this.openEditWindow = function (record) {
                    //如果窗口已经打开，则直接显示窗口
                    var editWindow = getEditWindow(record.id);
                    if (editWindow) {
                        editWindow.show(true);
                        return;
                    }
                    var windowConfig = that.config.window.edit;
                    //窗口编辑器
                    editWindow = createWindow({
                        id: windowConfig.id + ':' + record.id,
                        title: '编辑记录',
                        width: windowConfig.width,
                        height: windowConfig.height,
                        labelWidth: windowConfig.labelWidth,
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
                    editWindow.show();
                    editWindow.loadRecord(record);
                    setEditWindow(record.id, editWindow.id);
                    if (lastEditWinPos) {
                        var left = lastEditWinPos[0] + 50,
                            top = lastEditWinPos[1] + 50;
                        console.log('new Position:' + left + ' ' + top);
                        editWindow.setPosition(left, top);
                    }
                    lastEditWinPos = editWindow.getPosition();
                    console.dir(lastEditWinPos);
                    return editWindow;
                };
                /**
                 * 打开编辑窗口
                 * @param  {Ext.data.Record} record 记录
                 */
                this.openAddWindow = function () {
                    var windowConfig = that.config.window.add;
                    //窗口编辑器
                    var addWindow = createWindow({
                        id: windowConfig.id,
                        title: '添加记录',
                        labelWidth: windowConfig.labelWidth,
                        width: windowConfig.width,
                        height: windowConfig.height,
                        plain: true,
                        bodyStyle: 'padding:5px',
                        closeAction: 'close',
                        fields: windowConfig.fields,
                        mEvent: {
                            ok: eventConfig.SAVE_RECORD
                        }
                    });
                    addWindow.show();
                    return addWindow;
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
                var listeners;
                if (buttonsBarConfig) {
                    tbar = new Ext.Toolbar(buttonsBarConfig);
                    listeners = {
                        rowSelect: function (/*sm, rowIndex, record*/) {
                            that.changeAllBtnStatu();
                        },
                        rowdeselect: function (/*sm, rowIndex, record*/) {
                            //that.changeAllBtnStatu();
                        }
                    };
                } else {
                    listeners = {};
                }

                if (!this.config.singleSelect) {
                    this.rsm = new Ext.grid.CheckboxSelectionModel({
                        singleSelect: this.config.singleSelect,
                        listeners: listeners
                    });
                    var cmConfig = [this.rsm].concat(conf.columns);
                    columnModel = new Ext.grid.ColumnModel(cmConfig);
                } else {
                    this.rsm = new Ext.grid.RowSelectionModel({
                        singleSelect: this.config.singleSelect,
                        listeners: listeners
                    });
                    columnModel = new Ext.grid.ColumnModel(conf.columns);
                }
                

                var searchBarConfig = that.config.searchBarConfig,
                    searchBar;
                if (!!searchBarConfig) {
                    searchBarConfig.items.push({
                        text: '搜索',
                        icon: Portal.util.icon('magnifier.png'),
                        handler: function () {
                            var item, key, fieldName, params = {};
                            console.log('search');
                            for (key in searchBarConfig.items) {
                                item = searchBarConfig.items[key];
                                if (item.id) {
                                    fieldName = item.id.substring(item.id.lastIndexOf(':') + 1);
                                    if (fieldName) {
                                        params[fieldName] = Ext.getCmp(item.id).getValue();
                                        if (params[fieldName] === CRUD_FIELD_ALL) {
                                            params[fieldName] = '';
                                        }
                                    }
                                }
                            }
                            that.fireEvent(eventConfig.SEARCH, params);
                        }
                    });
                    searchBarConfig.items.push({
                        text: '筛选',
                        icon: Portal.util.icon('table_lightning.png'),
                        handler: function () {
                            var item, key, fieldName, filterParams = [], param, value;
                            for (key in searchBarConfig.items) {
                                param = {};
                                item = searchBarConfig.items[key];
                                if (item.id) {
                                    fieldName = item.id.substring(item.id.lastIndexOf(':') + 1);
                                    if (fieldName) {
                                        value = Ext.getCmp(item.id).getValue();
                                        if (value === CRUD_FIELD_ALL) {
                                            value = '';
                                        } else if (value === TRUE) {
                                            value = true;
                                        } else if (value === FALSE) {
                                            value = false;
                                        }
                                        if (!_.isEmpty(value)) {
                                            param = {
                                                property: fieldName,
                                                value: value,
                                                anyMatch: true,
                                                caseSensitive: true
                                            };
                                            filterParams.push(param);
                                        }
                                        
                                    }
                                }
                            }
                            that.fireEvent(eventConfig.FILTER, filterParams);
                        }
                    })

                    searchBar = new Ext.Toolbar(searchBarConfig);
                }
                mainPanelConfig = {
                    id: conf.id + ':grid',
                    store: store,
                    loadMask: true,
                    border: false,
                    closable: true,
                    autoScroll: true,
                    enableHdMenu: false,
                    sm: this.rsm,
                    cm: columnModel,
                    bbar: this.config.pageToolbarConfig ? 
                        new Ext.PagingToolbar(this.config.pageToolbarConfig) 
                            : null,
                    listeners: {
                        viewready: function () {
                            that.loadResMask = new Ext.LoadMask(mainPanel.body.dom, {msg: "等一下下，加载资源中"});
                            that.fireEvent(eventConfig.VIEW_READY, that);
                        },
                        render: function () {
                            if (searchBar && tbar && !tbar.used) {
                                //如果有搜索栏则在搜索栏的下面加上工具栏
                                tbar.render(this.tbar);
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
                mainPanelConfig.tbar =  searchBar || tbar;
                mainPanelConfig.tbar.used = true;
                if (needRowEditor(that.config.addEditWay)) {
                    mainPanelConfig.plugins = [editor];
                }
                mainPanel = new Ext.grid.GridPanel(mainPanelConfig);

                return mainPanel;
            };
            console.info('创建view对象');
        },
        error: function (msg) {
            Ext.Msg.alert('错误', msg);
        },
        info: function (msg) {
            Ext.example.msg('成功', msg);
        },
        alert: function (msg) {
            Ext.Msg.alert('警告', msg);
        },
        showLoadResMask: function () {
            this.loadResMask.show();
        },
        hideLoadResMask: function () {
            this.loadResMask.hide();
        }
    });
    return View;
});