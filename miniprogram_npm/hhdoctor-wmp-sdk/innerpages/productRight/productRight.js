// components/innerpages/productRight.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isConnect:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#424559'
    })
    wx.setNavigationBarTitle({
      title: '会员',
    })
    if (options) {
      this.setData({
        hhRequest: options
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
      let self = this;
      wx.getNetworkType({
        success: (res) => {
          if(res.networkType=='none'){
            self.setData({ isConnect: false})
          }
        }
      })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})