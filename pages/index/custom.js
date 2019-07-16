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
        //userToken: 'D63D59446748D9CA1C96264FA7DA17C73F0D04F68EA2608F6783B874E4F50EEF',
        //openId: 'oSNYc5PotGld1r5JYUKiyKXmHRhs',
        userToken: 'D39F766DEF30F91D7A141E60522E78B0CCCB578FFE9820E7F43A1807648A85D9',
        openId: 'oirIW0Rc9lRBp3PyfCyxis455JR0',
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

  viewPersonal() {
    hhSdk.navigateTo({
      page: 'personalPage'
    })
  },

  viewIm() {
    var page = './im?profileName=test&sdkProductId=9003&userToken=E6E6E880BB3AD4A1D8B31FE763B6ADEB3F0D04F68EA2608F6783B874E4F50EEF&openId=oirIW0Rc9lRBp3PyfCyxis123JR0&callPage=../call/call';
    wx.navigateTo({
      url: page,
    })
  }
})