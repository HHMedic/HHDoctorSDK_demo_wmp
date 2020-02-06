// components/innerpages/hh-ehr/ehr-filing-list/ehr-filing-list.js
const app = getApp();
const apis = require("../../../utils/api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      memberUuid: options.memberUuid,
      nickname: options.nickname,
      memberUserToken: options.memberUserToken || ''
    })
    wx.setNavigationBarTitle({
      title: this.data.nickname //页面标题为路由参数
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
    this.getEhrList(this.data.memberUuid, this.data.memberUserToken)

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
  getEhrList: function(memberUuid, memberUserToken) {
    let self = this;
    wx.showLoading()
    apis.requestGetEhrList(memberUuid, memberUserToken).then(res => {
      wx.hideLoading();
      if (res.status == 200) {
        self.setData({
          patient: res.data.patient,
          medicrecords: res.data.patient.medicrecords || '',
          isLoad:true
        })
      }
    })
  },
  //点击每一条档案
  bindFilingItem: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/components/innerpages/hh-ehr/ehr-filing-detail/ehr-filing-detail?id=${id}&memberUserToken=${this.data.memberUserToken}&memberUuid=${this.data.memberUuid}`,
    })
  },

})