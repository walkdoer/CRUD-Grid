/**
 * Ext.ux.grid.CRUD组件 Config-- Grid.CRUD.Config.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
    'use strict';
    var _ = require('crud/public/js/Grid.CRUD.Common.js');
    /**
     * Config模块
     */
    var ID = {},
        EVENT = {
            /**------------=====事件的规范=====-----------
             *  event_模块_组件_[组件嵌套]__动作
             */
            VIEW: {
                ROW_DBL_CLICK: 'event_view_row_double_click',
                SAVE_RECORD: 'event_view_save_record',
                SEARCH: 'event_view_search_record',
                UPDATE_RECORD: 'event_view_update_record',
                LOAD_DATA: 'event_view_load_data',
                SAVE_RECORD_OF_ROWEDITOR: 'event_view_save_record_of_roweditor',
                WINDOW_SHOW: 'event_view_window_show',
                VIEW_READY: 'event_view_ready',
                FILTER: 'event_view_filter_record'
            },
            //向外部提供的消息，所以格式与内部消息不同
            APP: {
                CREATE_SUCCESS : 'crud_create_success',
                CREATE_ERROR   : 'crud_create_error',
                SEARCH_SUCCESS : 'crud_search_success',
                SEARCH_ERROR   : 'crud_search_error',
                FILTER_SUCCESS : 'crud_filter_success',
                FILTER_ERROR   : 'crud_filter_error',
                DELETE_SUCCESS : 'crud_delete_success',
                DELETE_ERROR   : 'crud_delete_error',
                UPDATE_SUCCESS : 'crud_update_success',
                UPDATE_ERROR   : 'crud_update_error',
                LOAD_SUCCESS   : 'crud_load_success',
                LOAD_ERROR     : 'crud_load_error',
                VIEW_READY     : 'crud_view_ready'
            }
        },
        CRUD_FIELD_ALL = _.CRUD_FIELD_ALL,
        //文件类型
        TYPES = _.TYPES,
        FIELD_TYPE = _.FIELD_TYPE,
        SEARCH_FIELD_WIDTH = _.SEARCH_FIELD_WIDTH,
        WIN_HEIGHT_SPAN = _.WIN_HEIGHT_SPAN,
        ALL_EDITABLE = _.ALL_EDITABLE,
        ADD_EDITABLE = _.ADD_EDITABLE,
        EDIT_EDITABLE = _.EDIT_EDITABLE,
        ALL_NOT_EDITABLE = _.ALL_NOT_EDITABLE,
        WIN_SPAN = _.WIN_SPAN,
        TRUE = _.TRUE,
        FALSE = _.FALSE,
        originConfig = {}, //未经过处理的原始用户的配置
        userConfig = {}; //经过处理后的用户配置

    var Config = function (initialConfig) {
        this.config = initialConfig;
    },
    /**
     * 检查配置的合法性,不合法的进行修复
     * @param  {Object} conf 配置
     */
    checkConfig = function checkConfig(conf) {
        var columns = conf.mColumns, col, storeConfig, textColor;

        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            //用户没有配置字段的可编辑限制，则默认为可编辑
            if (typeof col.editable !== 'boolean') {
                col.editable = true;
            }
            //没有配置dataIndex，就默认用id为dataIndex
            if (!col.dataIndex) {
                col.dataIndex = col.id;
            }
            col.mEditMode = getEditMode(col.mEdit, col.hidden);
            /**
             * 对宽度配置项进行处理，
             * 将 [180, 200] 或者 '180, 200', 或者 180
             * 转化未系统认识的 [表格，搜索，编辑窗口，添加窗口] 宽度格式
             */
            if (_.is('String', col.mWidth)) {
                var widthArray = col.mWidth.split(',');
                var widthArrayLen = widthArray.length;
                for (var ii = 0; ii < widthArrayLen; ii++) {
                    var wid = widthArray[ii];
                    widthArray[ii] = parseInt(wid, 10);
                }
                col.widthArray = widthArray;
            } else if (_.is('Number', col.mWidth)) {
                //[表格，搜索，编辑窗口，添加窗口]
                col.widthArray = [col.mWidth, col.mWidth, col.mWidth, col.mWidth];
            } else if (_.is('Undefined', col.mWidth)) {
                col.widthArray = [100, 120, 100, 100];
            } else if (_.isArray(col.mWidth)) {
                col.widthArray = col.mWidth;
            }
            for (var kk = col.widthArray.length; kk < 4; kk++) {
                if (_.isEmpty(col.widthArray[kk])) {
                    col.widthArray[kk] = col.widthArray[0];
                }
            }
            if (col.mText) {
                var testArr = col.mText.split(','),
                    reg = new RegExp(/\s+/);
                col.mPosiText = testArr[0];
                col.mNegaText = testArr[1];

                if (col.mNegaText) {
                    textColor = col.mNegaText.split(reg);
                    col.mNegaText = textColor[0];
                    if (textColor[1]) {
                        col.mNegaColor = textColor[1];
                    }
                }
                if (col.mPosiText) {
                    textColor = col.mPosiText.split(reg);
                    col.mPosiText = textColor[0];
                    if (textColor[1]) {
                        col.mPosiColor = textColor[1];
                    }
                }
            }
        }
        if (!conf.store) {
            conf.store = {};
        }
        storeConfig = conf.store;
        storeConfig.successProperty = storeConfig.successProperty || 'success';
        storeConfig.idProperty = storeConfig.idProperty || 'id';
        storeConfig.messageProperty = storeConfig.messageProperty || 'msg';
        storeConfig.totalProperty = storeConfig.totalProperty || 'totalCount';
        storeConfig.root = storeConfig.root || 'data';
        storeConfig.fields = getStoreField(columns);
    },
    getComboMode = function getComboMode(col) {
        if (col.mLocalData) {
            return 'local';
        } else if (col.mStore || col.mUrl) {
            return 'remote';
        }
    },
    getFieldLabelWidth = function getFieldLabelWidth(columnsConfig) {
        var col, maxWidth = 0, width;
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            //只要该字段在编辑和添加两个窗口一个可编辑，且有fieldLabel
            if (col.mEditMode !== ALL_NOT_EDITABLE && col.fieldLabel) {
                width = _.calTextWidth(col.fieldLabel);
                if (width > maxWidth) {
                    maxWidth = width;
                }
            }
        }
        return maxWidth;
    },
    getIdProperty = function getIdProperty(store, columns) {
        var col, id, idReal;
        idReal = store.idProperty;
        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            if (col.dataIndex === idReal) {
                id = col.id;
            }
        }
        return {
            id: id,
            idReal: idReal
        };
    },

    getWindowFieldConfig = function getWindowFieldConfig(columns, winType) {
        /**
         * {
         *     emptyText: '空的时候的提示',
         *     fieldLabel: '标题',
         *     allowblank: false
         * }
         */
        return getConfigFromColumn(columns, function (col) {
            var config = _.except(col, [
                'sortable',
                'header',
                'renderer'
            ]);
            if (config.type === 'enum') {
                config.store = col.editStore;
                config.mMode = getComboMode(col);
            }
            if (winType === 'edit') {
                config.width = col.widthArray[3];
            } else if (winType === 'add') {
                config.width = col.widthArray[2];
            }
            config.fieldLabel = col.fieldLabel || col.header;
            config.enableKeyEvents = true;
            return config;
        });
    },
    /**
     * 通过filter从columns配置中提取配置项
     * @param  {Funtion} filter 过滤器
     * @return {Object}         结果
     */
    getConfigFromColumn = function getConfigFromColumn(columns, filter) {
        var col, field, fields = [];
        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            if (!col.dataIndex) {
                continue;
            }
            field = filter(col);
            if (field) {
                fields.push(field);
            }
        }
        return fields;
    },
    /**
     * 获取数据库的字段配置
     * @param  {Array} columns 用户的字段配置
     * @return {Array}         符合Ext规范的字段配置
     */
    getStoreField = function getStoreField(columns) {
        return getConfigFromColumn(columns, function (col) {
            var field = {}, type = col.type;
            field.name = col.id;
            //如果用户有定义类型 Type, 且类型是合法的
            if (!!type && TYPES[type.toUpperCase()]) {
                if (type === TYPES.DATETIME || type === TYPES.TIME) {
                    type = TYPES.DATE;
                }
                field.type = Ext.data.Types[type.toUpperCase()];
            } else {
                throw '字段' + col.id + '的类型' + type + '不合法或者为空';
            }
            //如果用户有定义 dateFormat
            if (!!col.dateFormat) {
                field.dateFormat = col.dateFormat;
            }
            //字段的非空限制，在数据库为autoSave的时候可以避免表单自动提交
            field.mapping = col.dataIndex;
            field.allowBlank = (col.allowBlank === undefined || col.allowBlank === null) ? true : col.allowBlank;
            return field;
        });
    },
    createStoreForColumns = function createStoreForColumns(columns) {
        var col;
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            if (col.type === 'enum') {
                col.store = createStoreFromComboConfig(col);
                col.editStore = createStoreFromComboConfig(col, true);
            }
        }
    },
     /**
     * 是否需要预加载数据
     * @return {Boolean}
     */
    isNeedPreLoadRes = function isNeedPreLoadRes(columns) {
        var col;
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            if (col.store || col.mUrl || col.mStore) {
                return true;
            }
        }
    },
    /**
     * 根据Combo的字段配置来生成Store
     * @param  {Object} combo         字段配置
     * @param  {Boolean} useToEdit    是否用于编辑或者添加
     * @return {Ext.data.JsonStore}
     */
    createStoreFromComboConfig = function createStoreFromComboConfig(combo, useToEdit) {
        console.log("##createStoreFromComboConfig##");
        var store, localData;
        if (combo.mCrud) {
            store = Ext.StoreMgr.get(combo.mCrud + ':store');
        } else if (combo.mStore) {
            store = combo.mStore;
        } else if (combo.mUrl) {
            var valueName = combo.valueField || combo.id,//优先使用用户自定义的valueField
                valueMappig = combo.valueField || combo.dataIndex,
                textName = combo.displayField || 'displayText',//优先使用用户自定义的displayField
                textMapping = combo.displayField || 'displayText',
                fields = [{
                    name: valueName,
                    mapping: valueMappig
                }, {
                    name: textName,
                    mapping: textMapping
                }],
                listeners;
            if (!useToEdit) {
                listeners = {
                    load: function () {
                        var ComboRecord = Ext.data.Record.create(fields),
                            data = {},
                            rd;
                        data[valueName] = CRUD_FIELD_ALL;
                        data[textName] = '全部';
                        rd = new ComboRecord(data);

                        store.insert(0, rd);
                    }
                };
            }
            store = new Ext.data.JsonStore({
                autoSave: false,
                //autoDestroy: true,
                url: combo.mUrl,
                fields: fields,
                root: 'data',
                listeners: listeners
            });
        } else if (combo.mLocalData) {
            if (_.isObject(combo.mLocalData)) {
                localData = getArrayFromObject(combo.mLocalData);
            } else if (_.isArray(combo.mLocalData)) {
                localData = combo.mLocalData;
            } else {
                throw '[Grid.CRUD.Config] function createStoreFromComboConfig () : mLocalData is null or invalid';//出错
            }
            store = new Ext.data.ArrayStore({
                fields: [combo.id,  combo.displayField || 'displayText'],
                data: localData
            });
        }
        return store;
    },
    /**
     * 字段的可编辑性
     * @param  {Object/Boolean} editable
     * @return {Int}            0 全部可编辑， 1 添加窗口编辑，2 编辑窗口可编辑
     */
    getEditMode = function getEditMode(editMode, hidden) {
        var flag = 0;
        if (hidden) {
            return ALL_NOT_EDITABLE;
        }
        if (_.isObject(editMode)) {
            //添加窗口可编辑
            if (_.isEmpty(editMode.add) || editMode.add) {
                flag += 2;
            }
            //编辑窗口可编辑
            if (_.isEmpty(editMode.edit) || editMode.edit) {
                flag += 3;
            }
            switch (flag) {
            case 0:
                return ALL_NOT_EDITABLE;
            case 2:
                return ADD_EDITABLE;
            case 3:
                return EDIT_EDITABLE;
            case 5:
                return ALL_EDITABLE;
            }
        } else if (_.isEmpty(editMode) || editMode) {
            //没有配置默认该字段在所有位置都可以编辑
            return ALL_EDITABLE;
        } else {
            //editMode: false
            return ALL_NOT_EDITABLE;
        }
    },
    getSelectPos = function getSelectPos(column, param) {
        var selectPos = 0, pos;
        if (column.mStore) {
            column.mLocalData.each(function (record) {
                if (parseInt(record.get(column.id), 10) === param[column.id]) {
                    selectPos = pos;
                }
                pos += 1;
            });
        }
        return selectPos;
    },
    /**
     * 获得窗口的高度
     * @return {Int} Height
     */
    getWindowHeight = function getWindowHeight(columnsConfig, winType) {
        var col, height = 0,
            editMode = '';
        if (winType === 'add') {
            editMode = ADD_EDITABLE;
        } else if (winType === 'edit') {
            editMode = EDIT_EDITABLE;
        }
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            if (col.mEditMode === ALL_EDITABLE ||
                col.mEditMode === editMode) {
                if (col.height) {
                    height += col.height;
                } else {
                    height += 26;
                }
            }
        }
        return height + WIN_HEIGHT_SPAN;
    },

    /**
     * 获得窗口的宽度
     * @return {Int} Height
     */
    getWindowWidth = function getWindowWidth(columnsConfig, winType) {
        var col, maxWidth = 0, editMode = '', width;
        if (winType === 'add') {
            editMode = ADD_EDITABLE;
        } else if (winType === 'edit') {
            editMode = EDIT_EDITABLE;
        }
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            if (col.mEditMode === editMode ||
                col.mEditMode === ALL_EDITABLE) {
                if (winType === 'add') {
                    width = col.widthArray[2];
                } else if (winType === 'edit') {
                    width = col.widthArray[3];
                }
                if (width && width > maxWidth) {
                    maxWidth = width;
                }
            }
        }
        return maxWidth + WIN_SPAN + getFieldLabelWidth(columnsConfig);
    },
    /**
     * 根据用户对editor的配置进行
     * 选择编辑器, 如果不配置，默认使用rowEditor
     * editor: 'window' 表示编辑和添加的时候全部使用window来进行编辑
     * 或者可以像下面一样分开选择
     * editor: {
     *    add: 'rowEditor', //添加的时候使用rowEditor
     *    edit: 'widow' //编辑的时候使用窗口
     * },
     * @return {Object}
     *
     */
    getAddEditWay = function getAddEditWay(editable, editor) {
        if (!editable) {
            return null;
        }
        if (!editor || editor === 'rowEditor') {
            return {
                add: 'rowEditor',
                edit: 'rowEditor'
            };
        } else if (editor === 'window') {
            return {
                add: 'window',
                edit: 'window'
            };
        } else if (_.isObject(editor)) {
            return {
                add: editor.add || 'rowEditor',
                edit: editor.edit || 'rowEditor'
            };
        } else {
            return null;
        }
    },
    getSearchBarItemWidth = function getSearchBarItemWidth(type) {
        return SEARCH_FIELD_WIDTH[type];
    },
    /**
     * 从Object里面获取数组
     * 例如 var a = {
     *          '0': 'abc',
     *          '1': 'def'
     *      }
     *
     * 返回 [['0', 'abc'], ['1', 'def']]
     */
    getArrayFromObject = function getArrayFromObject(obj) {
        var array = [], tmp;
        for (var key in obj) {
            tmp = [key, obj[key]];
            array.push(tmp);
        }
        return array;
    },
    getStoreDefaultData = function getStoreDefaultData(columns) {
        var defaultData = {}, col;
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            defaultData[col.dataIndex] = col.defaultData || '';
        }
        return defaultData;
    },

    /**
     * 是否需要编辑/添加功能，
     * 如果所有字段都是不可编辑的，则取消编辑功能
     * 如果所有字段都是不可添加的，则取消添加功能， 包括禁用添加按钮
     * @param  {Array[Object]}   columns         字段配置
     */
    getSystemAddEditMode = function getSystemAddEditMode(columns) {
        var col, em = {
            edit: false,
            add : false
        };
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            if (col.mEditMode === ALL_EDITABLE) {
                em.edit = true;
                em.add  = true;
                break;
            }
            if (col.mEditMode === ADD_EDITABLE) {
                em.add = true;
            }
            if (col.mEditMode === EDIT_EDITABLE) {
                em.edit = true;
            }
            if (em.add && em.edit) {
                break;
            }
        }
        return em;
    },
    /**
     * 获取搜索栏目配置
     * @param  {Object} searchConfig [搜索的用户配置]
     * @param  {Object} ColumnConfig [字段的属性，需要根据字段的属性来生
     *                                成不同的编辑类型Combobox,NumberField]
     * @return {Object}              [配置]
     */
    getSearchBarConfig = function getSearchBarConfig(searchConfig, columnConfig) {
        if (columnConfig.length === 0) { return null; }
        var field, column, searchCondition, items = [];
        var property = searchConfig.property;
        //配置只能是数组
        if (!_.isArray(property)) {
            property = [].concat(property);
        }
        for (var i = 0; i < property.length; i++) {
            (function (column, self) {
                searchCondition = property[i];
                column = _.getColumnById(searchCondition, columnConfig);
                if (!column) { return; }
                items.push(column.fieldLabel, ' ');
                if (!column.realId) {
                    column.realId = {};
                }
                var realId = column.realId.search = self.systemId + ':grid:searchbar:' + column.id;
                if (column.type === 'enum') {
                    var mode = getComboMode(column);
                    var selectPos = 0, param = self.get('store', 'params');
                    if (param) {
                        selectPos = getSelectPos(column, param);
                    }
                    field = new FIELD_TYPE[column.multi ? 'multiEnum' : 'enum']({
                        id: realId,
                        fieldLabel: column.fieldLabel,
                        store: column.store,
                        hideOnSelect: false,
                        submitValue: true,
                        typeAhead: true,
                        triggerAction: 'all',
                        //宽度优先使用计算过后的宽度，否则使用用户自定义宽度
                        width: getSearchBarItemWidth(column.type) || column.widthArray[1],
                        mode: mode,
                        mParent: column.mParent,
                        emptyText: column.emptyText,
                        valueField: column.valueField || column.dataIndex || column.id,
                        displayField: column.displayField === undefined ? 'displayText'
                                                                : column.displayField,
                        editable: column.editable,
                        valueNotFoundText: column.valueNotFoundText === undefined ? '没有该选项'
                                                                        : column.valueNotFoundText,
                        forceSelection: true,
                        selectOnFocus: true,
                        blankText : '请选择',
                        allowBlank: true, //搜索框的字段为非必填，可以为空
                        listeners: {
                            afterrender: function (combo) {
                                var record = combo.store.getAt(selectPos);
                                if (record) {
                                    combo.setValue(record.data[column.id]);
                                }
                            },
                            select: function (combo, record, index) {
                                console.log(record, index);
                            },
                            beforequery: function () {
                                var parentId,
                                    config = this.initialConfig;
                                console.debug('beforequery', config);
                                if (config.mParent) {
                                    parentId = _.getColumnById(config.mParent, columnConfig).realId.search;
                                    var param = {};
                                    param[config.mParent] = Ext.getCmp(parentId).getValue();
                                    if (CRUD_FIELD_ALL === param[config.mParent]) {
                                        param[config.mParent] = '';
                                    }
                                    _.setBaseParam(this.store, param);
                                    column.store.load();
                                }
                            }
                        }
                    });
                } else if (column.type === 'boolean') {
                    var valueField = column.dataIndex || column.id;
                    field = new Ext.form.ComboBox({
                        id: realId,
                        store: new Ext.data.ArrayStore({
                            fields: [valueField, 'displayText'],
                            data: [['', '全部'], [TRUE, column.mPosiText || 'true'], [FALSE, column.mNegaText || 'false']]
                        }),
                        typeAhead: true,
                        triggerAction: 'all',
                        width: getSearchBarItemWidth(column.type) || column.widthArray[1],
                        mode: 'local',
                        valueField: valueField,
                        displayField: 'displayText',
                        valueNotFoundText: '没有该选项',
                        selectOnFocus: true,
                        allowBlank: true //搜索框的字段为非必填，可以为空
                    });
                } else {
                    //排除掉不需要的属性
                    var conf = _.except(column, [
                        'type',
                        'sortable',
                        'header',
                        'hidden',
                        'editable',
                        'mEditMode',
                        'dataIndex'
                    ]);
                    conf.id = realId;
                    conf.width = getSearchBarItemWidth(column.type) || column.widthArray[1];
                    conf.allowBlank = true;//搜索框的字段为非必填，可以为空
                    field = new FIELD_TYPE[column.type](conf);
                }
                items.push(field, ' ');
            })(column, this);
        }
        return {
            items: items
        };
    };
    /**
     * 初始化参数, 该函数对用户的参数进行预处理
     * @param  {String} systemId 组件ID
     */
    Config.prototype = {
        initArgs: function initArgs(conf) {
            conf.mEditable = conf.mEditable === undefined ? true : conf.mEditable;
            ID[this.systemId] =  {
                grid: {
                    //默认自带的删除，添加，刷新按钮
                    'tbar_buttons_btn_sysdelete': this.systemId + '-grid-tbar-btn-system-delete',
                    'tbar_buttons_btn_sysadd': this.systemId + '-grid-tbar-btn-system-add',
                    'tbar_buttons_btn_sysrefresh': this.systemId + '-grid-tbar-btn-system-refresh'
                },
                addWindow: {
                    //Todo
                },
                editWindow: {
                    //Todo
                }
            };
            //根据用户的配置初始化ID
            for (var i = 0, len = !conf.mButtons ? 0 : conf.mButtons.length; i < len; i++) {
                if (typeof conf.mButtons[i] === 'string') { continue; }
                this.setId('grid', 'tbar', 'buttons', 'btn', conf.mButtons[i].id,//ID保存的位置
                    this.systemId + '-grid-tbar-buttons-btn-' + conf.mButtons[i].id);//ID的值
            }

            this.defaultButtons = {
                add: {
                    id: this.getId('grid', 'tbar', 'buttons', 'btn', 'sysadd'),
                    text: '添加',
                    iconCls: 'icon-add'
                },
                delete: {
                    id: this.getId('grid', 'tbar', 'buttons', 'btn', 'sysadelete'),
                    text: '删除',
                    iconCls: 'icon-delete',
                    disabled: true
                },
                refresh: {
                    id: this.getId('grid', 'tbar', 'buttons', 'btn', 'sysrefresh'),
                    text: '刷新',
                    iconCls: 'icon-refresh'
                }
            };

            if (conf.search && _.isArray(conf.search)) {
                var property = conf.search;
                conf.search = {
                    lowerCaseParam: false,
                    property: property
                };
            }
        },
        /**
         * 获取配置项
         * @param  {String}  component [组件名称]
         * @param  {String} name [配置名]
         * @return {Object}      [结果]
         */
        get: function get() {
            var args = Array.prototype.slice.call(arguments),
                conf;
            if (args.length === 0) {
                return null;
            }
            conf = userConfig[this.systemId];
            for (var i = 0, len = args.length; i < len; i++) {
                conf = conf[args[i]];
                //如果参数多于实际的配置,返回null
                if (!_.isObject(conf) && i < len - 1) {
                    console.log('[Grid.CRUD.Config]没有该参数');
                    return null;
                }
            }
            return conf;
        },
        /**
         * 设置配置项
         * @param  {String} name 配置名
         * @param  {Object}      Value
         */
        set: function set() {
            var args = Array.prototype.slice.call(arguments),
                conf;
            if (args.length === 1) {
                throw '[Grid.CRUD.Config] function set () : set  without value.';//出错
            } else if (args.length > 1) {
                conf = userConfig[this.systemId];
                for (var i = 0; i < args.length - 2; i++) {
                    if (!conf[args[i]]) {
                        conf[args[i]] = {};
                    }
                    conf = conf[args[i]];
                }
                conf[args[i]] = args[i + 1];
            }
        },
        /**
         * 获取顶部工具栏的配置
         * @return {Object} 配置
         */
        getTbarConfig : function getTbarConfig(config) {
            console.log("初始化顶部工具按钮");
            var tbarButtons = [];
            var buttons = config.mButtons, btn, btnName;
            if (!config.mButtons) { return null; }
            for (var i = 0; i < buttons.length; i++) {
                btn = buttons[i];
                if (typeof btn === 'string') {
                    btnName = btn;
                    btn = this.defaultButtons[btnName];
                    if (!!btn) {
                        btn.id = this.getId('grid', 'tbar', 'buttons', 'btn', 'sys' + btnName);
                        tbarButtons.push(btn);
                    }
                } else {
                    if (btn.id) {
                        btn.mMapfieldName = btn.id;//按钮对应的字段
                        btn.id = this.getId('grid', 'tbar', 'buttons', 'btn', btn.id);
                    }
                    btn.belongToUser = true;
                    tbarButtons.push(btn);
                }
            }
            return {
                items: tbarButtons
            };
        },

        /**
         * 获取Grid的栏目配置
         * @param  {Array} columns 用户的Column配置
         * @return {Array}         处理过后的用户配置
         */
        getColumnsConfig: function getColumnsConfig(columns) {
            var columnConfig = [], col, newCol, oConf;
            if (!columns || columns.length === 0) {
                throw '[Grid.CRUD.Config] 没有mColumns或者是mColumns为空数组，请检查';
            }
            for (var i = 0; i < columns.length; i++) {
                col = columns[i];
                if (!col.id) {
                    throw '[Grid.CRUD.Config] 有配置项缺乏Id，请检查';
                }
                //没有header就是不进行处理
                if (!col.header) { col.header = col.fieldLabel || col.id || col.dataIndex; }
                if (!col.fieldLabel) {col.fieldLabel = col.header; }
                newCol = _.except(col, ['type', 'mWidth', 'widthArray']);
                newCol.width = col.widthArray[0];
                oConf = originConfig[this.systemId];
                if (!oConf.mEditor || oConf.mEditor === 'rowEditor' ||
                     oConf.mEditor.add === 'rowEditor') {
                    //生成编辑器
                    if (!FIELD_TYPE[col.type]) {
                        throw '[Grid.CRUD.Config] function getColumnsConfig () : ' + col.id + '字段的类型' + col.type + '不合法.';//出错
                    }


                    if (col.mEditMode !== ALL_NOT_EDITABLE) {
                        if (col.type === 'enum') {
                            var mode = getComboMode(col);

                            newCol.editor = new FIELD_TYPE[col.type]({
                                fieldLabel: col.fieldLabel,
                                store: col.editStore, //direct array data
                                typeAhead: true,
                                triggerAction: 'all',
                                width: col.widthArray[0],//表格栏目的宽度
                                mode: mode,
                                emptyText: col.emptyText,
                                valueField: col.valueField || col.dataIndex || col.id,
                                displayField: col.displayField === undefined ? 'displayText'
                                                                        : col.displayField,
                                editable: col.editable,
                                valueNotFoundText: col.valueNotFoundText === undefined ? '没有该选项'
                                                                                : col.valueNotFoundText,
                                forceSelection: true,
                                selectOnFocus: true,
                                blankText : '请选择',
                                allowBlank: col.allowBlank,
                                listeners: {
                                    select: function (combo, record, index) {
                                        console.log(record, index);
                                    }
                                }
                            });
                        } else {
                            if (_.isEmpty(newCol.disabled)) { newCol.disabled = false; }
                            newCol.editor = new FIELD_TYPE[col.type]({
                                name: newCol.dataIndex,
                                allowBlank: newCol.allowBlank,
                                disabled: newCol.disabled || (col.mEditMode === ADD_EDITABLE || col.mEditMode === ALL_NOT_EDITABLE),
                                hidden: newCol.hidden
                            });
                        }
                    }
                }
                if (col.type === 'enum') {
                    newCol.renderer = (function (col) {
                        return function (value) {
                            if (value) {//传入的value不为空
                                //console.log('render ennum value = ' + value + ' ' + col.valueField);
                                var result = col.store.query(col.valueField, value);
                                if (result) {
                                    var record = result.get(0);
                                    if (record) {
                                        return result.get(0).get(col.displayField);
                                    } else {
                                        return '<font color="red">无效值</font>';
                                    }
                                } else {
                                    return '空值';
                                }
                            }
                            else {//传入的value为空
                                return '空值';
                            }
                        };
                    })(col);
                }
                newCol.dataIndex = newCol.id;
                columnConfig.push(newCol);
            }
            return columnConfig;
        },
        /**
         * 设置ID，参数个数不固定
         * 用法: setId('grid', 'tbar', 'search', 'this_is_id_of_searchbar');
         */
        setId : function setId() {
            var args = Array.prototype.slice.call(arguments);
            if (args.length <= 1) { return; }
            var idOfComponent = ID[this.systemId][args.shift()],
                value = args.splice(args.length - 1, 1)[0],
                key = args.join('_');
            idOfComponent[key] = this.systemId + value;
        },
        /**
         * [getId description]
         * @return {[type]} [description]
         */
        getId : function getId() {
            var args = Array.prototype.slice.call(arguments),
                idOfComponent = ID[this.systemId][args[0]],//组件的ID列表，如Grid
                result = {};
            if (!idOfComponent) { return result; }
            //构造键值
            args.shift();
            var wantKey = args.join('_');//tbar_btn
            for (var key in idOfComponent) {
                // tbar_btn_delete 子模块_部件类型_动作
                if (wantKey === key) {
                    return idOfComponent[wantKey];
                }
                if (key.indexOf(wantKey) === 0) {
                    var realkey = key.split('_');
                    result[realkey[realkey.length - 1]] = idOfComponent[key];
                    //console.log(realkey[realkey.length - 1], idOfComponent[key]);
                }
            }
            return result;
        },
        /**
         * 初始化用户配置
         * @param  {object} config 用户配置
         */
        init: function init() {
            var config = this.config;
            this.systemId = config.id;
            userConfig[this.systemId] = {};
            originConfig[this.systemId] = _.extend(true, {}, config);
            checkConfig(config);
            //初始化系统参数
            var tbarConfig,
                mode, //组件加载数据的模式
                columns = config.mColumns,
                specialColumns;//Ext理解的Columns
            this.initArgs(config);
            createStoreForColumns(columns);
            specialColumns = this.getColumnsConfig(columns);
            //组件加载数据的模式
            if (!!config.data) {
                mode = 'local';
            } else if (!!config.api) {
                mode = 'remote';
            }
            //为需要Store的字段创建Store
            /* 将用户的配置转化为系统可用的配置 */
            tbarConfig = this.getTbarConfig(config);
            this.set('mode', mode);
            this.set('needPreloadRes', isNeedPreLoadRes(columns));
            this.set('sysAddEditMode', getSystemAddEditMode(columns));
            this.set('editable', config.mEditable);
            this.set('origin', originConfig[this.systemId]);
            this.set('store', 'params', config.store.mInitParams);
            this.set('store', 'reader', config.store);
            this.set('store', 'defaultData', getStoreDefaultData(columns));

            if (config.search) {
                this.set('grid', 'tbar', 'search', 'property', getSearchBarConfig.call(this, config.search, columns));
                this.setId('grid', 'tbar', 'search', this.systemId + '-grid-tbar-search');
                this.set('grid', 'tbar', 'search', 'lowerCaseParam', config.search.lowerCaseParam);
            }
            if (config.mButtons) {
                this.set('grid', 'tbar', 'buttons', tbarConfig);
                this.setId('grid', 'tbar', 'buttons', this.systemId + 'grid-tbar-buttons');
            }
            var addWinHeight = getWindowHeight(columns, 'add'),
                winLabelWidth = getFieldLabelWidth(columns),
                addWinWidth = getWindowWidth(columns, 'add'),
                editWinHeight = getWindowHeight(columns, 'edit'),
                editWinWidth = getWindowWidth(columns, 'edit');
            var singleSelect = config.checkbox ? false : true;
            this.set('grid', 'page', config.page);
            this.set('grid', 'idProperty', getIdProperty(config.store, columns));
            this.set('grid', 'singleSelect', singleSelect);
            this.set('grid', 'addEditWay', getAddEditWay(config.mEditable, config.mEditor));
            this.set('event', 'view', EVENT.VIEW);
            this.set('event', 'app', EVENT.APP);
            this.set('window', 'edit', 'fields', getWindowFieldConfig(columns, 'edit'));
            this.set('window', 'edit', 'id', config.id + ':window:edit');
            this.set('window', 'edit', 'height', editWinHeight);
            this.set('window', 'edit', 'width', editWinWidth);
            this.set('window', 'edit', 'labelWidth', winLabelWidth);
            this.set('window', 'add', 'fields', getWindowFieldConfig(columns, 'add'));
            this.set('window', 'add', 'id', config.id + ':window:add');
            this.set('window', 'add', 'height', addWinHeight);
            this.set('window', 'add', 'labelWidth', winLabelWidth);
            this.set('window', 'add', 'width', addWinWidth);
            this.set('grid', 'columns', specialColumns);
            return this;
        },
        /**
         * 获取事件
         * @param  {stirng} module    模块名
         * @param  {string} eventName 事件名
         * @return {string}           事件
         */
        getEvent: function (module, eventName) {
            return this.get('event', module, eventName);
        }
    };
    return Config;
    /*
    return {
        init: init,
        get: get,
        set: set,
        getId: getId,
    };*/
});