/**
 * Ext.ux.grid.CRUD组件 Config-- Grid.CRUD.Config.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
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
        id = {
            grid: {
                'tbar_btn_delete': 'grid-tbar-btn-delete',
                'tbar_btn_add': 'grid-tbar-btn-add',
                'tbar_btn_refresh': 'grid-tbar-btn-refresh'
            },
            addWindow: {
                //Todo
            },
            editWindow: {
                //Todo
            }
        },
        tbarButtons =  [{
            id: id.grid.tbar_btn_add,
            text: '添加',
            iconCls: 'icon-add'
        }, {
            id: id.grid.tbar_btn_delete,
            text: '删除',
            iconCls: 'icon-delete',
            disabled: true
        }, {
            id: id.grid.tbar_btn_refresh,
            text: '刷新',
            iconCls: 'icon-refresh'
        }],
        EVENT = {
            VIEW: {
                ROW_DBL_CLICK: 'event_view_row_double_click'
            }
        },
        //文件类型
        FIELD_TYPE = {
            'string': Ext.form.TextField,
            'bigString': Ext.form.TextArea,
            'boolean': Ext.form.Checkbox,
            'date': Ext.form.DateField,
            'float': Ext.form.NumberField,
            'int': Ext.form.NumberField
        },
        originConfig, //未经过处理的原始用户的配置
        userConfig; //经过处理后的用户配置

    /**
     * 是不是对象
     */
    function isObject(a) {
        if (Object.prototype.toString.call(a).indexOf('Object') > 0) {
            return true;
        }
        return false;
    }
    /**
     * 获取配置项
     * @param  {String}  component [组件名称]
     * @param  {String} name [配置名]
     * @return {Object}      [结果]
     */
    function get() {
        var args = Array.prototype.slice.call(arguments),
            conf,
            component = args[0],
            name = args[1];
        if (args.length === 0) {
            return null;
        }
        conf = userConfig;
        for (var i = 0, len = args.length; i < len; i++) {
            conf = conf[args[i]];
            //如果参数多于实际的配置,返回null
            if (!isObject(conf) && i < len - 1) {
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
            field.name = col.dataIndex;
            //如果用户有定义类型 Type
            if (!!col.type) {
                field.type = col.type;
            }
            //如果用户有定义 dateFormat
            if (!!col.dateFormat) {
                field.dateFormat = col.dateFormat;
            }
            //字段的非空限制，在数据库为autoSave的时候可以避免表单自动提交
            field.allowBlank = col.allowBlank;
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
            var field = {};
            return {
                emptyText: col.emptyText,
                type: col.type,
                name: col.dataIndex,
                editable: col.editable,
                fieldLabel: col.fieldLabel || col.header,
                allowBlank: col.allowBlank
            };
        });
    }
    /**
     * 将obj中exception中的key值排除掉
     * @param  {Object} obj       待处理的对象
     * @param  {Array} exception  要排除的key数组
     * @return {Object}           需要处理的对象
     */
    function except(obj, exception) {
        var newObj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                //key值在排除项外，则可以获得
                if (exception.indexOf(obj) < 0) {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
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
            newCol = except(col, ['type']);
            if (!originConfig.editor || originConfig.editor === 'rowEditor'
                || originConfig.editor.add === 'rowEditor') {
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
    /**
     * 获取顶部工具栏的配置
     * @return {Object} 配置
     */
    function getTbarConfig() {
        return {
            items: tbarButtons
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
    function getAddEditWay(editor) {
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
        } else if (isObject(editor)) {
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
        var columns = conf.columns, col, storeConfig;

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
        var tbarConfig,
            mode, //组件加载数据的模式
            columns = config.columns;
        //组件加载数据的模式
        if (!!config.data) {
            mode = 'local';
        } else if (!!config.api) {
            mode = 'remote';
        }
        checkConfig(config);
        /* 将用户的配置转化为系统可用的配置 */
        tbarConfig = getTbarConfig();
        set('mode', mode);
        set('fieldType', FIELD_TYPE);
        set('store', 'reader', config.store);
        set('store','defaultData', getStoreDefaultData(columns));
        set('grid', 'tbar', tbarConfig);
        set('grid', 'addEditWay', getAddEditWay(config.editor));
        set('event', 'view', EVENT.VIEW);
        set('window', 'edit', 'fields', getWindowFieldConfig(columns));
        set('window', 'edit', 'id', config.id + ':window:edit');
        set('window', 'add', 'fields', getWindowFieldConfig(columns));
        set('window', 'add', 'id', config.id + ':window:add');

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
        getId: function (component, subComponent) {
            if (!component) {
                return null;
            }
            var idOfComponent = id[component],
                result = {};
            for(var key in idOfComponent) {
                var idConfig = key.split('_');// tbar_btn_delete 子模块_部件类型_动作
                if (idConfig[0] === subComponent) {
                    result[idConfig[2]] = idOfComponent[key];
                }
            }
            return result;
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
});