let hhSdk;
let app = getApp();
let self;
Page({

  /**
   * 页面的初始数据
   */
  data: {},

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
          }
        })
      })
      .catch(() => {
        console.error('视频医生登录失败')
      })

    hhSdk = this.selectComponent('#hhSdk');
  },

  //呼叫医生
  callDoctor(e) {
    var page = '../call/call' +
      '?sdkProductId=' + this.data.hhRequest.sdkProductId +
      '&profileName=' + this.data.hhRequest.profileName +
      '&userToken=' + this.data.hhRequest.userToken +
      '&openId=' + this.data.hhRequest.openId +
      '&dept=' + e.currentTarget.dataset.dept;
    wx.navigateTo({
      url: page,
    })
  },

  //查看购药订单
  viewDrugOrder() {
    hhSdk.navigateTo({
      page: 'drugOrder',
      drugOrderId: 'Y2019010123123123', //购药订单ID
      redirectPage: '/pages/index/index' //订单支付完成后跳转目的页面
    })
  },

  //查看购药订单列表
  viewDrugOrderList() {
    hhSdk.navigateTo({
      page: 'drugOrderList'
    })
  },
  //查看个人页面
  viewPersonal() {
    hhSdk.navigateTo({
      page: 'personalPage'
    })
  },
  //查看地址列表
  viewAddrList() {
    hhSdk.navigateTo({
      page: 'addressList'
    })
  },

  viewIm() {
    let page = `./im?profileName=${app.globalData.profileName}&sdkProductId=${app.globalData.sdkProductId}&userToken=${app.globalData.userToken}&openId=${app.globalData.openId}&callPage=../call/call`;
    wx.navigateTo({
      url: page,
    })
  }
})