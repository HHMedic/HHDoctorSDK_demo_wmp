 //const hhim = require('./utils/HH_WMP_SDK.js');
const eventOption = {};
const dateUtil = require('./utils/dateUtil.js');
const commonUtil = require('./utils/commonUtil.js');
//const log = require('./utils/logUtil.js');
var that = this;
var livePlayUrl;
var playStart = false,
  pushStart = false;
var onLoading = true;
var code1101 = 0,
  code1308 = 0;
var secondes = 0;
var pageIsShowing = true;
var famOrderId = '';
var attached = false;
var callStatus = {
  openCamera: false,
  playVideo: false,
  preCallStart: -1,
  preCallFinish: -1,
  weakNetwork: false,
  waitSetting: false,
  pushSpeed: 1,
  playSpeed: 1,
  pushSpeedCount: 1,
  playSpeedCount: 1
};

var callOptions = {
  zeroImageTip: true
};

var timeOutHandler = {
  weaknetwork: null,
  reconnect: null,
  openCamera: null,
  playVideo: null,
  waittingVideo: null
};
var intervalHandler = {
  speed: null,
  upload: null
};

var ringFile = '';
var ring = wx.createInnerAudioContext();
var disConnected = false;
var reConnectCount = 0;
var showModal = false;
var videoIndex = 0;
var inQueue = false; //是否在排队
var holdOn = false; //是否保持通话
var location = {};

Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-call',
    callImmediate: false,
    status: -1, //状态码。1:接入中，显示logo，2:显示视频画面，3:拍照，4:专家侧呼叫用户，5:用户侧专家呼叫
    pushUrl: '', //本地视频推流地址
    playUrl: '', //播放地址
    pusher: null, //推流对象
    player: null, //播放对象
    photoUrl: '', //照片url
    license: '',
    name: '', //姓名
    videoTime: '', //已视频时长
    videoTimeStart: null, //开始时间
    timeout: 60, //当前超时倒计时
    callBgImage: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
    waittingTips: '',
    enableCamera: true, //是否启用本地推流摄像头
    showExtControls: false, //是否显示扩展按纽
    extControlHeight: 35, //扩展信息栏高度
    extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/up.png', //图片地址
    pusherVisible: 'hidden', //是否显示本地推流画面
    playerVisible: 'hidden', //是否显示本地推流画面
    t301: null, //振铃计时器
    t301Timeout: 60, //振铃时长
    demo: 0,
    playMode: "HD",
    uiStyle: {
      objFit: 'fillCrop',
      muted: false,
      waittingText: '',
      extBtns: true,
      license: '执业资格证'
    },
    animationData: {},
    showDemoTip: false,
    callBtnsVisible: false,
    playerFullscreen: false,
    logoWidth: 235,
    pusherHeight: 167,
    pusherWidth: 120,
    pusherTop: 5,
    expertTop: 30,
    isBackCamera: false,
    flashIcon: 'https://imgs.hh-medic.com/icon/wmp/flash-off.png',
    showSettingBtn: false,
    showCancelBtn: false,
    showCalledPanel: false,
    question: null,
    feedbackVisible: 'hidden',
    showLaunchBtn: false,
    showAcceptBtn: false,
    expertCalling: false,
    uploadedImages: [],
    addressStatus: 0,
    editStatus: 1,
    address: {},
    chooseAddress: {},
    locCity: '',
    curCity: '北京',
    animationSearch: null,
    animationCity: null,
    playerMode: 'RTC',
    playerMinCache: 0.5,
    playerMaxCache: 1.0,
    pusherMode: 'RTC',
    pusherMinBitrate: 20,
    pusherMaxBitrate: 200,
    devicePosition: 'front',
    errorMsgVisible: false,
    errorMsg: '网络不佳，请挂断重拨',
    enableCamera: true,
    orientation: 'vertical',
    waittingVideo: false,
    waittingVideoTips: false,
    videoPosition: {
      left: 70,
      top: 20,
      width: 225,
      height: 400
    },
    videoUrl: '',
    btnVisible: true,
    animationBottom: null,
    animationRight: null
  },
  //540*960

  lifetimes: {
    attached() {
      that = this;
      var pusher = wx.createLivePusherContext(this);
      that.setData({
        pusher: pusher
      });
      var player = wx.createLivePlayerContext('livePlayer', this);
      that.setData({
        player: player
      });

      if (2 == that.data.status) {
        that._startVideo();
        that._showPlayer();
        that._showPusher();
      }

      attached = true;
      onLoading = true;

      //that._weakNetworkMonitor();
      var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      })
    },
    ready() {
      wx.setNavigationBarColor({
        backgroundColor: '#ffffff',
        frontColor: '#000000'
      })
    },
    detached() {
      pageIsShowing = false;
      that._clearCountDown();
      that._clearTimeoutHandlers();
      //wx.offNetworkStatusChange();
      if (intervalHandler.upload) {
        clearInterval(intervalHandler.upload);
      }
      if (getApp().globalData._hhim) {
        that._logInfo('页面返回挂机，当前状态码：' + that.data.status);
        switch (parseInt(that.data.status)) {
          case 0:
            setTimeout(function() {
              if (callStatus.preCallStart > 0) {
                that._hangup({
                  hangupType: 'CANCEl',
                  stayInpage: true,
                  source: 'lifetimes.detached,status:0'
                });
              }
            }, 500)
            break;
          case 2: //通话中
          case 3: //呼叫过程中选择图片
            that._hangup({
              stayInpage: true,
              source: 'lifetimes.detached,status:2,3'
            })
            break;
          case 1: //呼叫中
          case 4: //专家回拨专家等待界面
          case 5: //专家回拨用户等待界面
            that._hangup({
              hangupType: 'CANCEl',
              stayInpage: true,
              source: 'lifetimes.detached,status:1,4,5'
            })
            break;
          default:
            break;
        }
      }
      try {
        wx.offNetworkStatusChange();
        wx.offAppHide();
      } catch (e) {}

      setTimeout(function() {
        that._stopRing();
      }, 500)
    }
  },

  pageLifetimes: {
    show() {
      // 页面被展示
      pageIsShowing = true;
      holdOn = false;
      code1101 = 0;
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      if (!onLoading) {
        if (getApp().globalData._hhim && getApp().globalData._hhim.loginStatus()) {
          that._sendLog('1', 'hh-call onShow');
          if (1 == that.data.status) {
            setTimeout(function() {
              that._playRing();
            }, 500)
          } else if (2 == that.data.status) {
            //视频中显示，切换到视频模式
            getApp().globalData._hhim.switchMode('VIDEO');
            that._resumeVideo();
          } else {
            that._stopRing();
          }

          if (callStatus.waitSetting) {
            that.setData({
              showSettingBtn: false
            })
            callStatus.waitSetting = false;
            wx.navigateBack({
              delta: 1
            })
          }

        } else {
          that._stopRing();
          wx.navigateBack({
            delta: 1
          })
        }
      }
    },

    hide() {
      // 页面被隐藏
      pageIsShowing = false;
      that._stopRing();

      if (getApp().globalData._hhim.loginStatus()) {
        that._sendLog('1', 'hh-call onHide');
        switch (that.data.status) {
          case 0:
            if (inQueue) {
              that._hangup({
                hangupType: 'CANCEl',
                stayInpage: false,
                source: '_hidePageWhenQueue'
              })
            }
            break;
          case 1:
            that._hangup({
              hangupType: 'CANCEl',
              stayInpage: false,
              source: '_onPageHide'
            })
            break;
          case 2:
            if (!holdOn) {
              that._hangup({
                hangupType: 'HANGUP',
                stayInpage: false,
                source: '_onPageHide'
              })
            } else {
              //视频中显示，切换到视频模式
              getApp().globalData._hhim.switchMode('AUDIO');
              that._pauseVideo();
            }
            break;
          default:
            break;
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      this._logInfo('初始化参数完成，准备启动CALL...');
      this.setData({
        "_request.liveSource": "WMP_CALLING_QUEUE",
        "_request.enableLiveShare": false
      })
      if (intervalHandler.upload) {
        clearInterval(intervalHandler.upload);
        intervalHandler.upload = null;
      }
      that._getRing();
      this._initHhImSdk(false, {
        onClose: that._onWsClose,
        onCommand: that._commandHandler
      }, function(res) {
        onLoading = false;
        that._triggerEvent('login', {
          login: 200 == res.status
        });
        if (200 == res.status) {
          reConnectCount = 0;
          disConnected = false;
          that._applyStyle();
          that._logInfo('loginStatus:' + getApp().globalData._hhim.loginStatus());
          that._getCallOptions();
          that._addMonitorLog();
          //that._weakNetworkMonitor();
          if (that.data._request.status) {
            that.setData({
              status: that.data._request.status,
              expertCalling: true
            })
            if (4 == that.data._request.status) {
              //专家侧呼叫
              that.setData({
                showLaunchBtn: false
              })
              that._doCall(that._preCallCb, that.data._request.famOrderId);
            }
            if (5 == that.data._request.status) {
              //用户侧等待呼叫（医生或专家）
              that._queryCallInfo();
            }
          } else {
            that.setData({
              status: 0
            })
            that._prepareCall();
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '登录参数错误',
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      });
    },

    _addMonitorLog() {
      wx.getSystemInfo({
        success: function(res) {
          that._resetTop(res);
          that._sendLog('1', JSON.stringify(res));
          if (res.deviceOrientation && 'portrait' != res.deviceOrientation) {
            //设备不是垂直方向
            that.setData({
              orientation: 'horizontal'
            })
          }
        }
      })
      wx.getNetworkType({
        success(res) {
          that._sendLog('1', 'networkType:' + res.networkType);
        }
      })
      wx.onNetworkStatusChange(function(res) {
        if (!res.isConnected) {
          disConnected = true;
          that._onWsClose();
        } else {
          disConnected = false;
          that._sendLog('1', 'networkStatusChange:' + JSON.stringify(res));
        }
      })
      wx.onMemoryWarning(function() {
        that._sendLog('1', 'onMemoryWarning');
      })
      wx.onAppHide(function() {
        that._sendLog('1', 'onAppHide');
      })
    },

    _resetTop(res) {
      if (res && res.screenHeight && res.windowHeight &&
        res.screenHeight == res.windowHeight) {
        this._logInfo('重新调整高度');
        let rect = {
          bottom: 58,
          height: 32,
          left: 278,
          right: 365,
          top: 26,
          width: 87
        }
        try {
          rect = wx.getMenuButtonBoundingClientRect();
        } catch (e) {}
        that.setData({
          pusherTop: 5 + rect.bottom,
          expertTop: 30 + rect.bottom
        })
      }
    },

    /** 当页面卸载时清理所有延时线程 */
    _clearTimeoutHandlers() {
      //that._clearCheckCameraIsOpen();
      that._clearCheckVideoIsPlay();
      that._clearReconnectTimeout();
    },

    /**
     * 播放监控
     */
    _playerMonitor() {
      setTimeout(function() {
        if (!playStart) {
          that.data.player.stop();
          that.data.player.play();
          that._playerMonitor();
        }
      }, 10000)
    },

    /**
     * 推流监控
     */
    _pusherMonitor() {
      setTimeout(function() {
        if (!pushStart) {
          that.data.pusher.start();
          that._pusherMonitor();
        }
      }, 5000)
    },

    /**
     * 显示推流画面
     */
    _showPusher() {
      that.setData({
        pusherVisible: ''
      })
    },

    /**
     * 隐藏推流画面
     */
    _hidePusher() {
      that.setData({
        pusherVisible: 'hidden'
      })
    },

    /**
     * 显示播放画面
     */
    _showPlayer() {
      that.setData({
        playerVisible: ''
      })
    },

    /**
     * 隐藏播放画面
     */
    _hidePlayer() {
      that.setData({
        playerVisible: 'hidden'
      })
    },

    /** 启动推流和播放 */
    _startVideo() {
      that._stopRing();
      if (!that.data.pushUrl || !that.data.playUrl) {
        return;
      }

      that.setData({
        pusherHeight: 167,
        pusherWidth: 120
      })

      that._showPusher();
      that._showPlayer();
      playStart = false;
      setTimeout(function() {
        that.data.player.play();
        that._playerMonitor();
        if (that.data.playerFullscreen) {
          that.data.player.requestFullScreen();
        }
        that._startVideoTimer();
      }, 500)

    },

    /** 停止推流和播放 */
    _stopVideo() {
      that._stopRing();
      if (that.data.pusher) {
        that.data.pusher.stopPreview();
        that.data.pusher.stop();
      }
      if (that.data.player) {
        that.data.player.exitFullScreen();
        that.data.player.stop();
      }

      that._hidePusher();
      that._hidePlayer();
      that.setData({
        showExtControls: true,
        demoVideoVisible: 'hidden'
      })
      that._tapFolding();
    },

    /** 点击显示隐藏扩展控制按纽 */
    _tapFolding() {
      if (that.data.showExtControls) {
        that.setData({
          showExtControls: false,
          extControlHeight: 35,
          extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/up.png'
        })
      } else {
        that.setData({
          showExtControls: true,
          extControlHeight: that.data.license ? 185 : 125,
          extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/down.png'
        })
      }
    },

    _statechangePlayer(e) {

      if (0 == that.data.status) {
        return;
      }

      switch (e.detail.code) {
        case 2004:
          wx.hideLoading();
          playStart = true;
          callStatus.playVideo = true;
          /*setTimeout(function() {
            if (that.data.btnVisible) {
              that.setData({
                btnVisible: false
              })
            }
          }, 5000)*/
          break;
        case 2005:
          return;
        case 2007:
          wx.showLoading({
            title: '连接中，请稍候',
          })
          break;
        default:
          break;
      }

      if (e.detail.code < 0) {
        //出错之后尝试重启播放
        wx.hideLoading();
        that.data.player.stop();
        playStart = false;
        that.data.player.play();
        that._playerMonitor();
      }
      //that._sendLog('3', 'status:' + e.detail.code);
      that._sendLog('3', 'statusCode:' + e.detail.code + '(' + e.detail.message + ')');
      that._triggerEvent('playerstatechange', e);
    },

    _netChangedPlayer(e) {
      if (0 == that.data.status) {
        return;
      }
      var nInfo = {
        vbr: e.detail.info.videoBitrate,
        abr: e.detail.info.audioBitrate,
        fps: parseInt(e.detail.info.videoFPS),
        spd: e.detail.info.netSpeed,
        jit: e.detail.info.netJitter,
        vw: e.detail.info.videoWidth,
        vh: e.detail.info.videoHeight
      }
      callStatus.playSpeed += e.detail.info.netSpeed;
      callStatus.playSpeedCount++;
      that._sendLog('3', 'netinfo:' + JSON.stringify(nInfo));
    },

    _errorPlayer(e) {
      that._sendLog('3', 'error:' + e.detail.errCode);
    },


    _onLivePusherError: function(e) {
      if (e && e.detail && e.detail.errCode) {
        if (10004 == e.detail.errCode) {
          return;
        }
        that._sendLog('2', 'error:' + e.detail.errCode);
        if ((10001 == e.detail.errCode || 10002 == e.detail.errCode) && this.data.status > 0) {
          //启动摄像头或麦克风失败
          that._hangup({
            initiative: true,
            hangupType: 'HANGUP',
            stayInpage: false,
            source: '_onLivePusherError'
          })
        }
      }
    },

    _onLivePusherNetInfo(e) {
      if (0 == that.data.status) {
        return;
      }
      var nInfo = {
        vbr: e.detail.info.videoBitrate,
        abr: e.detail.info.audioBitrate,
        fps: parseInt(e.detail.info.videoFPS),
        spd: e.detail.info.netSpeed,
        jit: e.detail.info.netJitter,
        vw: e.detail.info.videoWidth,
        vh: e.detail.info.videoHeight
      }
      callStatus.pushSpeed += e.detail.info.netSpeed;
      callStatus.pushSpeedCount++;
      that._sendLog('2', 'netinfo:' + JSON.stringify(nInfo));
    },

    _onLivePusherChange: function(e) {
      that._processPusherCode(e.detail.code);
      //if (0 < that.data.status) {
      //that._sendLog('2', 'status:' + e.detail.code);
      that._sendLog('2', 'statusCode:' + e.detail.code + '(' + e.detail.message + ')');
      that._triggerEvent('pusherstatechange', e);
      //}
    },

    /** 处理推流状态码 */
    _processPusherCode(code) {
      code = parseInt(code);
      if (1002 == code) {
        pushStart = true;
        return;
      }
      if (1003 == code) {
        //打开摄像头成功
        callStatus.openCamera = true;
        return;
      }

      if (-1308 == code) {
        code1308++;
      }
      if (3 == code1308) {
        code1308++;
        wx.showToast({
          title: '网络错误请重拨',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function() {
          that._hangup({
            initiative: true,
            hangupType: 'HANGUP',
            stayInpage: false,
            source: '_processPusherCode'
          })
        }, 2000)
        return;
      }

      if (1101 == code) {
        code1101++;
      }
      if (3 == code1101) {
        code1101++;
        wx.showToast({
          title: '网络卡顿...',
          icon: 'loading',
          duration: 2000
        })
      }
    },

    /** 封装wx.showLoading */
    _showLoading(obj) {
      if (pageIsShowing) {
        wx.showLoading({
          title: obj.title,
        })
        setTimeout(function() {
          wx.hideLoading();
        }, 30 * 1000);
      }
    },

    /** 检查用户授权 */
    _checkAuthorize: function(callback) {
      wx.authorize({
        scope: "scope.record",
        success: function() {
          wx.authorize({
            scope: "scope.camera",
            success: function() {
              if (callback) {
                callback(true);
              }
            },
            fail: function() {
              that._sendLog('1', 'authorize failed:camera');
              if (callback) {
                callback(false);
              }
            }
          })
        },
        fail: function() {
          that._sendLog('1', 'authorize failed:record');
          if (callback) {
            callback(false);
          }
        }
      })
    },

    _prepareCall() {
      if (200000 == that.data._request.dept) {
        //医生回拨
        that._logInfo('医生回拨...');
        that._queryCallInfo();
      } else {
        //正常呼叫
        that._doCall(that._preCallCb, that.data._request.dept);
      }
    },

    _doCall(callback, dept) {
      that._sendLog('1', 'authorize check start');
      if (that.data.t301) {
        clearInterval(that.data.t301);
        that.setData({
          t301: null
        })
      }

      //检查用户麦克风和摄像头是否已授权
      that._checkAuthorize(function(success) {
        if (!success) {
          wx.hideLoading();
          that._stopWeakNetworkMonitor();
          //麦克风或摄像头未授权 
          that.setData({
            showSettingBtn: true
          })
          return;
        }
        that._sendLog('1', 'authorize successs ');

        if (!getApp().globalData._hhim || !getApp().globalData._hhim.loginStatus()) {
          that._logInfo('未登录无法进行预呼叫...')
          getApp().globalData._hhim = null;
          setTimeout(function() {
            that._requestComplete();
          }, 500)
          return;
        }

        that._weakNetworkMonitor();

        that._showPusher();
        that.data.pusher.startPreview({
          success: function() {
            callStatus.openCamera = true;
            callStatus.preCallStart = new Date().getTime();
            getApp().globalData._hhim.preCall(dept, callback,
              that.data._request.to,
              that.data._request.appointedDoctorId,
              that.data._request.appointedOrderId,
              that.data._request.medicRecordId,
              that.data._request.patient,
              that.data._request.hospitalId);
          },
          fail: function() {}
        })
      })
    },

    _preCallCb(data) {
      that._sendLog('1', 'precall response:' + JSON.stringify(data));
      callStatus.preCallFinish = new Date().getTime();
      if (!getApp().globalData._hhim.loginStatus()) {
        return;
      }
      if (data.orderId) {
        famOrderId = data.orderId;
      }

      //判断当前页面是否已卸载，或当前为弱网
      if (!pageIsShowing || callStatus.weakNetwork) {
        that._hangup({
          initiative: true,
          hangupType: 'CANCEL',
          stayInpage: true,
          source: '_preCallCb'
        })
        return;
      }
      wx.hideLoading();

      var eventDetail = Object.assign({
        playerMode: 'RTC',
        playerMinCache: 0.5,
        playerMaxCache: 1.5,
        pusherMode: 'RTC',
        pusherMinBitrate: 20,
        pusherMaxBitrate: 200,
        playTimeoutSeconds: that.data._request.playTimeoutSeconds,
        cameraTimeoutSeconds: that.data._request.cameraTimeoutSeconds
      }, data);

      eventDetail.livePlayUrl = '';
      eventDetail.livePushUrl = '';

      that._triggerEvent('precallstatechange', eventDetail);

      that.setData({
        playerMode: eventDetail.playerMode,
        playerMinCache: eventDetail.playerMinCache,
        playerMaxCache: eventDetail.playerMaxCache,
        pusherMode: eventDetail.pusherMode,
        pusherMinBitrate: eventDetail.pusherMinBitrate,
        pusherMaxBitrate: eventDetail.pusherMaxBitrate,
        '_request.playTimeoutSeconds': eventDetail.playTimeoutSeconds,
        '_request.cameraTimeoutSeconds': eventDetail.cameraTimeoutSeconds
      })

      that._sendLog('1', 'push:' + (data.livePushUrl ? data.livePushUrl : ''));
      that._sendLog('1', 'play:' + (data.livePlayUrl ? data.livePlayUrl : ''));

      if (!data.success) {
        if (!data.orderId) {
          //未创建订单，弹框
          that.setData({
            status: 0,
            pushUrl: '',
            playUrl: ''
          })
          var msg = data.message ? data.message : '医生繁忙，请稍后再拨';
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else {
          //已创建订单，医生繁忙
          that._logInfo('医生繁忙，开始排队...');
          inQueue = true;
          getApp().globalData._hhim.on('allocate', that._doctorAllocate);
          getApp().globalData._hhim.on('updateorderid', that._updateFamOrderId);
          getApp().globalData._hhim.on('command', that._commandHandler);
          that._setCallBgImage('wait', data.message ? data.message : '目前咨询人数较多，感谢耐心等待');
          that._playRing();
          that.setData({
            msgMain: data.videoMsgMain,
            msgSec: data.videoMsgSec,
            videoList: data.videoList,
            videoLoop: data.videoLoop
          })
          timeOutHandler.waittingVideo = setTimeout(function() {
            that._showWaittingTips(data.videoMsgTime, data.videoMsgTemplate)
          }, data.videoMsgDelay * 1000);
        }
        return;
      }
      //callStatus.openCamera = false;
      that._doPrecall(data);
    },
    // 根据服务器推送消息更新本地orderId
    _updateFamOrderId(data) {
      that._logInfo('>>>>>>>>>更新orderid:' + data.data.orderId);
      famOrderId = data.data.orderId;
    },

    _showWaittingTips(msgTimeSeconds, msgTemplate) {
      if (that.data.pushUrl) {
        //已经开始呼叫
        return;
      }
      that.data.pusher.stopPreview();
      that._hidePusher();
      that._stopRing();
      let top = that.data.sysInfo.safeArea ? that.data.sysInfo.safeArea.top + 5 : 25;
      let height = that.data.sysInfo.windowHeight - top - 240;
      let width = height * 0.5625;
      let left = (that.data.sysInfo.windowWidth - width) / 2;
      that.setData({
        msgTime: msgTemplate.replace('{time}', msgTimeSeconds),
        waittingVideoTips: true,
        videoPosition: {
          top: top,
          left: left,
          width: width,
          height: height
        }
      })

      let interval = setInterval(function() {
        if (that.data.pushUrl || !pageIsShowing) {
          //已经开始呼叫后已经退出
          clearInterval(interval);
          return;
        }

        msgTimeSeconds--;
        if (msgTimeSeconds == 0) {
          clearInterval(interval);
          that._playWaittingVideo();
          return;
        }
        that.setData({
          msgTime: msgTemplate.replace('{time}', msgTimeSeconds)
        })
      }, 1000);

    },

    _playWaittingVideo() {
      that.setData({
        "_request.style.liveClose": {
          left: 15,
          top: 28
        },
        "_request.enableInputComment": false,
        waittingVideoTips: false,
        waittingVideo: true
      })
    },

    _onCloseVideo() {
      that._sendLog('1', 'stop videos of waitting');
      that.setData({
        waittingVideoTips: false,
        waittingVideo: false
      })
      that._showPusher();
      that.data.pusher.startPreview({
        success: function() {
          that._playRing();
        },
        fail: function() {}
      })
      setTimeout(function() {
        wx.setKeepScreenOn({
          keepScreenOn: true
        })
      }, 3000);
    },

    _onInputComment(e) {
      console.log(e);
      wx.showModal({
        title: '前往直播',
        content: '评论需退出排队，跳转至全屏直播，确认跳转吗?',
        success: function(res) {
          if (res.confirm) {
            that._sendLog('1', 'redirect to videos');
            that._hangup({
              hangupType: 'CANCEl',
              stayInpage: true,
              source: '_redirectToVideos'
            });
            let pageUrl = that.data.basePath + 'innerpages/video/video?' + that._getPublicRequestParams() +
              '&liveSource=WMP_CALLING_LIVE' +
              '&videoType=live' +
              '&videoId=' + e.detail.id;
            that._logInfo(pageUrl);
            wx.redirectTo({
              url: pageUrl,
            })
          }
        }
      })
    },

    _doPrecall(data) {
      that._showPusher();
      //图片
      var photoUrl = 'https://imgs.hh-medic.com/photo/D2017081615094714624/98A8RC.jpg?x-oss-process=image/resize,m_fixed,w_750';
      if (data.doctor.photourl) {
        photoUrl = data.doctor.photourl + '?x-oss-process=image/resize,m_fixed,w_750';
      }

      var license = '';
      if (data.doctor.license) {
        if (data.doctor.license.indexOf('?x-oss-process') < 0) {
          license = data.doctor.license + '?x-oss-process=image/resize,m_fixed,w_400';
        } else {
          license = data.doctor.license;
        }
      }

      if (photoUrl.startsWith('http://')) {
        photoUrl = photoUrl.replace('http://', 'https://');
      }

      if (license.startsWith('http://')) {
        license = license.replace('http://', 'https://');
      }

      /*var eventDetail = Object.assign({
        playerMode: 'RTC',
        playerMinCache: 0.5,
        playerMaxCache: 1.5,
        pusherMode: 'RTC',
        pusherMinBitrate: 50,
        pusherMaxBitrate: 500
      }, data);*/

      //显示详情
      that.setData({
        countdown: that.data.t301Timeout,
        photoUrl: photoUrl,
        license: license,
        name: data.doctor.name,
        pushUrl: data.livePushUrl,
        pusherHeight: 140,
        pusherWidth: 100,
        showCancelBtn: true,
        showCalledPanel: false
      })
      that._sendLog('1', 'pusher bitrate:' + that.data.pusherMinBitrate + '-' + that.data.pusherMaxBitrate);
      livePlayUrl = data.livePlayUrl;


      //########################
      getApp().globalData._hhim.on('transfer', that._transfer);
      getApp().globalData._hhim.on('upgradecall', that._upgradeCall);
      getApp().globalData._hhim.on('error', that._hhImError);

      that.data.pusher.startPreview({
        success: function() {

          pushStart = false;
          if (0 == that.data.status) {
            that.setData({
              status: 1
            })
          }
          setTimeout(function() {
            that.data.pusher.start();
            that._waitPusherStart()
              .then(() => {
                that._countDown();
                that._playRing();
                getApp().globalData._hhim.call(that._callCb, false);
              }).catch(() => {
                that._hangup({
                  hangupType: 'CANCEl',
                  stayInpage: true,
                  source: '_pusherFailed'
                })
                wx.showModal({
                  title: '网络不给力',
                  content: '连接音视频服务器超时，请切换网络再试',
                  showCancel: false,
                  success: function() {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                })
              })
          }, 300)
        },
        fail: function() {
          that._hangup({
            hangupType: 'CANCEL',
            stayInpage: false,
            source: '_pusherFailed'
          })
        }
      })

      //########################

      /*getApp().globalData._hhim.call(that._callCb, false);
      getApp().globalData._hhim.on('transfer', that._transfer);
      getApp().globalData._hhim.on('upgradecall', that._upgradeCall);
      getApp().globalData._hhim.on('error', that._hhImError);

      pushStart = false;
      that._playRing();

      setTimeout(function() {
        that.data.pusher.stop();
      }, 500)

      setTimeout(function() {
        that.data.pusher.start();
      }, 1000)

      setTimeout(function() {
        if (0 == that.data.status) {
          that.setData({
            status: 1
          })
        }
      }, 1000)
      that._checkCameraIsOpen();*/
    },

    _callCb(data) {
      that._stopRing();
      if (that.data.t301) {
        clearInterval(that.data.t301);
        that.setData({
          t301: null
        })
      }
      if (1 == data.data) {
        wx.setNavigationBarTitle({
          title: '通话中'
        })
        that.setData({
          playUrl: livePlayUrl,
          status: 2
        })
        that._hideErrorMsg();
        //接听，开始推流。重要！！！必须加延时，否则可能导致无规律的拉流失败
        setTimeout(function() {
          that._startVideo();
        }, 500)
        //that._checkVideoIsPlay();

      } else {
        //拒绝或错误
        that._hangup({
          initiative: false,
          hangupType: 'HANGUP',
          source: '_callCb'
        })
      }
    },

    /** 已分配医生 */
    _doctorAllocate(msg) {
      that._logInfo('分配医生成功:' + JSON.stringify(msg));
      inQueue = false;
      //let video = wx.createVideoContext("waittingVideo", this)
      //video.stop();
      that.setData({
        waittingVideoTips: false,
        waittingVideo: false
      })
      that._setCallBgImage('default');
      getApp().globalData._hhim.off('allocate');
      getApp().globalData._hhim.off('updateorderid');
      setTimeout(function() {
        that._doPrecall(msg.data);
      }, 500)
    },

    _waitPusherStart() {
      return new Promise((resolve, reject) => {
        let tryCount = 0;
        let handler = setInterval(function() {
          if (pushStart) {
            clearInterval(handler);
            resolve();
          }
          if (tryCount >= that.data._request.cameraTimeoutSeconds * 10) {
            clearInterval(handler);
            reject();
          }
          tryCount++;
        }, 100)
      })
    },

    /** 检查推流摄像头是否已打开 */
    /*_checkCameraIsOpen() {
      that._clearCheckCameraIsOpen();
      timeOutHandler.openCamera = setTimeout(function() {
        if (callStatus.openCamera || !pageIsShowing) {
          //摄像头已打开
          return;
        }
        if (1 != that.data.status && 2 != that.data.status) {
          //不是处于呼叫等待或视频中
          return;
        }
        if (!pageIsShowing) {
          //当前页面没有显示
          return;
        }
        that._sendLog('1', 'can not open camera');
        that._hangup({
          initiative: true,
          hangupType: 'HANGUP',
          stayInpage: true,
          source: '_checkCameraIsOpen'
        })
        wx.showModal({
          title: '错误',
          content: that.data._request.cameraTimeoutMessage,
          showCancel: false,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })

      }, parseInt(this.data._request.cameraTimeoutSeconds) * 1000);
    },

    _clearCheckCameraIsOpen() {
      if (timeOutHandler.openCamera) {
        clearTimeout(timeOutHandler.openCamera);
        timeOutHandler.openCamera = null;
      }
    },*/

    /** 检查是否正常播放视频 */
    _checkVideoIsPlay() {
      that._clearCheckVideoIsPlay();
      timeOutHandler.playVideo = setTimeout(function() {
        if (callStatus.playVideo || !pageIsShowing) {
          //摄像头已打开
          return;
        }
        if (2 != that.data.status) {
          //不是处于视频中
          return;
        }
        if (!pageIsShowing) {
          //当前页面没有显示
          return;
        }
        that._sendLog('1', 'can not play video');
        that._hangup({
          initiative: true,
          hangupType: 'HANGUP',
          stayInpage: false,
          source: '_checkVideoIsPlay'
        })
        wx.showModal({
          title: '错误',
          content: that.data._request.playTimeoutMessage,
          showCancel: false,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })

      }, parseInt(this.data._request.playTimeoutSeconds) * 1000);
    },

    _clearCheckVideoIsPlay() {
      if (timeOutHandler.playVideo) {
        clearTimeout(timeOutHandler.playVideo);
        timeOutHandler.playVideo = null;
      }
    },

    /**
     * 显示图片
     */
    _tapShowLicense() {
      if (!that.data.license) {
        return;
      }
      that._sendLog('1', 'tapShowLicense start');
      holdOn = true;
      wx.previewImage({
        urls: [that.data.license],
        complete: function() {
          that._sendLog('1', 'tapShowLicense complete');
        }
      })
    },

    _tapShowUploaded() {
      if (0 == that.data.uploadedImages.length) {
        return;
      }
      that._sendLog('1', 'tapShowUploaded');
      holdOn = true;
      wx.previewImage({
        urls: that.data.uploadedImages,
        current: that.data.uploadedImages[that.data.uploadedImages.length - 1]
      })
    },

    /**
     * 开关闪光灯
     */
    _tapToggleFlash() {
      that._sendLog('1', 'tapToggleFlash');
      if (!that.data.isBackCamera) {
        //如果不是后置摄像头
        wx.showToast({
          title: '请切换至后摄像头',
          icon: 'none',
          duration: 2000
        })
        return;
      }

      if (that.data.pusher) {
        that.data.pusher.toggleTorch({
          success: function() {
            that.setData({
              flashIcon: that._toggleFlashIcon()
            })
          }
        });
      }
    },
    /**
     * 开关闪光灯后获取相应的icon
     */
    _toggleFlashIcon() {
      if ('https://imgs.hh-medic.com/icon/wmp/flash-off.png' == that.data.flashIcon) {
        return 'https://imgs.hh-medic.com/icon/wmp/flash-on.png';
      }
      return 'https://imgs.hh-medic.com/icon/wmp/flash-off.png';
    },

    /**
     * 切换前后摄像头
     */
    _switchCamera() {
      if (that.data.pusher) {
        that._sendLog('1', 'switchCamera');
        that.data.pusher.switchCamera({
          success: function() {
            that.setData({
              isBackCamera: !that.data.isBackCamera,
            })
          }
        });
      }
    },

    /**
     * 选择图片资料，从相册还是拍照
     */
    _selectImage() {
      if (intervalHandler.upload) {
        return;
      }

      that._sendLog('1', 'selectImage start');
      holdOn = true;

      wx.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          if (!getApp().globalData._hhim ||
            !getApp().globalData._hhim.loginStatus()) {
            //连接已经中断
            wx.showModal({
              title: '网络错误',
              content: '网络中断，请重新呼叫',
              showCancel: false,
              success: function() {
                that._navBack();
              }
            })
            return;
          }
          that._sendLog('1', 'selectImage count:' + res.tempFilePaths.length);
          that._doUploadImage(res.tempFilePaths);
        },
        fail: function() {
          that._sendLog('1', 'selectImage fail');
        },
        complete: function() {
          that._sendLog('1', 'selectImage complete');
        }
      })
    },

    _doUploadImage(tempFilePaths) {
      var hasUploaded = false;
      intervalHandler.upload = setInterval(function() {
        if (!playStart) {
          return;
        }
        if (hasUploaded) {
          if (intervalHandler.upload) {
            clearInterval(intervalHandler.upload);
            intervalHandler.upload = null;
          }
          return;
        }
        if (intervalHandler.upload) {
          clearInterval(intervalHandler.upload);
          intervalHandler.upload = null;
        }

        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        getApp().globalData._hhim.uploadFile(tempFilePaths[0], function(e) {
          e = JSON.parse(e);
          wx.hideLoading();
          if (200 == e.status) {
            //成功
            var fileUrl = e.data;
            that._sendLog('1', 'upload image success:' + fileUrl);
            getApp().globalData._hhim.addAttatch(fileUrl, function(e) {
              that._sendLog('1', 'add attatch success:' + fileUrl);
            })
            var uploaded = that.data.uploadedImages;
            uploaded.push(fileUrl);
            that.setData({
              uploadedImages: uploaded
            })
          } else {
            that._sendLog('1', 'upload image fail');
            wx.showToast({
              title: '发送失败！',
            })
          }
        });
        hasUploaded = true;
        wx.hideLoading();
      }, 100)
    },

    _navBackOrCancel() {
      if (timeOutHandler.waittingVideo) {
        clearTimeout(timeOutHandler.waittingVideo);
      }
      if (!famOrderId) {
        that._navBack();
      } else {
        if (getApp().globalData._hhim) getApp().globalData._hhim.off('allocate');
        that._cancelInitiative({
          target: {
            dataset: {
              hanguptype: 'CANCEL'
            }
          }
        })
      }
    },

    _cancelInitiative(e) {
      that._stopRing();
      wx.vibrateLong();
      that._sendLog('1', 'cancelInitiative type:' + e.target.dataset.hanguptype);
      that._hangup({
        initiative: true,
        hangupType: e.target.dataset.hanguptype,
        stayInpage: false,
        source: '_cancelInitiative'
      })
    },

    _hangup(options) {
      //清除计时器
      that._clearCountDown();
      that._stopVideo();
      that._stopWeakNetworkMonitor();
      var videoTimeSeconds = this.data.videoTimeStart ? parseInt((new Date().getTime() - that.data.videoTimeStart) / 1000) : 0;
      var _options = {
        initiative: true,
        hangupType: 'HANGUP',
        stayInpage: false,
        feedback: true,
        title: '正在结束...'
      }
      if (options) {
        _options = Object.assign(_options, options);
      }
      if (_options.source) {
        that._logInfo('挂机来源:' + _options.source);
      }

      if (!getApp().globalData._hhim || !getApp().globalData._hhim.loginStatus() || 'hhImError' == _options.source) {
        if (getApp().globalData._hhim) {
          getApp().globalData._hhim.addToCommandCache('hangup', [null, false, _options.hangupType, videoTimeSeconds, _options.source ? _options.source : '']);
        }
        if (!_options.stayInpage) {
          wx.navigateBack({
            delta: 1
          })
        }
        return;
      }
      that._showLoading({
        title: _options.title,
      })

      callStatus.preCallStart = -1;
      getApp().globalData._hhim.off('transfer');
      getApp().globalData._hhim.off('allocate');
      getApp().globalData._hhim.off('upgradecall');
      getApp().globalData._hhim.off('error');
      that.setData({
        countdown: that.data.t301Timeout,
        status: 0,
        pushUrl: '',
        playUrl: '',
        videoTimeStart: null
      })

      that._triggerEvent('hangup', {
        initiative: _options.initiative,
        hangupType: _options.hangupType,
        videoDur: videoTimeSeconds
      });

      //if (_options.initiative) {
      that._logInfo('挂机中，通话时长:' + videoTimeSeconds);
      getApp().globalData._hhim.hangup(function(success, data) {
        if (that.data._request.famOrderId) {
          wx.hideLoading();
          wx.setNavigationBarTitle({
            title: '视频已结束'
          })
          that.setData({
            showLaunchBtn: true
          })
        } else if (_options.feedback) {
          that._feedback(_options.stayInpage, data);
        }
      }, false, _options.hangupType, videoTimeSeconds, _options.source ? _options.source : '');
      // } else {
      //   if (that.data._request.famOrderId) {
      //     wx.hideLoading();
      //     wx.setNavigationBarTitle({
      //       title: '视频已结束'
      //     })
      //     that.setData({
      //       showLaunchBtn: true
      //     })
      //   } else {
      //     that._feedback(_options.stayInpage);
      //   }
      // }
    },

    /** 评价 */
    _feedback(stayInpage, data) {
      wx.hideLoading();
      if (data && data.question) {
        this._logInfo('弹出评价模块...')
        wx.setNavigationBarTitle({
          title: '评价'
        })
        this.setData({
          question: data.question,
          feedbackVisible: ''
        })
      } else {
        //是否留在当前页面
        if (!stayInpage) {
          this._logInfo('返回前一页面...')
          wx.navigateBack({
            delta: 1
          })
        }
      }
    },

    /** 评价窗口关闭事件 */
    _evaClose() {
      this.setData({
        feedbackVisible: 'hidden'
      })
      wx.navigateBack({
        delta: 1
      })
    },
    /** 用户回答调研问题事件 */
    _evaAsk(e) {
      getApp().globalData._hhim.feedback(famOrderId, that.data.question.id, e.detail.answerText);
    },

    /** 用户打分评价事件 */
    _evaluate(e) {
      getApp().globalData._hhim.evaluate(famOrderId, e.detail.evaValue, e.detail.evaText);
    },

    /** 倒计时 */
    _countDown() {
      if (that.data.t301) {
        clearInterval(that.data.t301);
      }

      that.setData({
        t301: null,
        timeout: that.data.t301Timeout
      })

      secondes = that.data.t301Timeout;
      var t = setInterval(function() {
        if (2 == that.data.status) {
          //视频进行中
          that._clearCountDown();
          return;
        }
        secondes--;
        that.setData({
          timeout: secondes
        })
        if (secondes < 0) {
          that._clearCountDown();
          that._hangup({
            initiative: true,
            hangupType: 'TIMEOUT',
            stayInpage: false,
            source: '_countDown'
          })
        }
      }, 1000);
      that.setData({
        t301: t
      })
    },

    /** 开始计时器 */
    _startVideoTimer() {
      that.setData({
        videoTimeStart: new Date().getTime()
      })
      var interval = setInterval(function() {
        if (!that.data.videoTimeStart) {
          clearInterval(interval);
          return;
        }
        var vt = parseInt((new Date().getTime() - that.data.videoTimeStart) / 1000);
        that.setData({
          videoTime: dateUtil.formatTimeLength(vt)
        })

      }, 1000)
    },

    /**清除倒计时 */
    _clearCountDown() {
      if (intervalHandler.upload) {
        clearInterval(intervalHandler.upload);
      }
      if (!that.data.t301) {
        return;
      }
      secondes = that.data.t301Timeout;
      that._stopRing();
      clearInterval(that.data.t301);
      that.setData({
        t301: null,
        countdown: that.data.t301Timeout
      })
      if (timeOutHandler.waittingVideo) {
        clearTimeout(timeOutHandler.waittingVideo);
      }
    },

    _transfer(res) {
      //that._stopVideo(true);
      if (that.data.player) {
        that.data.player.exitFullScreen();
        that.data.player.stop();
      }
      that._hidePlayer();
      that.setData({
        showExtControls: true,
        demoVideoVisible: 'hidden'
      })
      that._tapFolding();

      that._sendLog('1', 'transfe play:' + res.data.livePlayUrl);
      that.setData({
        countdown: that.data.t301Timeout,
        photoUrl: res.data.photoUrl + '?x-oss-process=image/resize,m_fixed,w_750',
        license: res.data.license + '?x-oss-process=image/resize,m_fixed,w_400',
        name: res.data.name,
        pusherHeight: 140,
        pusherWidth: 100,
        showCancelBtn: true,
        showCalledPanel: false
      })
      livePlayUrl = res.data.livePlayUrl;

      that.setData({
        status: 1
      })

      setTimeout(function() {
        that._countDown();
        getApp().globalData._hhim.call(that._callCb, false);
        that._playRing();
      }, 500)

      //that._showPusher();
      /*that.data.pusher.startPreview({
        success: function() {
          that._countDown();
          getApp().globalData._hhim.call(that._callCb, false);
          that._playRing();
          setTimeout(function() {
            that.data.pusher.start();
          }, 1000)
        },
        fail: function() {
          wx.showModal({
            title: '错误',
            content: that.data._request.cameraTimeoutMessage,
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          that._hangup({
            hangupType: 'CANCEl',
            stayInpage: true,
            source: '_transfer'
          });
        }
      })*/
    },

    _upgradeCall(res) {
      that._logInfo('用户呼叫升级...', res);
      famOrderId = res.data.orderId;
      let dept = res.data.dept;
      //挂断
      that._logInfo('呼叫升级，挂断原呼叫');
      that._hangup({
        hangupType: 'HANGUP',
        stayInpage: true,
        source: '_upgradeCall',
        feedback: false,
        title: '转呼中...'
      });
      that._logInfo('呼叫升级，开始新呼叫');
      //预呼叫
      that._doCall(that._preCallCb, dept);
    },

    _pauseVideo() {
      that.data.player.stop();
      that.data.pusher.pause();
      playStart = false;
      pushStart = false;
    },

    _resumeVideo() {
      that.data.pusher.resume();
      setTimeout(function() {
        that.data.player.play();
      }, 200)
      that._playerMonitor();
      that._pusherMonitor();
      wx.showLoading({
        title: '连接中，请稍候',
      })
    },

    _queryCallInfo() {
      getApp().globalData._hhim.on('transfer', that._transfer);
      getApp().globalData._hhim.on('callinfo', that._parseCallInfo);
      getApp().globalData._hhim.on('hangup', that._calledHangup);
      callStatus.preCallStart = new Date().getTime();
      getApp().globalData._hhim.callInfo();
    },

    _calledHangup() {
      that._hangup({
        initiative: false,
        hangupType: 'HANGUP',
        stayInpage: false,
        source: '_calledHangup'
      })
    },

    _parseCallInfo(res) {
      if ('undefined' == typeof(res) || !res) {
        getApp().globalData._hhim.on('callinfo', null);
        getApp().globalData._hhim.on('hangup', null);
        wx.navigateBack({
          delta: 1
        })
        return;
      }
      callStatus.preCallFinish = new Date().getTime();
      wx.hideLoading();
      if (res.doctor.name) {
        that.setData({
          name: res.doctor.name
        })
      }
      if (res.doctor.photourl) {
        that.setData({
          photoUrl: res.doctor.photourl + '?x-oss-process=image/resize,m_fixed,w_750'
        })
      }
      if (res.doctor.license) {
        that.setData({
          license: res.doctor.license + '?x-oss-process=image/resize,m_fixed,w_400'
        })
      }

      if (res.livePushUrl) {
        that.setData({
          pushUrl: res.livePushUrl
        })
      }
      if (res.livePlayUrl) {
        livePlayUrl = res.livePlayUrl
      }
      if (res.orderId) {
        famOrderId = res.orderId
      }
      wx.setNavigationBarTitle({
        title: '正在呼叫'
      })

      var pusher = wx.createLivePusherContext(this);
      that.setData({
        pusher: pusher,
        showCancelBtn: false,
        showCalledPanel: true,
        showAcceptBtn: true
      })

      if (0 == that.data.status) {
        that.setData({
          status: 1
        })
      }

      that._showPusher();

      that.data.pusher.startPreview({
        success: function() {
          that._playRing();
          setTimeout(function() {
            that.data.pusher.start();
          }, 1000)
        },
        fail: function() {
          wx.showModal({
            title: '错误',
            content: that.data._request.cameraTimeoutMessage,
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          that._hangup({
            hangupType: 'CANCEl',
            stayInpage: true,
            source: '_parseCallInfo'
          });
        }
      })

      wx.hideLoading();
    },

    /** 接听或拒绝 */
    _answerCall(e) {
      that._stopRing();
      //wx.vibrateLong();
      getApp().globalData._hhim.callResponse(famOrderId, e.currentTarget.dataset.answer);
      if (1 == parseInt(e.currentTarget.dataset.answer)) {
        //接听
        that.setData({
          playUrl: livePlayUrl,
          status: 2
        })
        wx.setNavigationBarTitle({
          title: '通话中'
        })
        setTimeout(function() {
          that._startVideo();
        }, 500)
      } else {
        //取消
        getApp().globalData._hhim.on('callinfo', null);
        getApp().globalData._hhim.on('hangup', null);
        wx.navigateBack({
          delta: 1
        })
      }
    },

    /** 接听 */
    _acceptCall(e) {
      getApp().globalData._hhim.callResponse(famOrderId, 1);
      this.setData({
        playUrl: livePlayUrl
      })
      wx.vibrateLong();
      wx.setNavigationBarTitle({
        title: '通话中'
      })
      this._startVideo();
    },

    _hhImError: function(e) {
      that._clearCountDown();
    },

    _navBack: function() {
      this._stopVideo();
      wx.navigateBack({
        delta: 1
      })
    },
    _applyStyle() {
      if (!this.data._request.style) {
        return;
      }
      var style = this.data._request.style;
      var bg = '#ffffff',
        fg = '#000000';


      if (style.navigationBar && style.navigationBar.bColor) {
        bg = style.navigationBar.bColor;
      }
      if (style.navigationBar && style.navigationBar.fColor) {
        fg = style.navigationBar.fColor;
      }
      wx.setNavigationBarColor({
        frontColor: fg,
        backgroundColor: bg
      })

      var request = this.data._request;
      var uiStyle = this.data.uiStyle;

      if (style.logoImage) {
        request.logoImage = style.logoImage
      }
      if (style.objFit) {
        uiStyle.objFit = style.objFit;
      }
      if (style.muted) {
        uiStyle.muted = style.muted;
      }
      if (style.waittingText) {
        uiStyle.waittingText = style.waittingText;
      }
      if (style.extBtns) {
        uiStyle.extBtns = style.extBtns;
      }
      if (style.license) {
        uiStyle.license = style.license;
      }
      this.setData({
        _request: request,
        uiStyle: uiStyle
      })
    },

    _onWsClose() {
      that._logInfo('与服务器连接断开...');
      /*wx.navigateBack({
        delta: 1
      })*/
      if (!pageIsShowing) {
        return;
      }
      reConnectCount++;
      if (reConnectCount == 5) {
        //如果重连尝试次数大于5次，说明网络中断或极差，则显示错误消息并退出
        wx.showModal({
          title: '网络不给力',
          content: '正在结束视频，请切换网络再试(-401)',
          showCancel: false,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        return;
      }

      if (getApp().globalData._hhim) getApp().globalData._hhim = null;

      var closeTime = new Date().getTime();
      that._clearReconnectTimeout();
      timeOutHandler.reconnect = setTimeout(function() {
        that._initHhImSdk(false, {
          onClose: that._onWsClose,
          onCall: that._callCb,
          onCommand: that._commandHandler
        }, function(res) {
          if (200 == res.status) {
            reConnectCount = 0;
            var timeSpan = new Date().getTime() - closeTime;
            that._logInfo('与服务器重连耗时：' + timeSpan + ' ms');
            that._logInfo('pageIsShowing：', pageIsShowing);

            if (timeSpan >= 5000) {
              //重连接登录超时，服务器已清理挂断通话
              wx.showModal({
                title: '网络不给力',
                content: '正在结束视频，请切换网络再试(-402)',
                showCancel: false,
                success: function() {
                  that._navBack();
                }
              })
            }
          } else {
            //重连接或登录失败
            wx.showModal({
              title: '网络不给力',
              content: '正在结束视频，请切换网络再试()',
              showCancel: false,
              success: function() {
                that._navBack();
              }
            })
          }
        })
      }, 500)


      /*if (showModal) return;
      showModal = true;
      wx.showModal({
        title: '网络不给力(-1)',
        content: '建议切换网络或稍后呼叫医生',
        showCancel: false,
        success: function() {
          showModal = false;
          wx.navigateBack({
            delta: 1
          })
        }
      })*/
    },

    _clearReconnectTimeout() {
      if (timeOutHandler.reconnect) {
        clearTimeout(timeOutHandler.reconnect);
        timeOutHandler.reconnect = null;
      }
    },

    //弱网监控
    _weakNetworkMonitor() {
      that._stopWeakNetworkMonitor();
      timeOutHandler.weaknetwork = setTimeout(function() {
        if (!pageIsShowing) {
          return;
        }

        if (callStatus.preCallStart > 0 && callStatus.preCallFinish > 0) {
          that._logInfo('预呼叫往返耗时:' + (callStatus.preCallFinish - callStatus.preCallStart) + ' ms');
        } else {
          that._logInfo('预呼叫超时,请求时间:' + callStatus.preCallFinish + ',响应时间:' + callStatus.preCallStart);
          callStatus.weakNetwork = true;
          wx.showModal({
            title: '错误',
            content: '网络不给力，请切换网络后重拨',
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: -1
              })
            }
          })
        }
        /*if (callStatus.preCallStart < 0 || callStatus.preCallFinish < 0) {
          if (getApp().globalData._hhim) {
            that._logInfo('weaknetwork,hhim logout');
            getApp().globalData._hhim.logout();
          } else {
            that._logInfo('weaknetwork,_onWsClose');
            that._onWsClose();
          }
          wx.showModal({
            title: '错误',
            content: '网络不给力，请切换网络后重拨',
            showCancel: false,
            success: function() {
              wx.navigateBack({
                delta: -1
              })
            }
          })
        }*/
      }, that.data._request.weakNetworkTimeout * 1000);
    },

    _stopWeakNetworkMonitor() {
      callStatus.preCallStart = -1;
      callStatus.preCallFinish = -1;
      callStatus.weakNetwork = false;
      if (timeOutHandler.weaknetwork) {
        clearTimeout(timeOutHandler.weaknetwork);
        timeOutHandler.weaknetwork = null;
      }
    },

    _showAddress() {
      var _req = this.data._request;
      _req.enableDelete = false;
      this.setData({
        _request: _req,
        addressStatus: 1
      })
    },
    _hideAddress() {
      this.setData({
        addressStatus: 0
      })
    },
    _confirmAddress() {
      if (!this.data._request || !this.data._request.userToken || !this.data.address) {
        return;
      }
      var url = this._getHost().wmpHost +
        'address/setSelect?userToken=' + this.data._request.userToken + '&id=' + this.data.address.id;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that._hideAddress();
          } else {
            wx.showModal({
              title: '错误',
              content: '选择配送地址出错，请稍后再试',
              showCancel: false
            })
          }
        }
      })
    },
    _editAddress(e) {
      var _req = this.data._request;
      _req.editType = 'update';
      _req.addressId = e.detail.addressId;
      this._hidePlayer();
      this._hidePusher();
      this.setData({
        _request: _req,
        showAddressEdit: true
      })
    },
    _chooseAddress(e) {
      this.setData({
        address: e.detail.address,
        addressStatus: 2
      })
    },
    _addAddress() {
      getApp().globalData._hhim.switchMode('AUDIO');
      that.data.pusher.stop();
      that.data.player.stop();
      var _req = this.data._request;
      _req.editType = 'create';
      this._hidePlayer();
      this._hidePusher();
      this.setData({
        chooseAddress: {},
        _request: _req,
        showAddressEdit: true
      })
    },

    _editNaviBack() {
      if (this.data.editStatus > 1) {
        this._changeEditStatus(this.data.editStatus - 1);
      } else {
        getApp().globalData._hhim.switchMode('VIDEO');
        that.data.pusher.start();
        that.data.player.play();
        var hhAdd = this.selectComponent('#hhAddress');
        if (hhAdd) {
          hhAdd.refresh();
        }

        this._showPlayer();
        this._showPusher();
        //that._startSpeedStat();
        this.setData({
          showAddressEdit: false
        })
      }
    },
    _changeEditStatus(s) {
      var _s = this.data.editStatus;
      this.setData({
        editStatus: s
      })
      var visible = true;
      if (s < _s) {
        visible = false;
        s = _s;
      }
      var layer = '';
      switch (s) {
        case 2:
          layer = 'searchaddress';
          break;
        case 3:
          layer = 'citylist';
          break;
        default:
          return;
      }
      this._setLayerVisible(layer, visible);
    },

    _setLayerVisible(layer, visible) {
      var left = visible ? 0 : this.data.sysInfo.windowWidth;
      var animation = wx.createAnimation({
        duration: 250,
        timingFunction: 'ease-in-out',
      })
      animation.left(left).step();
      switch (layer) {
        case 'searchaddress':
          this.setData({
            animationSearch: animation.export(),
          })
          break;
        case 'citylist':
          this.setData({
            animationCity: animation.export(),
          })
          break;
        default:
          break;
      }
    },
    _selectCity() {
      this._changeEditStatus(3);
    },

    _locateCity(e) {
      this.setData({
        locCity: e.detail.city
      })
    },
    _changeCity(e) {
      this.setData({
        curCity: e.detail.name
      })
      this._editNaviBack();
    },

    _changeAddress(e) {
      this.setData({
        chooseAddress: e.detail
      })
      this._editNaviBack();
    },
    _selectAddress() {
      this._changeEditStatus(2);
    },

    _saveAddress(e) {
      if (e.detail.success) {
        wx.showToast({
          title: '保存成功',
          mask: true
        })
        setTimeout(function() {
          that._editNaviBack();
        }, 1500)
      } else {
        wx.showModal({
          title: '错误',
          content: '保存失败，请稍后再试',
          showCancel: false
        })
      }
    },
    _navToSetting() {
      callStatus.waitSetting = true;
    },

    _getCallOptions() {
      var key = this.data._request.userToken + '_options';
      var value = wx.getStorageSync(key);
      if (value) {
        callOptions = JSON.parse(value);
      }
    },
    _setCallOptions(options) {
      var key = this.data._request.userToken + '_options';
      wx.setStorage({
        key: key,
        data: JSON.stringify(options)
      })
    },
    _showErrorMsg(content) {
      if (content) {
        this.setData({
          errorMsg: content,
          errorMsgVisible: true
        })
        return;
      }
      this.setData({
        errorMsgVisible: true
      })
    },

    _hideErrorMsg() {
      this.setData({
        errorMsgVisible: false
      })
    },

    _commandHandler(cmd) {
      if (!cmd || !cmd.action) {
        return;
      }
      switch (cmd.action) {
        case 'hangup':
          that._hangup({
            hangupType: 'HANGUP',
            stayInpage: false,
            source: '_commandHandler'
          });
          break;
        case 'showErrorMsg':
          that._showErrorMsg(cmd.value);
          break;
        case 'hideErrorMsg':
          that._hideErrorMsg();
          break;
        case 'showWaittingTip':
          that._logInfo('收到排队消息:' + cmd.value);
          if (pageIsShowing) {
            that.setData({
              waittingTips: cmd.value
            })
          } else {
            //页面隐藏，挂机
            that._hangup({
              hangupType: 'CANCEL',
              stayInpage: false,
              source: '_hidePageWhenQueue'
            });
          }
          break;
        default:
          break;
      }
    },

    //预下载铃声
    _getRing() {
      let key = 'ringFile';
      wx.getStorage({
        key: key,
        success: function(res) {
          wx.getSavedFileInfo({
            filePath: res.data,
            success: function(r) {
              ringFile = res.data;
            },
            fail: function(e) {
              //文件不存在
              that._downloadRing();
            }
          })
        },
        fail: function() {
          that._downloadRing();
        }
      })

      wx.setInnerAudioOption({
        obeyMuteSwitch: false
      })
      ring.loop = true;
      ring.volume = 1;
    },

    _downloadRing() {
      let key = 'ringFile';
      wx.downloadFile({
        url: that.data._request.ringtone,
        success: function(res1) {
          wx.saveFile({
            tempFilePath: res1.tempFilePath,
            success: function(res2) {
              ringFile = res2.savedFilePath;
              wx.setStorage({
                key: key,
                data: ringFile,
              })
            }
          })
        }
      })
    },

    _playRing() {
      that._stopRing();
      if (!this.data.pusher) {
        return;
      }
      if (!ringFile) {
        ringFile = that.data._request.ringtone;
      }
      ring.src = ringFile;
      ring.volume = 1;
      ring.play();
    },

    _stopRing() {
      ring.stop();
    },

    _setCallBgImage(type, tips) {
      that.setData({
        callBgImage: 'wait' == type ? 'https://imgs.hh-medic.com/icon/wmp/wait-for-doctor.jpg' : 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
        waittingTips: 'wait' == type ? tips : ''
      })

    },
    /** 通话过程中显示隐藏按纽 */
    _showHideBtns(e) {
      /*let visible = !e.currentTarget.dataset.btnVisible;
      this.setData({
        btnVisible: visible
      })*/
    },

    _showModalAndBack(title, content) {
      wx.showModal({
        title: title,
        content: content,
        showCancel: false,
        success: function() {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  }
})