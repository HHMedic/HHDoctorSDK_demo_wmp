var hhSdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      hhRequest: {
        profileName: 'test',
        sdkProductId: 9003,
        userToken: 'E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF',
        openId: 'oSNYc5PotGld1r5JYUKiyKXmHRhs'
      }
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
    var page = './im?profileName=test&sdkProductId=9003&userToken=E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF&openId=oirIW0Rc9lRBp3PyfCyxis123JR0&callPage=../call/call';
    wx.navigateTo({
      url: page,
    })
  }
})