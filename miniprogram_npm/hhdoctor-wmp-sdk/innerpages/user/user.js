Page({

    /**
     * 页面的初始数据
     */
    data: {
        isConnect: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options) {
            this.setData({
                hhRequest: options
            })
        }
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#424559'
        })
        wx.setNavigationBarTitle({
            title: '我的',
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.hideShareMenu();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let self = this;
        wx.getNetworkType({
            success: (res) => {
                if (res.networkType == 'none') {
                    self.setData({ isConnect: false })
                }
            }
        })
        wx.hideHomeButton()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () { },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () { },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () { },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () { },

    onLogout(e) {
        console.log(e)
        var pageUrl = '/pages/reg/reg?a=1';
        if (e && e.detail && e.detail.regParam) {
            pageUrl += ('&q=' + encodeURIComponent(e.detail.regParam));
        }
        if (e && e.detail && e.detail.extParam) {
            for (let key in e.detail.extParam) {
                pageUrl += ('&' + key + '=' + encodeURIComponent(e.detail.extParam[key]));
            }
        }
        wx.reLaunch({ url: pageUrl })
    },
    onLogoutFail() {
        wx.reLaunch({ url: 'pages/index/index' })
    }
})