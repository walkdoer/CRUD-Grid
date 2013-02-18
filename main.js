define(function (require,exports) {
    function onMenuClick(func) {
        return function (id, cls, title) {
            var mainPanel = Ext.getCmp('main-panel');
            var tab = mainPanel.getComponent('tab:' + id);
            if(tab) {
                mainPanel.setActiveTab(tab);
                return;
            }
            mainPanel.setActiveTab(mainPanel.add(func(id, cls, title)));
        };
    }

    window.on_menu_click$crud$general = function (id, cls, title) {
        console.log('menu click');
        Portal.data.loadPlugin('crud', '/crud.js', function (p) {
            console.log('plugin loaded');
            onMenuClick(p.init)(id, cls, title);
        });
    };
});