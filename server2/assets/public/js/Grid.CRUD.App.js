/**
 * Ext.ux.grid.CRUD组件 Controller层-- Grid.CRUD.Controller.js
 * zhangmhao@gmail.com
 * 2012-12-18 10:36:40
 */
define(function(require, exports) {
    /**
     * 组件的Controller层，协调Model层和View层
     *
     */
    'use strict';

    var _ = require('crud/public/js/Grid.CRUD.Common.js');
    var Model = require('crud/public/js/Grid.CRUD.Model.js'),
        config = require('crud/public/js/Grid.CRUD.Config.js'),
        View = require('crud/public/js/Grid.CRUD.View.js');
    //create namespace
    Ext.ns('Ext.ux.CRUD');
    Ext.ux.clone = function (o) {
        if (!o || 'object' !== typeof o) {
            return o;
        }
        if ('function' === typeof o.clone) {
            return o.clone();
        }
        var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
        var p, v;
        for (p in o) {
            if (o.hasOwnProperty(p)) {
                v = o[p];
                if (v && 'object' === typeof v) {
                    c[p] = Ext.ux.util.clone(v);
                }
                else {
                    c[p] = v;
                }
            }
        }
        return c;
    }; // eo function clone*/
    /*************************************************
     *----------------使用实例
      //Ext.uc.CRUD的使用方法如下：
        var gridPanel = new Ext.ux.CRUD({
            id: 'System:Module:SubModule',
            title: 'MyCrudPanel' ,
            //.... 其他配置项依旧类似于原生Grid配置
            //自定义的配置项
            api: {
                update: 'path/to/update',
                delete: 'path/to/delete',
                create: 'path/to/create',
                read: 'path/to/read'
            },
            toolbar: {
                searchBar: false,//不需要搜索框
                buttons: ['create', 'delete', 'refresh']
            }
        });
     *****************************************************/
    Ext.ux.CRUD = Ext.extend(Ext.Panel, {
        initComponent: function() {
            var that = this,
                reloadMethod; //store.reload() or store.loadData()
            if (!!that.data) {
                reloadMethod = 'loadData';
            } else if (!!that.api) {
                reloadMethod = 'reload';
            }
            this.layout = 'fit',
            Ext.ux.CRUD.superclass.initComponent.apply(this, arguments);
            //初始化配置模块
            this.initialConfig.app = this;
            config.init(this.initialConfig);
            //初始化数据库
            var model = new Model({
                storeId: 'mydata',
                data: this.data || this.api,
                reader: config.get('store', 'reader')
            });
            /**
             * 返回记录是否处于编辑状态
             * @param  {Ext.data.Record}  record 打开的记录
             * @return {Boolean}
             
            function isRecordEditing(record) {
                return !_.isEmpty(editingRecords[record.id]);
            }*/

            /**
             * 添加正在编辑的Record
             * @param {Ext.data.Record} record
             
            function addEditingRecord(record) {
                editingRecords[record.id] = record;
            }*/

            
            var buttonsBarConfig = config.get('grid', 'tbar', 'buttons'),
                searchBarConfig = config.get('grid', 'tbar', 'search', 'property'),
                pageConfig = config.get('grid', 'page');
            if (searchBarConfig) {
                searchBarConfig.id = config.getId('grid', 'tbar', 'search');
            }
            //取出所有btn
            if (buttonsBarConfig) {
                buttonsBarConfig.mIdList = config.getId('grid', 'tbar', 'buttons', 'btn');
                buttonsBarConfig.id = config.getId('grid', 'tbar', 'buttons');
            }
            
            //结合其他配置项构造翻页配置
            if (pageConfig) {
                pageConfig = _.extend({
                    store: model.getStore(),
                    pageSize: 20,
                    displayInfo: true,
                    prependButtons: true
                }, pageConfig);
            }
            

            var lowerCaseParam = config.get('grid', 'tbar', 'search', 'lowerCaseParam');
            var view = new View({
                event: config.get('event', 'view'), //View模块用到的事件
                buttonsBarConfig: buttonsBarConfig,//顶部工具拦的配置
                singleSelect: config.get('grid', 'singleSelect'),//checkbox
                pageToolbarConfig: pageConfig,
                initialParam: config.get('store', 'params'),
                searchBarConfig: searchBarConfig,
                idProperty: config.get('store', 'reader', 'idProperty'),// id字段
                defaultData: config.get('store', 'defaultData'),//Grid数据的默认构造
                window: config.get('window'),//窗口的配置
                mode: config.get('mode'),// local 或者 remote
                addEditWay: config.get('grid', 'addEditWay'),
                recordType: model.getStore().recordType //对RecordType的引用
            });
            //处理删除错误
            function handleErrorOrException(options, record, msg) {
                view.error(msg);
                var id, 
                    store = model.getStore();
                if (record.lastIndex === store.getTotalCount() - 1) {
                    id = store.getCount();
                } else {
                    id = record.lastIndex;
                }
                setTimeout(function () {
                    view.selectRow(id);
                    view.changeAllBtnStatu();
                }, 40);
            }
            //声明处理函数
            var successHandler = {
                create: function (store, action, result, res, rs) {
                    console.log('创建成功');
                    //如果用户选择了添加方式为窗口编辑 且 窗口已经打开
                    if (config.get('grid', 'addEditWay', 'add') === 'window' &&
                        view.isWindowOpen('add')) {
                        view.closeWindow('add');
                    }
                    view.changeAllBtnStatu();
                },
                delete: function (store, action, result, res, rs) {
                    var nextIndex,
                        index = rs.lastIndex,
                        count = store.getCount();
                    if (count === 0) {
                        view.changeAllBtnStatu();
                        return;
                    }
                    if (index === 0) {
                        nextIndex = 0;
                    } else if (index === count) {
                        nextIndex = index - 1;
                    } else {
                        nextIndex = index;
                    }
                    view.selectRow(nextIndex);
                    view.changeAllBtnStatu();
                },
                update: function (store, action, result, res, rs) {
                    //todo
                    console.log('更新成功');

                    var recordId = rs.get(config.get('store', 'reader', 'idProperty'));
                    //如果用户选择了更新方式为窗口编辑 且 窗口已经打开
                    if (config.get('grid', 'addEditWay', 'edit') === 'window' &&
                        view.isWindowOpen('edit', recordId)) {
                        view.closeWindow('edit', recordId);
                    }
                    view.changeAllBtnStatu();
                }
            }, errorHandler = {
                create: function (options, record, msg) {
                    view.error(msg);
                    console.log(options, record, msg);
                },
                delete: function (options, record, msg) {
                    handleErrorOrException(options, record, msg);
                },
                update: function (options, record, msg) {
                    record.reject();
                    view.error(msg);
                    console.log(options, record, msg);
                },
                read: function (options, record, msg) {
                    view.error(msg);
                    console.log(options, record, msg);
                }
            }, failHandler = {
                create: function (options, record, msg) {
                    view.error(msg);
                    console.log(options, record, msg);
                },
                delete: function (options, record, msg) {
                    handleErrorOrException(options, record, msg);
                },
                update: function (options, record, msg) {
                    record.reject();
                    view.error(msg);
                    console.log(options, record, msg);
                },
                read: function (options, record, msg) {
                    view.error(msg);
                    console.log(options, record, msg);
                }
            };
            model.on({
                'success': function (store, action, result, res, rs) {
                    //请求成功
                    successHandler[action](store, action, result, res, rs);
                },
                'fail': function (action, options, record, msg) {
                    //请求成功，只是返回一个失败的结果
                    failHandler[action](options, record, msg);
                },
                'error': function (action, options, record, msg) {
                    //请求失败404 500 或者 DataReader配置有错
                    errorHandler[action](options, record, msg);
                }
            });
            var idOfTbar = config.getId('grid', 'tbar', 'buttons', 'btn'),
                viewlisteners = {};
            
            viewlisteners[config.getEvent('view', 'ROW_DBL_CLICK')] = function (record) {
                var win;
                //如果是可编辑状态
                if (config.get('editable')) {
                    //使用Window进行编辑
                    if (config.get('grid', 'addEditWay', 'edit') === 'window') {
                        win = view.openEditWindow(record);
                    } else {
                        //mRowEditor 会自动启用,不需要做处理
                    }
                }
                that.fireEvent('edit', win, record);
            };
            //绑定处理函数
            if (buttonsBarConfig) {
                if (idOfTbar.sysadd) {
                    viewlisteners[idOfTbar.sysadd] = function () {
                        //添加
                        console.log('添加');
                        if (config.get('grid', 'addEditWay', 'add') === 'rowEditor') {
                            view.addRecord();
                        } else {
                            view.openAddWindow();
                        }
                    };
                }
                if (idOfTbar.sysrefresh) {
                    viewlisteners[idOfTbar.sysrefresh] = function () {
                        //刷新
                        console.log('刷新');
                        model.getStore()[reloadMethod](that.data);
                    };
                }
                if (idOfTbar.sysdelete) {
                    viewlisteners[idOfTbar.sysdelete] = function (btn, event, records) {
                        //记录
                        view.setBtnStatu('sysdelete', false);
                        model.getStore().remove(records);
                    };
                }
                (function (btns) {
                    for (var i = 0, len = btns.length; i < len; i++) {
                        var btn = btns[i];
                        if (btns[i].belongToUser) {
                            viewlisteners[btn.id] = function (btn, event, records, data, process) {
                                process(that, records, data);
                            };
                        }
                    }
                })(buttonsBarConfig.items);
            }
            viewlisteners[config.getEvent('view', 'SAVE_RECORD')] = function (record, fieldValues) {
                model.saveRecord(record);
            };
            viewlisteners[config.getEvent('view', 'WINDOW_SHOW')] = function (win, record) {
                console.info('select editing record after edit window show.');
                view.selectRow(record.store.indexOf(record));
            };
            viewlisteners[config.getEvent('view', 'SAVE_RECORD_OF_ROWEDITOR')] = function () {
                model.saveRecord();
            };
            viewlisteners[config.getEvent('view', 'UPDATE_RECORD')] = function (record, fieldValues) {
                console.log('UPDATE_RECORD');
                model.updateRecord(record, fieldValues);
            };
            viewlisteners[config.getEvent('view', 'LOAD_DATA')] = function () {
                var store = model.getStore(),
                    paramsNew,
                    params = config.get('store', 'params');
                if (!params) { params = {}; }
                params.limit = config.get('grid', 'page', 'pageSize');
                if (params.limit !== undefined) {
                    params.start = 0;
                }
                if (lowerCaseParam) {
                    paramsNew = _.lowerCaseObjectKey(params);
                } else {
                    paramsNew = params;
                }
                setBaseParam(store, paramsNew);
                store.load();
            };
            viewlisteners[config.getEvent('view', 'SEARCH')] = function (params) {
                console.log('======搜索....========');
                var paramsNew;
                if (lowerCaseParam) {
                    paramsNew = _.lowerCaseObjectKey(params);
                } else {
                    paramsNew = params;
                }
                setBaseParam(model.getStore(), paramsNew);
                model.getStore().load();
            };
            console.log("####bindListener处理函数");
            view.on(viewlisteners);
            //初始化界面
            var grid = view.init({
                id: this.id,
                store: model.getStore(),
                columns: config.get('grid', 'columns'),
                noClicksToEdit: config.get('grid', 'noClicksToEdit')
            });
            
            this.add(grid);

            /**
             * 设置BaseParam
             * @param {Ext.data.Store} store  
             * @param {Object}         params 参数
             */
            function setBaseParam(store, params) {
                if (!params) { return; }
                for (var key in params) {
                    store.setBaseParam(key, params[key]);
                }
            }

            /**
             * 更新记录
             * @param  {Object} obj 需要更新的数据
             * @return {Boolean} 更新成功与否     
             */
            this.updateRecord = function (obj, params, success, error) {
                if (!obj) {
                    return false;
                }
                //取出要更新的记录
                var record = view.getCurrentRecord();
                model.updateRecord(record, obj, params, success, error);
            };
            this.getSelectRecord = function () {
                return view.getCurrentRecord();
            };
            this.alert =  function (msg) {
                view.alert(msg);
            };
            this.info = function (msg) {
                view.info(msg);
            };
            this.error = function (msg) {
                view.error(msg);
            };
            this.reload = function () {
                model.getStore().reload();
            };
            this.getGridPanel = function () {
                return grid;
            };
            this.getWindowField = function (id, winType) {
                return view.getWindowField(id, winType);
            };
        }
    });
});

/**
 * 日志的规范 [组建名][组件类型][日志内容][备注]
 */
