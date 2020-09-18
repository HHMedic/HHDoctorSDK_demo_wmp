// components/view.js
var that;
var url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //viewSrc: ''
    url: '',
    isConnect: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.url) {
      url = decodeURIComponent(options.url);
      console.log('url', url)
      this.setData({
        viewSrc: url || ''
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
    wx.hideHomeButton()
    wx.hideShareMenu()
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
    this.setData({ isConnect: getApp().globalData.isConnect })
    console.log(url);

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})