//const hostUtil = require('../utils/hostUtil.js');
var that;
const hhDoctor = require('../../hhDoctor.js');


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
    errMsg: '',
    keyboardOptions: {
      maxLength: 6
    },
    isConnect: true
  },
  /**
   * 页面事件
   */
  handleFocus(e) {
    console.log(e)
    that.setData({
      values: e.detail.text
    })
    that.active()
  },

  active(clipboard) {
    that.setData({ errMsg: '' })
    if (that.data.values.length === 6) {
      let url = getApp().globalData._hhSdkOptions._host.wmpHost + 'wmp/activationCode' +
        '?code=' + that.data.values +
        '&userToken=' + that.data.request.userToken +
        '&sdkProductId=' + that.data.request.sdkProductId
      wx.showLoading({
        title: '激活中，请稍候...',
      })

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            if (clipboard) wx.setClipboardData({ data: '' })
            wx.showModal({
              title: '提示',
              content: res.data.message ? res.data.message : '激活成功',
              showCancel: false,
              success: function () {
                hhDoctor.getUserInfo().then(res => {
                  wx.navigateBack({
                    delta: 1
                  });
                });
              }
            })
          } else {
            that.setData({
              flag: true,
              errMsg: res && res.data && res.data.message ? res.data.message : '系统异常，请稍后再试'
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

  onLoad: function (options) {
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
    if (options.activeCodeMsg) {
      wx.showModal({
        content: options.activeCodeMsg,
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#0592f5'
      })
    }
  },
  onShow: function () {
    this.setData({ isConnect: getApp().globalData.isConnect })
    this.checkClipboard()
  },
  checkClipboard() {
    wx.getClipboardData({
      success(res) {
        that.checkContailCode(res.data)
      }
    })
  },
  checkContailCode(val) {
    if (!val) return
    if (6 != val.length) return
    for (let i = 0; i < val.length; i++) {
      let c = val.charCodeAt(i)
      if (c < 48 || (c > 57 && c < 65) || (c > 90 && c < 97) || c > 122) return
    }
    console.log('>>> 激活码', val)
    wx.showModal({
      title: '激活码',
      content: '确定使用激活码【' + val + '】?',
      confirmText: '确定激活',
      success: res => {
        if (!res.confirm) return
        that.setData({ values: val })
        that.active(true)
      }
    })
  }


})