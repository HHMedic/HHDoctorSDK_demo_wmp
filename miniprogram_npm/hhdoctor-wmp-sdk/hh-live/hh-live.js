//和缓直播视频组件

var self;
var apiUtil;
var commentInterval = null;
var commentCycle = 3000;
var showGuideKey = '_hhVideoGuideVisible';
var intervalHandler = {
  resize: null,
  comment: null,
  subtitles: null
}
var timeoutHandler = {
  livePlayMonitor: null
}
var livePlayerPlay = false;
let traceId = null;
let subtitlesLength = 1000;

Component({
  behaviors: [require('../behaviors/hhCommon.js'), require('../behaviors/hhStarter.js')],
  /**
   * 组件的属性列表
   */
  properties: {
    height: Number
  },
  lifetimes: {
    created: () => {

    },
    attached: function() {
      self = this;
    },

    ready: function() {},
    detached: function() {
      self._clearCommentInterval();
      self._clearResizeInterval();
      self._stopLivePlayerMonitor();
      self._leave();
      //处理某些边界条件下循环loading问题
      setTimeout(function() {
        self._stopLivePlayerMonitor();
      }, 1000)
    }
  },
  pageLifetimes: {
    show: () => {}
  },
  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-live',
    isFullScreen: true,
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
    inputting: false,
    doctorComment: null,
    showComments: false,
    liveList: [],
    commentList: [],
    liveInfo: {},
    btnClosePosition: null,
    viewerPosition: 0,
    showGuide: false,
    drawInSameLayer: true,
    logo: {
      url: '',
      height: 30
    },
    subtitles: '',
    subtitlesLeft: 500
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
      console.log('liveSource:', this.data._request);
      apiUtil = require('../utils/apiUtil.js');
      setTimeout(function() {
        self._resize();
        self._getShowGuide();
        self._getVideoList();
      }, 500)
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      if (self.data&&self.data._request.enableLiveShare) {
        wx.showShareMenu({
          withShareTicket: true
        })
      }
    },

    _resize() {
      intervalHandler.resize = setInterval(function() {
        self._doResize().then(() => {
          self._clearResizeInterval();
          self.setData({
            isResized: true
          })
        })
      }, 500)

    },

    _doResize() {
      return new Promise((resolve, reject) => {
        let info = wx.getSystemInfoSync();
        if (info) {
          self._compVersion(info.SDKVersion);
          self.setData({
            customNavbar: info.windowHeight == info.screenHeight
          })
        }
        let rect = wx.getMenuButtonBoundingClientRect();
        if (rect) {
          self.setData({
            capsuleRect: rect
          })
        }
        let query = wx.createSelectorQuery().in(this)
        query.select('#video-list').boundingClientRect(function(res) {
          self.setData({
            isFullScreen: res.width == info.screenWidth && res.height == info.screenHeight
          })
          self._resizeBtnClose();
          self._resizeViews(info.screenWidth);
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
          top: self.data.isFullScreen ? (self.data.customNavbar ? self.data.capsuleRect.top + 37 : 5) : self.data.capsuleRect.top + 37,
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
        doctorComment: {}
      })
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
        self._getComments(true);
        intervalHandler.comment = setInterval(function() {
          self._getComments(false);
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
      console.log(self.data.commentList);
    },
    /** 开始播放指定视频或直播 */
    _startVideo(index) {
      livePlayerPlay = false;
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
      wx.getImageInfo({
        src: url,
        success: function(res) {
          console.log(res)
          if (res && res.height && res.width) {
            self.setData({
              'logo.url': url,
              'logo.height': res.height * ((sysInfo.screenWidth - 18) * 0.435 / res.width)
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
    /** 获取直播和视频列表 */
    _getVideoList() {
      apiUtil.getVideoList(self.data._request.filterType || '')
        .then((res) => {
          let data = res.data;
          console.log('>>>videoLIst:', data);
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
            self._triggerEvent('livelistempty', {});
          }
        })
        .catch((err) => {
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

    _getIndexByIdAndType(id, type) {
      for (var i = 0; i < self.data.liveList.length; i++) {
        if (id == self.data.liveList[i].id && type == self.data.liveList[i].type) {
          return i;
        }
      }
      return -1;
    },

    _clearComments() {
      self.setData({
        commentList: []
      })
    },
    _clearCommentInterval() {
      if (intervalHandler.comment) {
        clearInterval(intervalHandler.comment);
        intervalHandler.comment = null;
      }
    },

    /** 获取评论 */
    _getComments(first) {
      if (0 == self.data.liveList.length || !self.data.liveList[self.data.currentIndex]) {
        return;
      }
      apiUtil.getComment(self.data.liveList[self.data.currentIndex].id, self._getLastCommentId(), self.data.liveList[self.data.currentIndex].type)
        .then(res => {
          wx.hideLoading();
          if (first) {
            self._addDefaultComment();
          }
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
            if (first) {
              list = self._getLastThreeComment(list);
            }
            let cList = self.data.commentList;
            cList.push(...list);
            self.setData({
              commentList: cList
            })
          }
        })
    },
    /** 获取最后3条评论 */
    _getLastThreeComment(list) {
      if (list.length <= 3) {
        return list;
      }
      let newList = [list.pop(), list.pop(), list.pop()];
      return newList.reverse();
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
          self._getComments(false);
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
        fail: function() {
          // self.setData({
          //   showGuide: true
          // })
          wx.setStorage({
            key: showGuideKey,
            data: 1
          })
          setTimeout(function() {
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
      timeoutHandler.livePlayMonitor = setTimeout(function() {
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
      let query = wx.createSelectorQuery().in(this)
      query.select('#subtitles').boundingClientRect(function(res) {
        subtitlesLength = res.width;
      }).exec()

      intervalHandler.subtitles = setInterval(function() {
        let left = self.data.subtitlesLeft - 1;
        if (left < -1 * subtitlesLength) left = 500;
        self.setData({
          subtitlesLeft: left
        })
      }, 20)
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
    }
  }

})