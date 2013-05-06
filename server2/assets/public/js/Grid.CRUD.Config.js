/**
 * Ext.ux.grid.CRUD组件 Config-- Grid.CRUD.Config.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
    'use strict';
    var _ = require('diwali/scripts/Grid.CRUD.Common.js');
    /**
     * Config模块
     */
    var defaultConfig = {
            buttons: {
                refresh: {
                    text: '刷新'
                },
                create: {
                    text: '添加'
                },
                delete: {
                    text: '删除'
                },
                update: {
                    text: '修改'
                }
            }
        },
        ID = null,
        systemName = '',
        defaultButtons = null,
        tbarButtons = null,
        EVENT = {
            VIEW: {
                ROW_DBL_CLICK: 'event_view_row_double_click',
                SAVE_RECORD: 'event_view_save_record',
                SEARCH: 'event_view_search_record',
                UPDATE_RECORD: 'event_view_update_record',
                LOAD_DATA: 'event_view_load_data',
                SAVE_RECORD_OF_ROWEDITOR: 'event_view_save_record_of_roweditor'
            }
        },
        //文件类型
        FIELD_TYPE = _.FIELD_TYPE,
        FONT_WIDTH = _.FONT_WIDTH,
        WIN_HEIGHT_SPAN = _.WIN_HEIGHT_SPAN,
        WIN_SPAN = _.WIN_SPAN,
        originConfig, //未经过处理的原始用户的配置
        userConfig; //经过处理后的用户配置
    

    /**
     * 初始化参数, 该函数对用户的参数进行预处理
     * @param  {String} systemName 组件ID
     */
    function initArgs(conf) {
        systemName = conf.id;
        conf.mEditable = conf.mEditable === undefined ? true : conf.mEditable;
        ID = {
            grid: {
                //默认自带的删除，添加，刷新按钮
                'tbar_buttons_btn_sysdelete': systemName + '-grid-tbar-btn-system-delete',
                'tbar_buttons_btn_sysadd': systemName + '-grid-tbar-btn-system-add',
                'tbar_buttons_btn_sysrefresh': systemName + '-grid-tbar-btn-system-refresh'
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
            setId('grid', 'tbar', 'buttons', 'btn', conf.mButtons[i].id,//ID保存的位置
                systemName + '-grid-tbar-buttons-btn-' + conf.mButtons[i].id);//ID的值
        }
        
        if (!defaultButtons) {
            defaultButtons = {
                add: {
                    id: ID.grid.tbar_btn_sysadd,
                    text: '添加',
                    iconCls: 'icon-add'
                },
                delete: {
                    id: ID.grid.tbar_btn_sysdelete,
                    text: '删除',
                    iconCls: 'icon-delete',
                    disabled: true
                },
                refresh: {
                    id: ID.grid.tbar_btn_sysrefresh,
                    text: '刷新',
                    iconCls: 'icon-refresh'
                }
            };
        }
        if (conf.search && _.isArray(conf.search)) {
            var property = conf.search;
            conf.search = {
                lowerCaseParam: false,
                property: property
            };
        }
    }

    function getFieldLabelWidth (columnsConfig) {
        var col, maxWidth = 0, width;
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            if (col.editable && col.fieldLabel) {
                width = FONT_WIDTH * col.fieldLabel.length;
                if (width > maxWidth) {
                    maxWidth = width;
                }
            }
        }
        return maxWidth;
    }
    /**
     * 获得窗口的高度
     * @return {Int} Height
     */
    function getWindowHeight(columnsConfig) {
        var col, height = 0;
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            if (col.editable) {
                if (col.height) {
                    height += col.height;
                } else {
                    height += 26;
                }
            }
        }
        return height + WIN_HEIGHT_SPAN;
    }

    /**
     * 获得窗口的宽度
     * @return {Int} Height
     */
    function getWindowWidth(columnsConfig) {
        var col, maxWidth = 0;
        for (var i = 0; i < columnsConfig.length; i++) {
            col = columnsConfig[i];
            if (col.editable) {
                if (col.width && col.width > maxWidth) {
                    maxWidth = col.width;
                }
            }
        }
        return maxWidth + WIN_SPAN + getFieldLabelWidth(columnsConfig);
    }

    function setId() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length <= 1) { return; }
        var idOfComponent = ID[args.shift()],
            value = args.splice(args.length - 1, 1)[0],
            key = args.join('_');
        idOfComponent[key] = value;
    }
    /**
     * [getId description]
     * @return {[type]} [description]
     */
    function getId() {
        var args = Array.prototype.slice.call(arguments),
            idOfComponent = ID[args[0]],//组件的ID列表，如Grid
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
                console.log(realkey[realkey.length - 1], idOfComponent[key]);
            }
        }
        return result;
    }
    /**
     * 获取配置项
     * @param  {String}  component [组件名称]
     * @param  {String} name [配置名]
     * @return {Object}      [结果]
     */
    function get() {
        var args = Array.prototype.slice.call(arguments),
            conf;
        if (args.length === 0) {
            return null;
        }
        conf = userConfig;
        for (var i = 0, len = args.length; i < len; i++) {
            conf = conf[args[i]];
            //如果参数多于实际的配置,返回null
            if (!_.isObject(conf) && i < len - 1) {
                console.log('[Grid.CRUD.Config]没有该参数');
                return null;
            }
        }
        return conf;
    }

    /**
     * 设置配置项
     * @param  {String} name 配置名
     * @param  {Object}      Value
     */
    function set() {
        var args = Array.prototype.slice.call(arguments),
            conf;
        if (args.length === 1) {
            throw '[Grid.CRUD.Config] function set () : set  without value.';//出错
        } else if (args.length > 1) {
            conf = userConfig;
            for (var i = 0; i < args.length - 2; i++) {
                if (!conf[args[i]]) {
                    conf[args[i]] = {};
                }
                conf = conf[args[i]];
            }
            conf[args[i]] = args[i + 1];
        }
    }
    /**
     * 获取数据库的字段配置
     * @param  {Array} columns 用户的字段配置
     * @return {Array}         符合Ext规范的字段配置
     */
    function getStoreField(columns) {
        return getConfigFromColumn(columns, function (col) {
            var field = {};
            field.name = col.id;
            //如果用户有定义类型 Type
            if (!!col.type) {
                field.type = col.type;
            }
            //如果用户有定义 dateFormat
            if (!!col.dateFormat) {
                field.dateFormat = col.dateFormat;
            }
            //字段的非空限制，在数据库为autoSave的时候可以避免表单自动提交
            field.mapping = col.dataIndex;
            field.allowBlank = (col.allowBlank === undefined || col.allowBlank === null) ? true : col.allowBlank;
            console.dir(field);
            return field;
        });
    }
    /**
     * 通过filter从columns配置中提取配置项
     * @param  {Funtion} filter 过滤器
     * @return {Object}         结果
     */
    function getConfigFromColumn(columns, filter) {
        var col, field, fields = [];
        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            if (!col.dataIndex) {
                continue;
            }
            field = filter(col);
            fields.push(field);
        }
        return fields;
    }
    function getWindowFieldConfig(columns) {
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
                'header'
            ]);
            config.id = ':window:field:' + config.id;
            config.fieldLabel = col.fieldLabel || col.header;
            config.enableKeyEvents = true;
            return config;
        });
    }
    
    /**
     * 获取Grid的栏目配置
     * @param  {Array} columns 用户的Column配置
     * @return {Array}         处理过后的用户配置
     */
    function getColumnsConfig(columns) {
        var columnConfig = [], col, newCol;
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            //没有header就是不进行处理
            if (!col.header) { continue; }
            newCol = _.except(col, ['type']);
            if (!originConfig.mEditor || originConfig.mEditor === 'rowEditor'
                || originConfig.mEditor.add === 'rowEditor') {
                //生成编辑器
                if (!FIELD_TYPE[col.type]) {
                    throw '[Grid.CRUD.Config] function getColumnsConfig () : ' + col.id + '字段的类型' + col.type + '不合法.';//出错
                }
                if (col.editable) {
                    newCol.editor = new FIELD_TYPE[col.type]({
                        name: newCol.dataIndex,
                        allowBlank: newCol.allowBlank,
                        disabled: newCol.disabled,
                        hidden: newCol.hidden
                    });
                }
            }
            columnConfig.push(newCol);
        }
        return columnConfig;
    }

    function getStoreDefaultData(columns) {
        var defaultData = {}, col;
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            defaultData[col.dataIndex] = col.defaultData || '';
        }
        return defaultData;
    }

    function getColumnById(id, columns) {
        var i = 0, length = columns.length;
        while (i < length) {
            if (columns[i].id === id) {
                return columns[i];
            }
            i++;
        }
        return null;
    }
    /**
     * 获取顶部工具栏的配置
     * @return {Object} 配置
     */
    function getTbarConfig(config) {
        /*if (!!tbarButtons) {
            console.log("顶部工具按钮初始化");
            return {
                items: tbarButtons
            };
        }*/
        console.log("初始化顶部工具按钮");
        tbarButtons = [];
        var buttons = config.mButtons, btn, btnName;
        if (!config.mButtons) { return null; }
        for (var i = 0; i < buttons.length; i++) {
            btn = buttons[i];
            if (typeof btn === 'string') {
                btnName = btn;
                btn = defaultButtons[btnName];
                if (!!btn) {
                    btn.id = getId('grid', 'tbar', 'buttons', 'btn', 'sys' + btnName);
                    tbarButtons.push(btn);
                }
            } else {
                btn.id = getId('grid', 'tbar', 'buttons', 'btn', btn.id);
                btn.belongToUser = true;
                tbarButtons.push(btn);
            }
        }
        return {
            items: tbarButtons
        };
    }
    /**
     * 获取搜索栏目配置
     * @param  {Object} searchConfig [搜索的用户配置]
     * @param  {Object} ColumnConfig [字段的属性，需要根据字段的属性来生
     *                                成不同的编辑类型Combobox,NumberField]
     * @return {Object}              [配置]
     */
    function getSearchBarConfig(searchConfig, columnConfig) {
        if (columnConfig.length === 0) { return null; }
        var field, column, searchCondition, items = [];
        var property = searchConfig.property;
        //配置只能是数组
        if (!_.isArray(property)) {
            property = [].concat(property);
        }
        for (var i = 0; i < property.length; i++) {
            (function (column) {
                searchCondition = property[i];
                column = getColumnById(searchCondition, columnConfig);
                if (!column) { return; }
                items.push(column.fieldLabel, ' ');
                var id = systemName + ':grid:searchbar:' + column.id;
                if (column.type === 'enum') {
                    var mode = '';
                    if (column.mLocalData) {
                        mode = 'local';
                    } else if (column.mStore) {
                        mode = 'remote';
                    }
                    var selectPos = 0, param = get('store', 'params'), pos = 0;
                    if (param) {
                        column.mLocalData.each(function (record) {
                            if (parseInt(record.get(column.id), 10) === param[column.id]) {
                                selectPos = pos;
                            }
                            pos += 1;
                        });
                    }
                    field = new FIELD_TYPE[column.type]({
                        id: id,
                        fieldLabel: column.fieldLabel,
                        store: column.mLocalData || column.mStore, //direct array data
                        typeAhead: true,
                        triggerAction: 'all',
                        width: column.width,
                        mode: mode,
                        emptyText: column.emptyText,
                        valueField: column.valueField || column.dataIndex || column.id,
                        displayField: column.displayField === undefined ? 'displayText'
                                                                : column.displayField,
                        editable: column.editable === undefined ? false
                                                        : column.editable,
                        valueNotFoundText: column.valueNotFoundText === undefined ? '没有该选项'
                                                                        : column.valueNotFoundText,
                        forceSelection: true,
                        selectOnFocus: true,
                        allowBlank: column.allowBlank,
                        listeners: {
                            afterrender: function (combo) {
                                var record = combo.store.getAt(selectPos);
                                if (record) {
                                    combo.setValue(record.data[column.id]);
                                }
                            },
                            select: function (combo, record, index) {
                                console.log(record, index);
                            }
                        }
                    });
                } else {
                    //排除掉不需要的属性
                    var conf = _.except(column, [
                        'type',
                        'sortable',
                        'header',
                        'editable',
                        'dataIndex'
                    ]);
                    conf.id = id;
                    console.dir(conf);
                    field = new FIELD_TYPE[column.type](conf);
                }
                items.push(field, ' ');
            })(column);
        }
        return {
            items: items
        };
    }

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
    function getAddEditWay(editable, editor) {
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
    }
    /**
     * 检查配置的合法性,不合法的进行修复
     * @param  {Object} conf 配置
     */
    function checkConfig (conf) {
        var columns = conf.mColumns, col, storeConfig;

        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            //用户没有配置字段的可编辑限制，则默认为可编辑
            if (typeof col.editable !== 'boolean') {
                col.editable = true;
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
    }
    /**
     * 初始化用户配置
     * @param  {object} config 用户配置
     */
    function init(config) {
        //初始化config
        userConfig = {};
        originConfig = config;
        //初始化系统参数
        initArgs(config);
        var tbarConfig,
            mode, //组件加载数据的模式
            columns = config.mColumns;
        //组件加载数据的模式
        if (!!config.data) {
            mode = 'local';
        } else if (!!config.api) {
            mode = 'remote';
        }
        checkConfig(config);
        /* 将用户的配置转化为系统可用的配置 */
        tbarConfig = getTbarConfig(config);
        set('mode', mode);
        set('editable', config.mEditable),
        set('origin', originConfig);
        set('store', 'params', config.store.mInitParams);
        set('store', 'reader', config.store);
        set('store', 'defaultData', getStoreDefaultData(columns));
        
        if (config.search) {
            set('grid', 'tbar', 'search', 'property', getSearchBarConfig(config.search, columns));
            setId('grid', 'tbar', 'search', systemName + '-grid-tbar-search');
            set('grid', 'tbar', 'search', 'lowerCaseParam', config.search.lowerCaseParam);
        }
        if (config.mButtons) {
            set('grid', 'tbar', 'buttons', tbarConfig);
            setId('grid', 'tbar', 'buttons', systemName + 'grid-tbar-buttons');
        }
        var winHeight = getWindowHeight(columns),
            winLabelWidth = getFieldLabelWidth(columns),
            winWidth = getWindowWidth(columns);

        set('grid', 'page', config.page);
        set('grid', 'addEditWay', getAddEditWay(config.mEditable, config.mEditor));
        set('event', 'view', EVENT.VIEW);
        set('window', 'edit', 'fields', getWindowFieldConfig(columns));
        set('window', 'edit', 'id', config.id + ':window:edit');
        set('window', 'edit', 'height', winHeight);
        set('window', 'edit', 'width', winWidth);
        set('window', 'edit', 'labelWidth', winLabelWidth);
        set('window', 'add', 'fields', getWindowFieldConfig(columns));
        set('window', 'add', 'id', config.id + ':window:add');
        set('window', 'add', 'height', winHeight);
        set('window', 'add', 'labelWidth', winLabelWidth);
        set('window', 'add', 'width', winWidth);

        /************ Buttons *************/
        /*
        for (var i = 0; i < buttonsConf.length; i++) {
            var conf = buttonsConf[i];
            console.log(conf.type, conf.handler);
            systemConfig.buttons.push({
                text: conf.text || defaultConfig.buttons[conf.type].text,
                handler: conf.handler
            });
        }*/
        /************ Grid *************/
        set('grid', 'columns', getColumnsConfig(columns));
        /************ Window *************/
        /************ Store *************/
        /************ Toolbar *************/
    }
    return {
        init: init,
        get: get,
        set: set,
        getId: getId,
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
});