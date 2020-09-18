//和缓直播视频组件
var self;
var apiUtil;
var commentInterval = null;
var commentCycle = 3000, countdownCycle = 1000;
var showGuideKey = '_hhVideoGuideVisible';
var intervalHandler = {
  resize: null,
  comment: null,
  subtitles: null,
  countdown: null
}
var timeoutHandler = {
  livePlayMonitor: null
}
var livePlayerPlay = false;
let traceId = null;
let subtitlesLength = 1000;
const enumUtil = require('../utils/enumUtil.js')
const hhDoctor = require('../hhDoctor.js')
let regSource
let sysInfo

Component({
  behaviors: [require('../behaviors/hhCommon.js'),
  require('../behaviors/hhStarter.js'),
  require('./behaviorUser.js'),
  require('./behaviorLottery.js'),
  require('./behaviorAddress.js')],

  /**
   * 组件的属性列表
   */
  properties: {
    height: Number
  },
  lifetimes: {
    created: () => {

    },
    attached: function () {
      self = this;
    },

    ready: function () { },
    detached: function () {
      self._clearCommentInterval();
      self._clearResizeInterval();
      self._clearCountdownInterval();
      self._stopLivePlayerMonitor();
      self._leave();
      //处理某些边界条件下循环loading问题
      setTimeout(function () {
        self._stopLivePlayerMonitor();
      }, 1000)
    }
  },
  pageLifetimes: {
    show: () => { }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-live',
    isFullScreen: true,
    apiUtil: null,
    isResized: false,
    currentIndex: 0,
    customNavbar: true,
    viewers: 4321,
    capsuleRect: {
      bottom: 82,
      height: 32,
      left: 278,
      right: 365,
      top: 50,
      width: 87
    },
    landscape: '',  //横屏样式
    inputting: false,
    doctorComment: null,
    showComments: false,
    liveList: [],
    commentList: [],
    liveInfo: {},
    showCloseBtn: true,
    btnClosePosition: null,
    viewerPosition: 0,
    showGuide: false,
    drawInSameLayer: true,
    logo: {
      url: '',
      height: 30
    },
    subtitles: '',
    subtitlesLeft: 500,
    subtitlesAnimation: null,
    phoneData: {},
    licenseNodes: [],
    showLicense: false,
    lotteryStatus: 'NOT_APPLY',
    lottery: null,
    regSource: null,
    countdown: '',
    showLottery: false,
    now: null,
    lotteryState: '',
    successSeckillId: null,
    goodsCategory: 1,
    addressState: '',
    newAddress: {},
    cleanScreen: false,
    videoRatio: 0.6
  },

  /**
   * 组件的方法列表
   */
  methods: {
    startShare() {
      self._reportTrace('WMP_USER_SHARE');
    },
    getBasePath() {
      return this.data.basePath;
    },
    _requestComplete() {
      let self = this;
      apiUtil = require('../utils/apiUtil.js');
      this.setData({
        apiUtil: apiUtil,
        phoneData: this.getPhoneFromStorage()
      })
      hhDoctor.addLog(1, '进入直播,liveSource:' + this.data._request.liveSource || '未知', '')
      setTimeout(function () {
        self._resize();
        self._getShowGuide();
        self._getVideoList();
      }, 500)
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      if (self.data && self.data._request.enableLiveShare) {
        wx.showShareMenu({
          withShareTicket: true
        })
      }
      if ('unreg' != this.data._request.userToken && !this.data.phoneData) {
        this.getUserPhoneByUserToken().then(res => {
          this.setData({ "phoneData.phoneNumber": res })
        }).catch(err => { })
      }
      intervalHandler.countdown = setInterval(this._countdown, countdownCycle)
      wx.onWindowResize(this._onResized)
    },

    _resize() {
      intervalHandler.resize = setInterval(function () {
        self._doResize().then(() => {
          self._clearResizeInterval();
          self.setData({
            isResized: true
          })
        })
      }, 500)

    },
    _onResized(e) {
      self.setData({ landscape: 'landscape' == e.deviceOrientation ? 'landscape' : '' })
      self._setLogoImage(self.data.logo.url || '')
      let rect = wx.getMenuButtonBoundingClientRect();
      if (rect) { self.setData({ capsuleRect: rect }) }
      sysInfo = wx.getSystemInfoSync();
      self._resizeViews(sysInfo.screenWidth);
    },
    _doResize() {
      return new Promise((resolve, reject) => {
        sysInfo = wx.getSystemInfoSync();
        if (sysInfo) {
          self._compVersion(sysInfo.SDKVersion);
          self.setData({
            customNavbar: sysInfo.windowHeight == sysInfo.screenHeight,
            platform: sysInfo.platform,
            subtitlesLeft: sysInfo.windowWidth + 50
          })
        }
        let rect = wx.getMenuButtonBoundingClientRect();
        if (rect) { self.setData({ capsuleRect: rect }) }
        let query = wx.createSelectorQuery().in(this)
        query.select('#video-list').boundingClientRect(function (res) {
          self.setData({
            isFullScreen: res.width == sysInfo.screenWidth && res.height == sysInfo.screenHeight
          })
          self._resizeBtnClose();
          self._resizeViews(sysInfo.screenWidth);
          resolve();
        }).exec()
      })
    },

    _clearResizeInterval() {
      if (intervalHandler.resize) {
        clearInterval(intervalHandler.resize);
        intervalHandler.resize = null;
      }
    },
    _clearCountdownInterval() {
      if (intervalHandler.countdown) {
        clearInterval(intervalHandler.countdown);
        intervalHandler.countdown = null;
      }
    },
    _compVersion(ver) {
      self.setData({
        drawInSameLayer: self._compV(ver, '2.9.0')
      })
    },

    _compV(curV, reqV) {
      if (curV && reqV) {
        //将两个版本号拆成数字
        var arr1 = curV.split('.'),
          arr2 = reqV.split('.');
        var minLength = Math.min(arr1.length, arr2.length),
          position = 0,
          diff = 0;
        //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
        while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
          position++;
        }
        diff = (diff != 0) ? diff : (arr1.length - arr2.length);
        //若curV大于reqV，则返回true
        return diff > 0;
      } else {
        //输入为空
        console.log("版本号不能为空");
        return false;
      }
    },

    _resizeBtnClose() {
      if (self.data._request.style && self.data._request.style.liveClose) {
        self.setData({
          btnClosePosition: self.data._request.style.liveClose
        })
        return;
      }
      self.setData({
        btnClosePosition: {
          top: self.data.isFullScreen ? (self.data.customNavbar ? self.data.capsuleRect.top + 5 : 10) : 10,
          left: 15
        }
      })
    },

    _resizeViews(screenWidth) {
      if (self.data._request.style && self.data._request.style.views) {
        self.setData({
          viewerPosition: self.data._request.style.views
        })
        return;
      }
      self.setData({
        viewerPosition: {
          //top: self.data.isFullScreen ? (self.data.customNavbar ? self.data.capsuleRect.top + 37 : 5) : self.data.capsuleRect.top + 37,
          top: self.data.isFullScreen ? (self.data.customNavbar ? self.data.capsuleRect.top + 8 : 5) : self.data.capsuleRect.top + 8,
          right: screenWidth - self.data.capsuleRect.left - self.data.capsuleRect.width - 5
        }
      })
    },
    /** 滑动开始 */
    _swiperChange(e) {
      self._stopAll();
    },
    /** 滑动过程 */
    _swiperTransition(e) {
      let x = e.detail.dx,
        y = e.detail.dy;
    },
    /** 滑动动画结束 */
    _swiperanimationFinish(e) {
      if (self.data.currentIndex == e.detail.current) return;
      self._start(e.detail.current);
    },
    /** 停止播放所有 */
    _stopAll() {
      for (var i = 0; i < this.data.liveList.length; i++) {
        let context = this._getContextByIndex(i);
        //context && context.pause();
        context && context.stop();
      }
    },
    /** 播放指定的直播或视频 */
    _start(index) {
      let commentVisible = (self.data.liveList[index] && self.data.liveList[index].comments) || false;
      let shareVisible = (self.data.liveList[index] && self.data.liveList[index].type && 'live' == self.data.liveList[index].type) || false;
      self.setData({
        currentIndex: index,
        showComments: commentVisible,
        commentList: [],
        lottery: null,
        doctorComment: {}
      })
      if ('undefined' != typeof self.data.liveList[index].showCloseBtn) {
        self.setData({ showCloseBtn: self.data.liveList[index].showCloseBtn })
      }
      self._setEnableLiveShare(shareVisible && self.data._request.enableLiveShare);
      wx.setNavigationBarTitle({
        title: commentVisible ? '直播' : '视频'
      })
      self._reportTrace();
      self._startVideo(index);
      if (commentInterval) {
        clearTimeout(commentInterval);
        commentInterval = null;
      }
      self._clearCommentInterval();
      if (commentVisible) {
        //self._addDefaultComment()
        intervalHandler.comment = setInterval(function () {
          self._getComments();
          self.getSeckillList(self.data.liveList[self.data.currentIndex].id, self.data.phoneData && self.data.phoneData.phoneNumber || '')
            .then(res => {
              self.setData({ lottery: res, now: res.now })
            })
            .catch(err => { })
        }, commentCycle)
      }
    },
    _addDefaultComment() {
      //if (!getApp().globalData.isPublished) return;
      let comments = self.data.commentList;
      comments.push({
        id: -1,
        commentType: 'tips',
        comment: '欢迎观看健康科普讲座！直播内容和评论严禁出现违法违规、低俗色情、吸烟酗酒等内容，若有违反，将视情节严重程度对发布者进行不同程度封禁处理。'
      });
      self.setData({
        commentList: comments
      })
    },
    /** 开始播放指定视频或直播 */
    _startVideo(index) {
      livePlayerPlay = false;
      if (sysInfo && 'devtools' == sysInfo.platform) return
      let context = this._getContextByIndex(index);
      context && context.play();
      if ('live' == this.data.liveList[index].type) {
        self._startLivePlayerMonitor();
        self.setData({
          subtitles: this.data.liveList[index].subtitles || ''
        })
        self._startSubtitlesInterval();
        self._setLogoImage(this.data.liveList[index].logo || '');
      }
    },
    _setLogoImage(url) {
      if (!url) {
        self.setData({
          'logo.url': '',
          'logo.height': 30
        })
        return;
      }
      let sysInfo = wx.getSystemInfoSync();
      let ratio = '' == self.data.landscape ? 0.435 : 0.245
      wx.getImageInfo({
        src: url,
        success: function (res) {
          if (res && res.height && res.width) {
            self.setData({
              'logo.url': url,
              'logo.height': res.height * ((sysInfo.screenWidth - 18) * ratio / res.width)
            })
          }
        }
      })
    },
    /** 根据索引获取视频或直播对象 */
    _getContextByIndex(index) {
      let id = this.data.liveList[index].type + '-' + index;
      switch (this.data.liveList[index].type) {
        case 'live':
          return wx.createLivePlayerContext(id, this);
        case 'video':
          return wx.createVideoContext(id, this);
        default:
          return null;
      }
    },
    /**  */
    _tapCommentInput(e) {
      if (self.data._request.enableInputComment) {
        if (self.data.drawInSameLayer) {
          self.setData({
            inputting: !e.currentTarget.dataset.inputting
          })
        } else {
          wx.showToast({
            title: '微信升级到最新版本，可查看、发送评论',
            icon: 'none',
            duration: 2500
          })
        }

      } else {
        self._triggerEvent('inputcomment', self.data.liveInfo);
      }
    },
    /**  */
    _sendComment(e) {
      self._addComment(e.detail.value);
    },
    /**  */
    _cancelInput() {
      this.setData({
        inputting: false
      })
    },
    /** 视频开始播放 */
    _onVideoPlay() {
      wx.hideLoading();
    },
    _onVideoEnded() {
      if (self.data.currentIndex + 1 < self.data.liveList.length - 1) {
        self._start(self.data.currentIndex + 1);
      }
    },
    _onPlayerStateChange(e) {
      switch (e.detail.code) {
        case 2004:
          wx.hideLoading();
          livePlayerPlay = true;
          return;
        default:
          return;
      }
    },
    _onPlayerNetStatus(e) {
      let ratio = e.detail.info.videoWidth / e.detail.info.videoHeight
      self.setData({ videoRatio: ratio })
    },
    /** 获取直播和视频列表 */
    _getVideoList() {
      apiUtil.getVideoList(self.data._request.filterType || '')
        .then((res) => {
          let data = res.data;
          self.setData({
            liveList: data
          })
          if (data.length > 0) {
            if (self.data._request.videoId && self.data._request.videoType) {
              self._startByIdAndType(self.data._request.videoId, self.data._request.videoType, self.data._request.filterType || '');
            } else {
              self._start(0);
            }
          } else {
            self._setEnableLiveShare(false);
            if (!self._checkLiveInfo()) {
              self._triggerEvent('livelistempty', {});
            }
          }
        })
        .catch((err) => {
          hhDoctor.addLog(1, '获取直播列表出错:' + JSON.stringify(err), '')
          self._setEnableLiveShare(false);
          self._triggerEvent('livelistempty', {});
        })
    },

    /** 根据id和type播放指定给的直播或视频 */
    _startByIdAndType(id, type, filterType) {
      let idx = self._getIndexByIdAndType(id, type);
      if (idx >= 0) {
        self._start(idx);
        return;
      }
      //扫描二维码进入，如果当前直播不存在，直接返回直播列表为空
      if (this._checkLiveInfo()) return
      let msg = '当前直播已结束，已为您切换';
      if ('live' == filterType) {
        msg += '到其他直播';
      }
      setTimeout(() => {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 3000
        })
      }, 2000)
      self._start(0);
    },

    /** 获取直播信息并检查 */
    _checkLiveInfo() {
      if (this.data._request.videoId
        && this.data._request.videoType
        && 'live' == this.data._request.filterType) {
        apiUtil.getLiveInfo(this.data._request.videoId).then(res => {
          if (200 != res.status || !res.data) { self._triggerEvent('livelistempty', {}) }
          else if (1 == res.data.liveInfo.liveStatus) {
            let live = {
              id: res.data.liveInfo.id,
              type: 'live',
              comments: true,
              url: res.data.liveInfo.livePullUrl,
              image: res.data.liveInfo.imageUrl,
              title: res.data.liveInfo.doctorName,
              logo: '',
              subtitles: '',
              showCloseBtn: false
            }
            self.setData({ liveList: [live] })
            self._start(0)
          }
          else { self._triggerEvent('livelistempty', res.data) }
        }).catch(err => { self._triggerEvent('livelistempty', {}) })
        return true
      }
      return false;
    },

    _getIndexByIdAndType(id, type) {
      for (var i = 0; i < self.data.liveList.length; i++) {
        if (id == self.data.liveList[i].id && type == self.data.liveList[i].type) return i;
      }
      return -1;
    },

    _clearComments() {
      self.setData({ commentList: [] })
    },
    _clearCommentInterval() {
      if (intervalHandler.comment) {
        clearInterval(intervalHandler.comment);
        intervalHandler.comment = null;
      }
    },

    /** 获取评论 */
    _getComments() {
      if (0 == self.data.liveList.length || !self.data.liveList[self.data.currentIndex]) {
        return;
      }
      if (0 == self.data.commentList.length) self._addDefaultComment()
      apiUtil.getComment(self.data.liveList[self.data.currentIndex].id, self._getLastCommentId(), self.data.liveList[self.data.currentIndex].type)
        .then(res => {
          wx.hideLoading();
          let list = res.data.list;
          self.setData({
            liveInfo: res.data.liveInfo,
            viewers: res.data.onlineUserNum
          })
          if (!res.data.liveInfo || 1 != res.data.liveInfo.liveStatus) {
            self._setEnableLiveShare(false);
          }
          let doctorCommentList = res.data.doctorCommentList;
          self._setDoctorComment(res.data.doctorCommentList);
          self._triggerEvent('liveinfoupdated', self.data.liveInfo);
          if (list && list.length > 0) {
            let cList = self._getCommentsQueue(list)
            self.setData({ commentList: cList })
          }
        }).catch(err => { console.log('>>>获取评论出错') })
    },
    /** 获取最新的评论 */
    _getLastComments(list, maxLength) {
      if (list.length <= maxLength) {
        return list
      }
      let newList = [];
      for (let i = 0; i < maxLength; i++) {
        newList.push(list.pop())
      }
      return newList.reverse();
    },
    /** 返回评论队列，最多返回100条 */
    _getCommentsQueue(commentList) {
      let cList = self.data.commentList;
      cList.push(...commentList);
      return this._getLastComments(cList, 100);
    },
    /** 获取最后一条评论id */
    _getLastCommentId() {
      if (0 == self.data.commentList.length) {
        return 0;
      }
      return self.data.commentList[self.data.commentList.length - 1].id;
    },
    /** 设置医生评论 */
    _setDoctorComment(list) {
      if (!list || 0 >= list.length) {
        self.setData({
          doctorComment: null
        })
        return;
      }
      self.setData({
        doctorComment: list[0]
      })
    },
    /** 添加评论 */
    _addComment(comment) {
      if (!comment) return;
      wx.showLoading({
        title: '发送中',
      })
      apiUtil.addComment({
        liveId: self.data.liveList[self.data.currentIndex].id,
        commentType: self.data.liveList[self.data.currentIndex].type,
        comment: comment
      })
        .then(res => {
          //self._getComments();
        })
        .catch(res => {
          wx.showToast({
            title: res && res.message ? res.message : '评论失败',
            icon: 'none',
            duration: 3000
          })
        });
    },
    /** 点击关闭 */
    _close() {
      self._leave();
      self._triggerEvent('close', {});
    },

    /** 点击操作指引 */
    _tapGuide() {
      self.setData({
        showGuide: false
      })
      wx.setStorage({
        key: showGuideKey,
        data: 1
      })
    },
    /** 显示操作指引 */
    _getShowGuide() {
      wx.getStorage({
        key: showGuideKey,
        fail: function () {
          // self.setData({
          //   showGuide: true
          // })
          wx.setStorage({
            key: showGuideKey,
            data: 1
          })
          setTimeout(function () {
            wx.showToast({
              title: '上下滑动查看更多',
              icon: 'none',
              duration: 1500
            })
          }, 3000)
        }
      })
    },
    /** 停止直播播放监控 */
    _stopLivePlayerMonitor() {
      wx.hideLoading();
      if (timeoutHandler.livePlayMonitor) {
        clearTimeout(timeoutHandler.livePlayMonitor);
        timeoutHandler.livePlayMonitor = null;
      }
    },
    /** 开始直播播放监控 */
    _startLivePlayerMonitor() {
      self._stopLivePlayerMonitor();
      // wx.showLoading({
      //   title: '连接中，请稍候',
      // })
      timeoutHandler.livePlayMonitor = setTimeout(function () {
        if (livePlayerPlay) return;
        self._stopAll();
        self._startVideo(self.data.currentIndex);
      }, 5000)
    },

    _reportTrace(source) {
      if (!source && !this.data._request.liveSource) return;
      let item = self.data.liveList[self.data.currentIndex];
      if (!item) return;
      self._leave();
      apiUtil.reportTrace(item.id, item.type, source || this.data._request.liveSource)
        .then(res => {
          traceId = res.data.id;
        })
        .catch(() => {
          traceId = null;
        })
    },
    _leave() {
      if (!traceId) return;
      apiUtil.leaveLive(traceId);
      traceId = null;
    },
    _startSubtitlesInterval() {
      self._stopSubtitlesInterval();
      if (!self.data.subtitles) return;
      setTimeout(() => {
        let query = wx.createSelectorQuery().in(self)
        query.select('#subtitles').boundingClientRect(function (res) {
          subtitlesLength = res.width;
        }).exec()
      }, 100)

      let animation = wx.createAnimation({
        timingFunction: 'linear'
      })
      self.animation = animation
      self.animation.left((-1 * subtitlesLength) - 50).step({ duration: 9900 })
      self.animation.left(sysInfo && sysInfo.windowWidth + 50 || 500).step({ duration: 1 })
      self.setData({
        subtitlesAnimation: self.animation.export(),
      })

      intervalHandler.subtitles = setInterval(function () {
        self.animation.left((-1 * subtitlesLength) - 50).step({ duration: 9900 })
        self.animation.left(sysInfo.windowWidth + 50).step({ duration: 1 })
        self.setData({
          subtitlesAnimation: self.animation.export(),
        })
      }, 10000)

    },
    _stopSubtitlesInterval() {
      if (intervalHandler.subtitles) {
        clearInterval(intervalHandler.subtitles);
        intervalHandler.subtitles = null;
      }
      self.setData({
        subtitlesLeft: 500
      })
    },
    _setEnableLiveShare(enable) {
      self.data._request.enableLiveShare = enable;
      self.setData({
        _request: self.data._request
      })
    },
    _tapInputComment(e) {
      if ('unreg' === this.data._request.userToken) {
        this._regUser(enumUtil.LIVE_REG_SOURCE.COMMENT, e)
      } else {
        //已注册用户，直接拉起评论输入框
        this.setData({
          inputting: !e.currentTarget.dataset.inputting
        })
      }
    },
    _regUser(regSource, e) {
      this.regSource = regSource
      if (this.data.phoneData) {
        //已授权手机号
        this.showLicense()
      } else {
        //尚未授权手机号
        this.getUserPhone(e)
          .then(res => {
            this.setData({ phoneData: res })
            this.showLicense()
          })
          .catch(err => console.log(err))
      }
    },
    _tapCloseLicense(e) {
      let accept = e.currentTarget.dataset.accept
      this.setData({ showLicense: false })
      if (!accept) return
      this.regOrUpdateUser(this.data.phoneData.phoneNumber, this.data._request.accountId || '')
        .then(res => {
          console.log('>>> regOrUpdateUser:', res)
          if (200 == res.status) {
            this.setData({
              "_request.userToken": res.data.userToken
            })
            getApp().globalData._hhSdkOptions._userToken = res.data.userToken
            switch (regSource) {
              case enumUtil.LIVE_REG_SOURCE.COMMENT:
                this.setData({ inputting: true })
                break;
              case enumUtil.LIVE_REG_SOURCE.LOTTERY:
                this._doApplySeckill(this.data.phoneData.phoneNumber)
                break;
              default: break
            }
          }
        })
        .catch(err => { console.log('>> ERR regOrUpdateUser:', err) })
    },

    _tapApplySeckill(e) {
      if ('unreg' === this.data._request.userToken) {
        this._regUser(enumUtil.LIVE_REG_SOURCE.LOTTERY, e)
      } else {
        if (!this.data.phoneData) {
          //无手机号的已注册用户，获取手机号
          this.getUserPhone(e)
            .then(res => {
              this.setData({ phoneData: res })
              this.updateUser(this.data._request.userToken, res.phoneNumber)
              this._doApplySeckill(res.phoneNumber)
            })
            .catch(err => console.log(err))
        } else {
          //有手机号的已注册用户
          this._doApplySeckill(this.data.phoneData.phoneNumber)
        }
      }
    },
    _doApplySeckill(phoneNum) {
      wx.showLoading({ title: '报名中...' })
      this.applySeckill(phoneNum)
        .then(res => {
          wx.hideLoading()
          this.getSeckillList(this.data.liveList[this.data.currentIndex].id, phoneNum)
            .then(res => {
              this.setData({ lottery: res, now: res.now })
              this._checkSeckill()
            })
            .catch(err => { this.setData({ lottery: null, now: null }) })
        })
        .catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: err && err.message || '报名失败',
            icon: 'none'
          })
        })
    },
    _checkSeckill() {
      //如果已开奖但尚未结束
      if (!this.data.now || !this.data.lottery
        || 'READIED' != this.data.lottery.state
        || !this.data.lottery.stock
        || 0 != this.data.lottery.stock.state
        || !this.data.lottery.stock.startTime
        || !this.data.lottery.stock.endTime) {
        return
      }
      if (this.data.lottery.now >= this.data.lottery.stock.startTime
        && this.data.lottery.now <= this.data.lottery.stock.endTime) {
        this.setData({ countdown: '', showLottery: true })
      }
    },
    _countdown() {
      if (!self.data.now || !self.data.lottery
        || 'READIED' != self.data.lottery.state
        || !self.data.lottery.stock
        || 0 != self.data.lottery.stock.state
        || !self.data.lottery.stock.startTime) {
        self.setData({ countdown: '', showLottery: false })
        return
      }
      if (self.data.lottery.stock.startTime < self.data.now) {
        //开始抽奖
        if (!self.data.showLottery && self.data.countdown) self.setData({ countdown: '', showLottery: true })
        return
      }
      let timeSpan = (self.data.lottery.stock.startTime - self.data.now) / 1000
      let minute = parseInt(timeSpan / 60), second = parseInt(timeSpan % 60)
      self.setData({ countdown: self._padding(minute, 2) + ':' + self._padding(second, 2), now: self.data.now + countdownCycle })
      //now += countdownCycle
    },
    _padding(num, length) {
      for (var len = (num + "").length; len < length; len = num.length) {
        num = "0" + num;
      }
      return num;
    },
    _tapCloseLottery(e) {
      this.setData({ showLottery: false })
      if (!e.currentTarget.dataset.exec) return
      let seckillId = this.data.lottery.stock.seckillId, userPhone = this.data.phoneData.phoneNumber
      wx.showLoading({
        title: '抽奖中...',
      })
      this.execSeckill(seckillId, userPhone)
        .then(res => {
          wx.hideLoading()
          this.setData({ lotteryState: 'SUCCESS', successSeckillId: seckillId, goodsCategory: res.succeededInfo.goodsCategory })
        })
        .catch(err => {
          wx.hideLoading()
          this.setData({ lotteryState: 'FAIL', successSeckillId: null })
        })
    },
    _tapCloseLotteryResult(e) {
      this.setData({ lotteryState: '' })
      if (!e.currentTarget.dataset.address) return
      if (0 == this.data.goodsCategory) {
        //虚拟商品
        this.setAddress(this.data.successSeckillId, this.data.phoneData.phoneNumber, '', this.data.phoneData.phoneNumber, '')
          .then(res => {
            wx.hideLoading()
            wx.showToast({
              title: '收货地址提交成功',
              icon: 'none'
            })
          })
          .catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: err && err.message || '收货地址提交失败',
              icon: 'none'
            })
          })
        return
      }
      this.getAddressList()
        .then(res => this.setData({ addressList: res, addressState: 'LIST' }))
        .catch(err => this.setData({ addressList: [], addressState: 'NEW' }))
    },
    _inputNewAddress(e) {
      this.setData({ ["newAddress." + e.currentTarget.dataset.name]: e.detail.value })
    },
    _tapCloseAddress() {
      this.setData({ addressState: '' })
    },
    _tapAddressList(e) {
      let addrList = this.data.addressList.filter(addr => e.detail.value == addr.id)
      this.setData({
        newAddress: addrList && addrList.length > 0 && addrList[0] || null
      })
    },
    _tapSaveAddress() {
      if (!this.data.successSeckillId || !this.data.newAddress || !this.data.newAddress.name || !this.data.newAddress.phoneNum || !this.data.newAddress.address) return
      if (0 != this.data.newAddress.phoneNum.indexOf('1') || 11 != this.data.newAddress.phoneNum.length) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      wx.showLoading({
        title: '提交中...',
      })
      this.saveAddress(this.data.successSeckillId, this.data.phoneData.phoneNumber, this.data.newAddress.name, this.data.newAddress.phoneNum, this.data.newAddress.address)
        .then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '收货地址提交成功',
            icon: 'none'
          })
        })
        .catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: err && err.message || '收货地址提交失败',
            icon: 'none'
          })
        })
      this.setData({ addressState: '', newAddress: {} })
    },

    _tapSetAddress() {
      if (!this.data.successSeckillId || !this.data.newAddress || !this.data.newAddress.name || !this.data.newAddress.phoneNum || !this.data.newAddress.address) return
      wx.showLoading({
        title: '提交中...',
      })
      this.setAddress(this.data.successSeckillId, this.data.phoneData.phoneNumber, this.data.newAddress.name, this.data.newAddress.phoneNum, this.data.newAddress.address)
        .then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '收货地址提交成功',
            icon: 'none'
          })
        })
        .catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: err && err.message || '收货地址提交失败',
            icon: 'none'
          })
        })
      this.setData({ addressState: '' })
    },
    _tapAddAddress() {
      this.setData({ newAddress: {}, addressState: 'NEW' })
    },
    _triggerCleanScreen() {
      this.setData({ cleanScreen: !this.data.cleanScreen })
    }
  }

})