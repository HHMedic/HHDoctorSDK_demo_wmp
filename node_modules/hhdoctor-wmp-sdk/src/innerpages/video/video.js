const commonUtil = require('../../utils/commonUtil.js')
var that;
let apiUtil
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isConnect: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    wx.hideShareMenu();
    let hhRequest = options

    if (options.q) {
      //来自二维码
      let params = commonUtil.getRequestParams(options.q)
      hhRequest = {}
      for (let n in params) {
        hhRequest[n] = params[n]
      }
      hhRequest.liveSource = 'QR_CODE_LIVE'
    }

    switch (hhRequest.liveSource) {
      case 'QR_CODE_LIVE':
      case 'WMP_SHARE_LIVE':
        //来自分享
        this.getUserInfo(hhRequest);
        break;
      default:
        this.setData({ hhRequest })
        break;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },
  onShow: function () {
    this.setData({ isConnect: getApp().globalData.isConnect })
  },
  onHide: function () { },
  onUnload: function () { },
  onPullDownRefresh: function () { },
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let live = this.selectComponent('#live');
    if (live) live.startShare();
    let pageUrl = live.getBasePath() + 'innerpages/video/video' +
      '?filterType=live' +
      '&videoType=live' +
      '&videoId=' + that.data.liveInfo.id +
      '&liveSource=WMP_SHARE_LIVE' +
      '&sdkProductId=' + getApp().globalData._hhSdkOptions._sdkProductId +
      '&profileName=' + getApp().globalData._hhSdkOptions._profileName +
      '&subDomain=' + getApp().globalData._hhSdkOptions._subDomain;
    console.log(pageUrl);
    return {
      title: that.data.liveInfo.shareTitle || '我在看健康科普界的“李佳琪”，快来看',
      imageUrl: (that.data.liveInfo.shareImageUrl || that.data.liveInfo.imageUrl) + '?x-oss-process=image/resize,m_pad,h_320,w_400',
      path: pageUrl
    }
  },

  getUserInfo(options) {
    if (options && options.sdkProductId) getApp().globalData.appId = options.sdkProductId
    if (options && options.profileName) getApp().globalData.profile = options.profileName
    if (options && options.subDomain) getApp().globalData.subDomain = options.subDomain
    getApp().initProfile()
    getApp().globalData.loginUser = null
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
    if (!getApp().globalData._hhSdkOptions._userToken) {
      //未注册用户
      wx.showModal({
        title: '提示',
        content: '现在注册即可每天观看医生专题讲座，还可享1对1视频咨询医生',
        showCancel: true,
        cancelText: '取消',
        confirmText: '前往注册',
        success: function (res) {
          if (res.confirm) {
            that.redirectToReg();
            return;
          }
          if (res.cancel) {
            that.afterClose();
          }
        }
      })
      return;
    }
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
    if (!getApp().globalData._hhSdkOptions._userToken) {
      //未注册用户
      wx.showModal({
        title: '提示',
        content: '注册后，即可发送评论',
        showCancel: true,
        cancelText: '取消',
        confirmText: '前往注册',
        success: function (res) {
          if (res.confirm) {
            that.redirectToReg();
          }
        }
      })
    }
  },
  /** 播放列表为空 */
  onLiveListEmpty(e) {
    if (e && e.detail && e.detail.liveInfo && e.detail.liveInfo.preUrl) {
      wx.redirectTo({
        url: '../view/view?url=' + encodeURIComponent(e.detail.liveInfo.preUrl)
      })
      return
    }
    let msg = '当前直播未开始或已结束';
    let unRegUser = !getApp().globalData._hhSdkOptions._userToken;
    if (!getApp().globalData._hhSdkOptions._userToken) {
      msg += '，现在注册即可每天观看医生直播，还可享1对1视频咨询医生';
    }
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: unRegUser,
      confirmText: unRegUser ? '前往注册' : '返回',
      success: function (res) {
        if (res.confirm && unRegUser) {
          that.redirectToReg();
        } else {
          that.afterClose();
        }
      }
    })
  },
  /** 直播信息已更新 */
  onLiveInfoUpdated(res) {
    that.setData({
      liveInfo: res.detail
    })
  },

})