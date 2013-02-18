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
        systemConfig = {},
        userConfig;
    /**
     * 获取配置项
     * @param  {String}  component [组件名称]
     * @param  {String} name [配置名]
     * @return {Object}      [结果]
     */
    function get(component, name) {
        return userConfig[name];
    }

    /**
     * 设置配置项
     * @param  {String} name [配置名]
     * @param  {Object}      [Value]
     */
    function set(name, val) {
        userConfig[name] = val;
    }
    /**
     * 初始化用户配置
     * @param  {object} config [用户配置]
     */
    function init(config) {
        userConfig = config;
        var buttonsConf = userConfig.buttons,
            gridConf = userConfig.grid,
            windowsConf = userConfig.windows,
            toolbarConf = userConfig.toolbar;
        /* 将用户的配置转化为系统可用的配置 */
        //Buttons
        for (var i = 0; i < buttonsConf.length; i++) {
            var conf = buttonsConf[i];
            console.log(conf.type, conf.handler);
            systemConfig.buttons.push({
                text: conf.text || defaultConfig.buttons[conf.type].text,
                handler: conf.handler
            });
        }
        //Grid
        //Window
        //Store
        //Toolbar
    }
    return {
        init: init,
        get: get,
        set: set,
    };
});