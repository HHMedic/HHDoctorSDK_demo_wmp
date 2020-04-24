// pages/demonstrate/demonstrate.js
var timeStart;
var deptId = 0;
var openType = 4;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    controls: false,
    isCall: true, //是否为呼叫中
    bgImg: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
    logoImage: '',
    ringTime: '',
    videoUrl: '',
    audio: {
      url: 'https://imgs.hh-medic.com/icon/ring.mp3'
    },
    isAuth: true,
    isVideoEnd: false,
    videoLoop: false,//是否循环播放视频
    msgTip: '',
    showCallBtn: false,//播放完成后是否显示呼叫医生按纽
    showPusher: false,//是否显示右上角推流
    showHangupBtn: false, //是否显示挂断按纽
    showWaitting:false,
    objectFit:'cover'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    timeStart = new Date().getTime();
    wx.hideShareMenu();
    console.log(options)
    // ${ getApp().globalData.openId }
    deptId = options.dept;
    openType = options.openType || 4;
    let url = `${getApp().globalData.host}wmp/getDemoVideo?sdkProductId=${options.sdkProductId}&userToken=${options.userToken}&deptId=${options.dept}&openId=${getApp().globalData.openId }`;
    let optString = this.getOptions(options);
    console.log(optString)
    this.setData({
      url,
      optString
    })
  },
  //获取options遍历方法
  getOptions: function(obj) {
    let url = '';
    Object.keys(obj).forEach(function(key) {
      if (obj[key]) {
        url += `${key}=${obj[key]}&`
      }
    });
    return url.slice(0, url.lastIndexOf('&'));
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
    this.getAuth();

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
    if (getApp().globalData._hhim && getApp().globalData._hhim.loginStatus()) {
      let timeSpan = (new Date().getTime() - timeStart) / 1000;
      getApp().globalData._hhim.sendLog(openType, deptId + ',' + timeSpan.toFixed(0));
    }
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

  // 获取授权
  getAuth: function() {
    let self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.camera'] || !res.authSetting['scope.record']) {
          self.setData({
            isAuth: false
          })
        }
      }
    })
    wx.authorize({
      scope: 'scope.record',
      success: function() {
        wx.authorize({
          scope: 'scope.camera',
          success: function(res) {
            if (res.errMsg.indexOf('ok') != -1) {
              self.setData({
                isAuth: true
              });
              self.getCreateLivePusher();
              self.requestVideoData(self.data.url);

            }
          }
        })
      }
    })

  },
  //取消拨号
  bindCancelHangup: function() {
    this.data.myaudio && this.data.myaudio.stop();
    this.data.videoContext && this.data.videoContext.stop();
    wx.navigateBack()
  },
  //创建音频并播放
  getCreateAudio: function() {
    if (!this.data.myaudio) {
      this.data.myaudio = wx.createInnerAudioContext({});
      this.data.myaudio.src = this.data.audio.url;
      this.data.myaudio.loop = true;
      this.data.myaudio.play();
      setTimeout(() => {
        this.data.myaudio.stop();
        this.getCreateVideo();
        this.setData({
          isCall: false
        })
      }, this.data.ringTime)
    } else if (!this.data.isCall) {
      this.getCreateVideo();
    }

  },
  //创建视频
  getCreateVideo: function() {
    if (!this.data.videoContext) {
      this.data.videoContext = wx.createVideoContext('myVideo');
    }
    this.data.videoContext.play();

  },
  //点击挂断按钮
  bindHangUp: function() {
    this.data.videoContext.stop();
    wx.navigateBack()
  },
  // 创建实时视频
  getCreateLivePusher: function() {
    this.data.livePusher = wx.createLivePusherContext('myLivePusher');
    this.data.livePusher.startPreview();
  },
  //获取视频地址
  requestVideoData: function(url) {
    let self = this;
    wx.showLoading({
      mask: true
    })
    wx.request({
      url: url,
      method: 'post',
      success(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          self.setData({
            logoImage: res.data.data.logoImage,
            ringTime: res.data.data.ringTime,
            videoUrl: res.data.data.videoUrl,
            msgTip: res.data.data.msgTip,
            videoLoop: res.data.data.loop,
            showCallBtn: res.data.data.showCallBtn,
            showPusher: res.data.data.showPusher,
            showHangupBtn: res.data.data.showHangupBtn,
            showWaitting: res.data.data.showWaitting,
            objectFit: res.data.data.objectFit
          })

          self.getCreateAudio();

        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      }

    })
  },
  // 视频播放到末尾的时候触发显示呼叫医生按钮
  bindVideoEnd: function(e) {
    this.setData({
      isVideoEnd: true
    })
  },
  //点击呼叫医生
  bindCallDoctor: function() {
    wx.redirectTo({
      url: `/pages/room/room?${this.data.optString}`
    })
  }


})