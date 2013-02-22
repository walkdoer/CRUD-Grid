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
        tbarButtons =  [{
            id: 'tbar-btn-add',
            text: '添加',
            iconCls: 'icon-add'
        }, {
            id: 'tbar-btn-delete',
            text: '删除',
            iconCls: 'icon-delete',
            disabled: true
        }, {
            id: 'tbar-btn-refresh',
            text: '刷新',
            iconCls: 'icon-refresh'
        }],
        systemConfig = {},
        userConfig;
    /**
     * 获取配置项
     * @param  {String}  component [组件名称]
     * @param  {String} name [配置名]
     * @return {Object}      [结果]
     */
    function get(component, name) {
        if (userConfig[component]) {
            return userConfig[component][name];
        }
        
    }

    /**
     * 设置配置项
     * @param  {String} name [配置名]
     * @param  {Object}      [Value]
     */
    function set(component, name, val) {
        if (userConfig[component] === undefined) {
            userConfig[component] = {};
        }
        userConfig[component][name] = val;
    }

    function getStoreField(columns) {
        var col, field, storeField = [];
        for (var i = 0, len = columns.length; i < len; i++) {
            col = columns[i];
            if (!col.dataIndex) {
                continue;
            }
            field = {};
            field.name = col.dataIndex;
            //如果用户有定义类型 Type
            if (!!col.type) {
                field.type = col.type;
            }
            //如果用户有定义 dateFormat
            if (!!col.dateFormat) {
                field.dateFormat = col.dateFormat;
            }
            storeField.push(field);
        }
        return storeField;
    }

    function getTbarConfig() {
        return {
            items: tbarButtons
        };
    }
    /**
     * 初始化用户配置
     * @param  {object} config [用户配置]
     */
    function init(config) {
        //初始化config
        userConfig = {};
        var storeField,
            tbarConfig,
            columns = config.columns;
        

        /* 将用户的配置转化为系统可用的配置 */
        //从column配置中取得Store的字段配置
        storeField = getStoreField(columns);
        tbarConfig = getTbarConfig();
        set('store','fields', storeField);
        set('grid', 'tbar', tbarConfig);
        //Buttons
        /*
        for (var i = 0; i < buttonsConf.length; i++) {
            var conf = buttonsConf[i];
            console.log(conf.type, conf.handler);
            systemConfig.buttons.push({
                text: conf.text || defaultConfig.buttons[conf.type].text,
                handler: conf.handler
            });
        }*/
        //Grid
        //Window
        //Store
        //Toolbar
        
    }
    return {
        init: init,
        get: get,
        set: set
    };
});