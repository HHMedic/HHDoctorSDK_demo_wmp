// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      hhRequest: {
        profileName: 'test',   //test:测试环境,   prod:生产环境
        sdkProductId: 9003,    //已分配的产品id
        userToken: 'E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF',   //服务器注册用户接口返回的userToken
        openId: 'oirIW0Rc9lRBp3PyfCyxis123JR0',    //用户微信openId
        callPage: '../call/call',
        style: {
          navBarBg: '#ffffff', //标题栏背景色
          navBarFg: '#000000', //标题栏字体颜色
          pageTitle: '视频医生' //顶部标题
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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

  },
  onLogin(e) {
    console.log('登录事件,', JSON.stringify(e));
  },
})
