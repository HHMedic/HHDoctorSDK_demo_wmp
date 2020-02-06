// components/innerpages/hh-ehr/ehr-filing-detail/ehr-filing-detail.js
const app = getApp();
const apis = require("../../../utils/api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    suggest: [
      "1、脂肪肝最主要的病因是：肥胖、糖尿病和酒精中毒。大多数是可逆的，有一部分患者会发展为肝硬化，所以要重视。",
      " 2、减肥，目标：体重指数24，体重70公斤。戒烟酒。控制血糖，空腹6mmol / L，餐后8mmol / L。每天快走或慢跑至少30分钟，每天主食不超过半斤，早餐2两，午餐2两，晚餐1两。多吃蔬菜，两餐间加2两水果。监测血糖。",
      " 3、保肝药：葡醛内酯（肝泰乐）200mg（2片） 每天3次，双环醇片 50mg（2片）每天3次。",
      " 4、每3个月、6个月、1年复查肝功能和肝脏超声。",
      " 5、感谢您使用视频医生，祝早日康复，生活愉快。"
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id,
      memberUuid: options.memberUuid,
      memberUserToken: options.memberUserToken || ''
    })
    console.log(options)
    this.requestGetDetail();
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
  // 点击病例资料
  bindFilingImg: function(e) {
    let current = e.currentTarget.dataset.imgs[0];
    let urls = e.currentTarget.dataset.imgs;
    // let urls = [];
    // arr.map((item, index) => {
    //   if (item.type == 'image') {
    //     urls.push(item.url)
    //   }
    // })
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  requestGetDetail: function() {
    let self = this;
    let medicRecordId = this.data.id;
    let memberUuid = this.data.memberUuid;
    wx.showLoading();
    apis.requestGetEhrDetail(medicRecordId, memberUuid, this.data.memberUserToken).then(res => {
      wx.hideLoading();
      if (res.status == 200) {
        self.setData({
          medicRecord: res.data.medicRecord,
          patientInfo: res.data.patientInfo
        })
        self.setWxTitle(self.data.medicRecord.source)
      }
    })

  },
  // 设置标题
  setWxTitle: function(val) {
    let title = ''
    switch (val) {
      case 'self':
        title = '自建档案'
        break;
      case 'famDoctor':
        title = '总结详情'
        break;
      case 'expert':
        title = '专家总结'
        break;
    }
    wx.setNavigationBarTitle({
      title //页面标题为路由参数
    })
  }

})