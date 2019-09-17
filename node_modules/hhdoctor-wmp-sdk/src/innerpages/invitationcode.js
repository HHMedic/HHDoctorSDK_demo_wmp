//const hostUtil = require('../utils/hostUtil.js');
var that;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    request: {},
    leg: 6, //输入框个数
    isFocus: true, //聚焦
    values: "", //输入的内容
    ispassword: false,
    num: 1,
    flag: false,
    errMsg: ''
  },

  /**
   * 页面事件
   */
  handleFocus(e) {
    var inputValue = e.detail.value;
    that.setData({
      values: inputValue
    })
    if (that.data.values.length === 6) {
      let url = getApp().globalData._hhSdkOptions._host.wmpHost + 'wmp/activationCode' +
        '?code=' + e.detail.value +
        '&userToken=' + that.data.request.userToken +
        '&sdkProductId=' + that.data.request.sdkProductId
      wx.showLoading({
        title: '激活中，请稍候...',
      })

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            wx.showModal({
              title: '提示',
              content: res.data.message ? res.data.message : '激活成功',
              showCancel: false,
              success: function() {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          } else {
            that.setData({
              flag: true,
              errMsg: res && res.data && res.data.message ? res.data.message : '输入错误，请检查后重新输入'
            })

          }
        }
      })
    } else {
      that.setData({
        flag: false
      })
    }

  },

  getHost() {
    return hostUtil.getHost(this.data.request.profileName, this.data.request.subDomain)
  },

  handleTap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  formSubmit(e) {
    //console.log(e.detail.value.code);
    //console.log(getApp(), "pppp")
  },

  onLoad: function(options) {
    that = this;
    if (!options || !options.sdkProductId || !options.userToken) {
      wx.navigateBack({
        delta: 1
      })
      return;
    }
    this.setData({
      request: options
    })
  }

})