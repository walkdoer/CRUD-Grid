define(function (require,exports) {
    'use strict';
    function onMenuClick(func) {
        return function (id, cls, title) {
            var mainPanel = Ext.getCmp('main-panel');
            var tab = mainPanel.getComponent('tab:' + id);
            if (tab) {
                mainPanel.setActiveTab(tab);
                return;
            }
            mainPanel.setActiveTab(mainPanel.add(func(id, cls, title)));
        };
    }

    window.on_menu_click$crud = function () {

    };

    window.on_menu_click$crud$todo = function (id, cls, title) {
        console.log('menu click');
        Portal.data.loadPlugin('crud', '/public/js/crud.js', function (p) {
            console.log('plugin loaded');
            onMenuClick(p.init)(id, cls, title);
        });
    };

    window.on_menu_click$crud$category = function (id, cls, title) {
        console.log('menu click');
        Portal.data.loadPlugin('crud', '/public/js/category.js', function (p) {
            console.log('plugin loaded');
            onMenuClick(p.init)(id, cls, title);
        });
    };
    window.on_menu_click$crud$subCate = function (id, cls, title) {
        console.log('menu click');
        Portal.data.loadPlugin('crud', '/public/js/subCate.js', function (p) {
            console.log('plugin loaded');
            onMenuClick(p.init)(id, cls, title);
        });
    };
});