// components/user-equity/user-equity.js
const hhBehaviors = require('../hhBehaviors.js');
Component({
    /**
     * 组件的属性列表
     */
    behaviors: [hhBehaviors],
    properties: {
        product:Object
    },
    lifetimes: {
        attached() {
            this.setData({productRightsList:this.data.product.productRightsList.slice(0,7)})
        }
    },


    /**
     * 组件的初始数据
     */
    data: {
        productRightsList:[],
        url:'',
        moreIcon:'data:image/png;base64,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',
        // url:'https://test.hh-medic.com/hhmy/quanyi/quanyi.html?UserToken=D41DFA8C076A4C03AB2BF7AA509367FE3F0D04F68EA2608F6783B874E4F50EEF',
        list:[
            {name:'视频医生',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-13.png'},
            {name:'专家服务',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-11.png'},
            {name:'心理咨询',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-10.png'},
            {name:'送药到家',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-12.png'},
            {name:'线下护理',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-09.png'},
            {name:'专属助理',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-05.png'},
            {name:'挂号服务',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-14.png'},
            {name:'更多权益',url:'https://imgs.hh-medic.com/icon/wmp/icon-right-c-15.png'}
        ]

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
