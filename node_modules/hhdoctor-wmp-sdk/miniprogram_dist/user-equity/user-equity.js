Component({
    behaviors: [require('../behaviors/hhStarter'), require('../behaviors/hhNavigator'),],
    properties: {
        product: Object,
    },
    lifetimes: {
        attached() {
            this.setData({ productRightsList: this.data.product.productRightsList.slice(0, 7) })
        }
    },
    data: {
        productRightsList: [],
        url: '',
        moreIcon: 'https://public.hh-medic.com/app/seeMoreRights.png',
        // url:'https://test.hh-medic.com/hhmy/quanyi/quanyi.html?UserToken=D41DFA8C076A4C03AB2BF7AA509367FE3F0D04F68EA2608F6783B874E4F50EEF',
        list: [
            { name: '视频医生', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-13.png' },
            { name: '专家服务', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-11.png' },
            { name: '心理咨询', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-10.png' },
            { name: '送药到家', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-12.png' },
            { name: '线下护理', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-09.png' },
            { name: '专属助理', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-05.png' },
            { name: '挂号服务', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-14.png' },
            { name: '更多权益', url: 'https://imgs.hh-medic.com/icon/wmp/icon-right-c-15.png' }
        ]

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
