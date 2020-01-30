var that;
let userToken=null;
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
    that = this;
    if ('WMP_SHARE_LIVE' == options.liveSource) {
      //来自分享
      this.getUserInfo(options);
    } else {
      this.setData({
        hhRequest: options
      })
      userToken = options.userToken||null
    }
    wx.showShareMenu({
      withShareTicket: true
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
    let live = this.selectComponent('#live');
    if (live) live.startShare();
    let pageUrl = '/components/innerpages/video/video' +
      '?filterType=live' +
      '&videoType=live' +
      '&videoId=' + that.data.liveInfo.id +
      '&liveSource=WMP_SHARE_LIVE' +
      //'&sdkProductId=' + that.data.hhRequest.sdkProductId;
      '&sdkProductId=3009';
    return {
      title: '我在看健康科普界的“李佳琪”，快来看',
      imageUrl: that.data.liveInfo.imageUrl + '?x-oss-process=image/resize,m_pad,h_320,w_400',
      path: pageUrl
    }
  },

  getUserInfo(options) {
    getApp().getLoginUser()
      .then((loginUser) => {
        //已注册用户
        options.openId = getApp().globalData.openId;
        options.userToken = loginUser.userToken;
        this.setData({
          hhRequest: options
        })
      })
      .catch(() => {
        //未注册用户
        options.openId = getApp().globalData.openId;
        options.userToken = 'unreg';
        options.enableInputComment = false;
        this.setData({
          hhRequest: options
        })
      })
  },
  /** 点击左上角关闭 */
  onClose() {
    that.afterClose();
  },
  redirectToReg() {
    //去注册
    let pageUrl = '/pages/reg/reg';
    wx.redirectTo({
      url: pageUrl
    })
  },
  afterClose() {
    //当前页是唯一页面(通过分享卡片进入)
    let pages = getCurrentPages();
    if (1 == pages.length) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
      return;
    }
    wx.navigateBack({
      delta: 1
    })
  },
  /** 点击输入评论 */
  onInputComment(res) {
    if (!userToken) {
      //未注册用户
      wx.showModal({
        title: '提示',
        content: '注册后，即可发送评论',
        showCancel: false,
        success: function(res) {
          
        }
      })
    }
  },
  /** 播放列表为空 */
  onLiveListEmpty() {
    let msg = '当前直播已结束';
    
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: function(res) {
        that.afterClose();
      }
    })
  },
  /** 直播信息已更新 */
  onLiveInfoUpdated(res) {
    that.setData({
      liveInfo: res.detail
    })
  }
})