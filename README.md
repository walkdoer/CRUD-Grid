##Portal快速开发插件
================
###功能介绍：

######开发过程遇到的问题
+ 使用Ext开发Portal的的你，有没有发现一个后台的代码都是重复机械性的。如何将复制黏贴的工作mute掉，减少开发过程中的痛苦呢？
+ 你是不是踩过无数Ext的坑呢，有没有想过把这些坑填上？

主要功能：东西就是简化Ext开发，加快开发进度，提高幸福感


###使用例子：

#####Demo1:  

    var gridPanel = new Ext.ux.CRUD({
        id: 'tab' + id,
        title: title,
        closable: true,//配置可以关闭
        api: {
            update: Portal.data.proxyUrl('crud:category:update'),
            create: Portal.data.proxyUrl('crud:category:create'),
            delete: Portal.data.proxyUrl('crud:category:delete'),
            read: Portal.data.proxyUrl('crud:category:read')
        },
        store: {idProperty: '_id'},
        search: {property: ['type']},
        mButtons: ['add', 'delete', 'refresh'],
        mColumns: [{
            id: 'id',
            type: 'string',
            mEdit: false,
            dataIndex: '_id',
            editable: false
        }, {
            id: 'name',
            type: 'string',
            header: '分类名称',
            fieldLabel: '标题',
            sortable: true,
            allowBlank: false,
            width: 180,
            dataIndex: 'name'
        }, {
            id: 'post_date',
            header   : '更新日期',
            mEdit: false,
            allowBlank: true,
            type     : 'date',
            width    : 85,
            sortable : true,
            dataIndex: 'post_date'
        }, {
            id: 'type',
            header: '任务类型',
            fieldLabel: '类型',
            type: 'enum',
            mUrl: Portal.data.proxyUrl('crud:category:read'),
            displayField: 'name',
            valueField: '_id',
            hidden: true
        }]
    });
    
`试一试，你就知道这么多的代码， 如果用Ext来重头实现同样的功能，需要多少的代码量`
