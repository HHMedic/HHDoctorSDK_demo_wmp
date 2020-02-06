// pages/index/index.js
let app = getApp();
let self;
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
    self = this;
    app.hhDoctorLogin()
      .then(() => {
        self.setData({
          hhRequest: {
            profileName: app.globalData.profileName, //test:测试环境,   prod:生产环境
            sdkProductId: app.globalData.sdkProductId, //已分配的产品sdkProductId
            userToken: app.globalData.userToken, //服务器注册用户接口返回的userToken
            openId: app.globalData.openId, //用户微信openId
            callPage: '../call/call',
            style: {
              navigationBar: {
                bColor: '#ffffff', //标题栏背景色，默认:#000000
                fColor: '#000000', //标题栏前景色，默认:#ffffff
                text: '视频医生DEMO' //标题栏文字，默认：视频医生
              }
            }
          }
        })
      })
      .catch(() => {
        console.error('视频医生登录失败')
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