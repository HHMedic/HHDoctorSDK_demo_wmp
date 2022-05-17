//const hostUtil = require('../utils/hostUtil.js');
var that;
let apiUtil
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
    //sysInfo.screenHeight - sysInfo.safeArea.bottom
    let sysInfo = wx.getSystemInfoSync()
    this.setData({ isConnect: getApp().globalData.isConnect, bottom: sysInfo.screenHeight - sysInfo.safeArea.bottom })
    this.checkClipboard()
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
      if (!this.checkLoginStatus()) return
      wx.showLoading({
        title: '激活中...',
      })
      if (!apiUtil) apiUtil = require('../../utils/apiUtil')
      apiUtil.activeCode(that.data.values).then(res => {
        wx.hideLoading()
        console.log('>>> active', res);
        if (clipboard) wx.setClipboardData({ data: '' })
        wx.showModal({
          title: '提示',
          content: res.message || '激活成功',
          showCancel: false,
          success: () => hhDoctor.getUserInfo().then(res => wx.navigateBack({ delta: 1 }))
        })
      }).catch(err => {
        wx.hideLoading()
        console.error('>>> active', err);
        that.setData({
          flag: true,
          errMsg: err && err.message || '系统异常，请稍后再试'
        })
      })
    } else {
      that.setData({
        flag: false
      })
    }
  },
  checkLoginStatus() {
    let app = getApp()
    if (app.globalData._hhSdkOptions && app.globalData._hhSdkOptions._sdkProductId && app.globalData._hhSdkOptions._userToken) return true
    wx.showModal({
      title: '',
      content: '您的登录状态可能已过期，请尝试重新打开小程序',
      confirmText: '我知道了',
      showCancel: false
    })
    return false
  },

  handleTap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  formSubmit(e) {
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