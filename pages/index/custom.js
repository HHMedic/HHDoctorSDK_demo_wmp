var hhSdk;
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
        sdkProductId: 9003,
        userToken: 'D63D59446748D9CA1C96264FA7DA17C73F0D04F68EA2608F6783B874E4F50EEF',
        openId: 'oSNYc5PotGld1r5JYUKiyKXmHRhs'
      }
    })
    hhSdk = this.selectComponent('#hhSdk');
  },

  //呼叫医生
  callDoctor(e) {
    var page = '../call/call' +
      '?sdkProductId=' + this.data.hhRequest.sdkProductId +
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

  viewPersonal() {
    hhSdk.navigateTo({
      page: 'personalPage'
    })
  }
})