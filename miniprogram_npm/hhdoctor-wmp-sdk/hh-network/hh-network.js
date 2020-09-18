// components/hh-network/hh-network.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindReload() {
            let self = this;
            wx.getNetworkType({
                success: function (res) {
                    if (res.networkType == 'none') {
                        wx.showToast({
                            title: '当前网络不可用，建议您检查网络后再试',
                            icon: 'none'
                        })
                    } else {
                        getApp().globalData.isConnect = true;
                        let pages = getCurrentPages();
                        let params = '';
                        let obj = pages[pages.length - 1].options;
                        Object.keys(obj).forEach(function (key) {
                            if (obj[key]) {
                                params += `${key}=${obj[key]}&`;
                            }
                        });
                        wx.redirectTo({
                            url: '/' + pages[pages.length - 1].route + '?' + params
                        })
                    }
                }
            });

        }
    }
})
