// components/innerpages/doctorInfo/doctorInfo.js
let apiUtil
let doctorId
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctorInfo: null,
    naviBackTop: 48,
    naviBackVisible: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    doctorId = options.doctorId
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this
    wx.getSystemInfo({
      success: (result) => self.setData({ naviBackVisible: result.windowHeight == result.screenHeight })
    })
    let rect = wx.getMenuButtonBoundingClientRect()
    this.setData({ naviBackTop: rect.top })
    apiUtil = require('../../utils/apiUtil')
    wx.showLoading({
      title: '加载中...',
    })
    apiUtil.getDoctorInfo(doctorId)
      .then(res => {
        wx.hideLoading()
        if (res && 200 == res.status) {
          this.setData({
            doctorInfo: res.data.doctor
          })
        }
      })
      .catch(() => wx.hideLoading())
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  naviBack() {
    wx.navigateBack()
  }

})