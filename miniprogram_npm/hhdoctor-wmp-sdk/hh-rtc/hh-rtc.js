// components/hh-rtc/hh-rtc.js
const app = getApp();
const apis = require('../utils/api.js')
const dateUtil = require('../utils/dateUtil.js')
const hhDoctor = require('../hhDoctor.js');
const SDKAppID = 1400073238;
let isTransfer = false;
let isWaitRing = false;
let stopRing = false;
let workbenchList = [];
let self;
let receivedMsgs = [];
let audioContext = null;
Component({
  behaviors: [require('../hhBehaviors.js'), require('./rtcBehaviors.js')],
  properties: {},
  data: {
    status: 1, //0.转呼中 1.呼叫中(是否已分配医生-默认值) 2.排队中 3.视频中 4.医生呼叫 5.专家呼叫 
    waitBox: true,
    waitPlay: false,
    statusText: ['转呼中', '呼叫中', '排队中', '视频中', '医生呼叫中', '专家呼叫中'],
    _name: 'hh-rtc',
    audio: 'https://imgs.hh-medic.com/icon/ring.mp3',
    isExpand: false, //右侧按钮默认不展开
    isCertificate: false, //查看证书默认不显示
    sdkAppID: '1400073238',
    chooseImages: [], //选择的照片
    uploadImages: [], //上传成功的照片
    isUploadPhotos: false, //上传缩略图显示状态
    isPreviewPhoto: false, //预览上传图片显示状态
    isAuthBox: false, //授权弹窗-是否显示
    isAuthStatus: false,
    template: 'bigsmall',
    webrtcroomCom: null,
    muted: true, //是否静音
    debug: false, //可选，true 打印推流 debug 信息 false 不打印推流 debug 信息
    isErrorModalShow: false, //
    frontCamera: true, //切换摄像头控制变量
    enableCamera: true, //可选，开启/关闭摄像头
    smallViewRight: '9rpx',
    enableIM: false, //可选，是否启用 IM
    playerBackgroundImg: '',
    userID: '', //必要，用户 ID
    userSig: '', //必要，身份签名，相当于登录密码的作用
    roomID: '', // 房间id
    orderid: '',
    command: {
      call: 'call', //主呼呼叫
      call_cancel: 'call_cancel', //呼叫-挂断
      HANGUP: 'HANGUP',
      interrupt: 'interrupt',
      busy: 'busy', //回拨如果正在忙碌-返回busy
      lingUp: "dispatchDoctorByONS", //排队-分配医生成功(我收到的)
      waitUserInfo: "waitUserInfo", //排队中-（我收到的）
      ACCEPT: 'ACCEPT', //回拨-接听
      REJECT: 'REJECT', //回拨-挂断
      SWITCH_TO_AUDIO: 'SWITCH_TO_AUDIO', //转音频模式
      SWITCH_TO_VIDEO: 'SWITCH_TO_VIDEO', //转视频模式
      TRANSFER: "TRANSFER", //转呼
    },
    videoTimeStart: '',
    videoTime: '00:00',
    startPlay: false, //控制背景图 true不显示（开始播放视频） false显示
    isLivePusher: true, //控制livePusher是否显示
    orderList: [],
    netErrNum: 0,
    loading: false,
    interruptCount: 0,
    waittingVideoTips: false,
    minBitrate: 50,
    maxBitrate: 200,
    statusErr: [-4, -5, -7, -9, -10, -1301, -1302, -1303, -1304, -1305, -1306, -1307, -1318, 1021],
    statusRecon: [-6, 3005],
    statusPlay: [2001, 2002, 2003, 2004],
    pushCount: 0
  },
  lifetimes: {
    attached: function() {
      self = this;
      // 在组件实例进入页面节点树时执行
      this._addMonitorLog();
      wx.setInnerAudioOption({
        mixWithOther: true,
        obeyMuteSwitch: false
      })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      hhDoctor.off('messageReceived');
      wx.offMemoryWarning();
      wx.offNetworkStatusChange();
      self.data.orderList = [];
      // 既不是我自己点击挂断又不是工作台挂断也不是压后台已执行挂断
      if (!this.data.isClickHangUp && !this.data.isWorkbenchHangUp && !self.data.isHideHangUp) {
        // 组件卸载时 左滑 onhide已执行过 非自己点击挂断 非工作台挂断的情况下
        this.aboutHangUpSomething('页面卸载', 'left');
        console.log('既不是我自己点击挂断又不是工作台挂断也不是压后台已执行挂断')
      }
      self.requestRtcLog('1', 'life:detached')
      console.log('组件卸载')
      clearTimeout(self.data.transferTime1);
      clearTimeout(self.data.transferTime2);
      clearTimeout(self.data.playTimeout);
      clearInterval(self.data.isPushTimer);
      clearInterval(self.data.acceptTimer);
      self.getAudioStop();
    },
  },
  pageLifetimes: {
    show: function() {
      console.log('onshow - show')
      self.data.isOnHide = false;
      self.rtcPreview();
      if (self.data.status == 3) {
        self.setData({
          muted: false,
        })
        self.sendMessage(self.data.command.SWITCH_TO_VIDEO);
      }
      self.requestRtcLog('1', 'life:onShow')
      if (self.data.status == 0) {
        wx.navigateBack();
      }
    },
    hide: function() {
      // 页面被隐藏
      console.log('onhide ---- hide')
      self.getAudioStop();
      self.data.isOnHide = true;

      if (!this.data.isChoosePhoto && !this.data.isClickHangUp) {
        self.data.isHideHangUp = true;
        self.requestRtcLog('1', 'life:onhide-压后台执行挂断')
        this.aboutHangUpSomething('用户压后台挂断');
      }
      if (this.data.status == 3 && this.data.isChoosePhoto) {
        this.sendMessage(this.data.command.SWITCH_TO_AUDIO);
        this.setData({
          muted: true
        })
      }
      clearInterval(self.data.isPushTimer);
      clearInterval(self.data.acceptTimer);
      self.requestRtcLog('1', 'life:onHide')

    },
  },
  methods: {
    _requestComplete() {
      self.setData({
        "_request.style.liveClose": {
          left: 15,
          top: 28
        },
        "_request.enableInputComment": false,
        playerBackgroundImg: 'https://imgs.hh-medic.com/icon/wmp/bg-default.jpg',
        audio: self.data._request.ringtone
      })
      self._triggerEvent('login', {
        login: true
      });
      self._checkAuthorize().then(res => {
        self.requestRtcLog(1, 'authorize: check success');
        self.componentOnload();
      }).catch(res => {
        if (self.data._request.dept.indexOf('F') == 0) {
          self.sendMessage(self.data.command.busy);
        }
        self.requestRtcLog(1, 'authorize: check fail');
        self.setData({
          isAuthBox: true
        })
      })
    },
    componentOnload() {
      console.log('start call....', this.data._request);
      self._getStyle();
      self.workbenchRegist();
      hhDoctor.on('messageReceived', function(e) {
        if (e && e.length > 0) {
          let msgId = e[0].ID;
          if (receivedMsgs[msgId]) {
            return;
          }
          receivedMsgs[msgId] = msgId;
        }
        console.log('<<<<<<<<messageReceived', e);
        self.requestRtcLog(1, 'onImMessage:' + JSON.stringify(e), self.data.orderid);
        e.map((item, index) => {
          let obj = JSON.parse(item.payload.data);
          workbenchList[obj.command] && workbenchList[obj.command](obj.orderId, obj, item.from, item.to);
          console.log('workbenchlist-obj.orderId', obj.orderId)
        })
      })
      if (self.data._request.dept.indexOf('F') == 0) {
        self.workbenchCall(self.data._request.orderid);
      } else {
        self.setData({
          status: 1
        })
        self.requestCreateFamOrder();
      }
    },
    // 万里长征第一步创建订单
    requestCreateFamOrder: function(famOrderId, deptId) {
      let self = this;
      wx.showLoading({
        mask: true
      })
      self.requestRtcLog(1, 'preCall dept:' + JSON.stringify(self.data._request.dept));
      if (self.data.isOnHide) {
        return
      }
      apis.requestCreateFamOrder(deptId ? deptId : self.data._request.dept, famOrderId, self.data.systeminfo.platform, self.data.systeminfo.SDKVersion).then(res => {
        wx.hideLoading();
        if (res.status == 200) {
          let orderid = res.data.order.orderid ? res.data.order.orderid : ''
          let roomID = orderid.slice(orderid.length - 6, orderid.length);
          if (self.data.orderList.indexOf(orderid) == -1) {
            self.data.orderList.push(orderid)
          }
          app.globalData.orderId = orderid;
          self.setData({
            userID: res.data.uuid + '',
            userSig: hhDoctor.getUserSig(),
            sdkAppID: SDKAppID,
            roomID,
            status: 1,
            order: res.data.order,
            orderid,
            doctor: res.data.doctor || null,
            netErrNum: 0,
            minBitrate: res.data.preCallResponse.pusherMinBitrate,
            maxBitrate: res.data.preCallResponse.pusherMaxBitrate
          }, () => {
            self.requestRtcLog(1, 'preCall response:' + '响应成功', self.data.orderid)
            if (self.data.isOnHide) {
              return;
            }
            if (self.data.doctor) {
              self.setData({
                playerBackgroundImg: self.data.doctor.photourl,
                status: 1
              })
              //self.getAudioStart();
              self.requestRtcLog('1', 'call start: 用户开始呼叫', self.data.orderid)
              self.getJoinRoom()

            } else {
              self.setData({
                status: 2,
                preCallResponse: res.data.preCallResponse || '',
                playerBackgroundImg: self.data.bgImgs.waitImg
              })
              self.rtcPreview();
              self.requestRtcLog('1', 'call wait: 用户进入等待模式', self.data.orderid)
              self.data.waittingVideo = setTimeout(function() {
                self._showWaittingTips(res.data.preCallResponse.videoMsgTime, res.data.preCallResponse.videoMsgTemplate)
              }, res.data.preCallResponse.videoMsgDelay * 1000);
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.message || '请求出错',
            success(res) {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          })
        }
      });
    },
    _showWaittingTips(msgTimeSeconds, msgTemplate) {
      if (self.data.status != 2) {
        //已经开始呼叫
        return;
      }
      self.setData({
        msgTime: msgTemplate.replace('{time}', msgTimeSeconds),
        waittingVideoTips: true,
        isLivePusher: false
      })

      let interval = setInterval(function() {
        if (self.data.status != 2) {
          //已经开始呼叫后已经退出
          clearInterval(interval);
          return;
        }
        msgTimeSeconds--;
        if (msgTimeSeconds == 0) {
          clearInterval(interval);
          self.setData({
            waitBox: false,
            waitPlay: true
          })
          self.requestRtcLog('1', 'call wait: 用户观看小视频', self.data.orderid)
          return;
        }
        self.setData({
          msgTime: msgTemplate.replace('{time}', msgTimeSeconds)
        })
      }, 1000);

    },
    //关掉排队时观看的视频,返回排队页中
    _onCloseVideo() {
      self.setData({
        waitBox: true,
        waitPlay: false,
        waittingVideoTips: false,
        isLivePusher: true
      })
      self.requestRtcLog('1', 'call wait: 用户关掉小视频回到等待页', self.data.orderid)
    },
    //点击评论
    _onInputComment(e) {
      wx.showModal({
        title: '前往直播',
        content: '评论需退出排队，跳转至全屏直播，确认跳转吗?',
        success: function(res) {
          if (res.confirm) {
            self.requestRtcLog('1', 'call wait: 用户确认进入直播页', self.data.orderid)
            self.aboutHangUpSomething('用户进入直播页', 'left')
            let pageUrl = self.data.basePath + 'innerpages/video/video?' + self._getPublicRequestParams() + '&liveSource=WMP_CALLING_LIVE' +
              '&videoType=live' +
              '&videoId=' + e.detail.id;
            wx.redirectTo({
              url: pageUrl,
            })
          }
        }
      })
    },
    //1.IM--工作台已接听
    workbenchAccept(orderid, obj) {
      console.log('工作台接听orderid', orderid)
      if (orderid == self.data.orderid) {
        self.getAudioStop();
        self.data.isWorkbenchAccept = true;
        setTimeout(res => {
          self.setData({
            status: 3,
            muted: false,
            startPlay: true
          })
          self.rtcPlay();
          self.setData({
            videoTimeStart: new Date().getTime()
          })
          self._startVideoTimer(); //开始视频计时
        }, 500)
      }
    },
    //2.IM--工作台忙碌状态
    workbenchBusy() {
      wx.navigateBack()
    },
    //3.IM--排队中显示排队等待
    workbenchWait(orderid, obj) {
      self.setData({
        waitUserInfoText: obj.msg
      });
    },
    //4.IM--由排队进入分配医生
    workbenchDispatchDoctorByONS(orderid, obj) {
      self.setData({
        waitBox: true,
        waitPlay: false,
        waittingVideoTips: false,
        isLivePusher: true,
        doctor: obj.doctor,
        orderid: obj.orderId,
        status: 1,
        playerBackgroundImg: obj.doctor.photourl
      })
      setTimeout(() => {
        self.getJoinRoom()
      }, 300)
    },
    //5.IM--工作台呼入(被呼) -- 通过doctor条件判定 1.医生 2.专家打来 3.正在接听状态 
    // doctor.serviceTypeStatus   zhuanke: 专家 quanke: 家庭医生
    workbenchCall(orderid, obj, fromId) {
      let doctor = JSON.parse(this.data._request.doctor);
      let orderId = this.data._request.orderid;
      let roomID = orderId.slice(orderid.length - 6, orderId.length);
      this.setData({
        doctor,
        roomID,
        userSig: hhDoctor.getUserSig(),
        orderid: orderId,
        userID: hhDoctor.getUserId(),
        playerBackgroundImg: doctor.photourl
      })

      if (orderid != self.data.orderid) {
        self.sendMessage(self.data.command.busy, orderid, fromId)
        return;
      }
      if (self.data.orderList.indexOf(orderid) == -1) {
        self.data.orderList.push(orderid)
      }
      if (self.data.doctor.serviceTypeStatus == 'quanke') {
        self.setData({
          status: 4
        })
        self.requestRtcLog('1', 'callback quanke:' + self.data._request.doctor, orderid)

      }
      if (self.data.doctor.serviceTypeStatus == 'zhuanke') {
        self.setData({
          status: 5
        })
        self.requestRtcLog('1', 'callback zhuanke:' + self.data._request.doctor, orderid)
      }
      self.getAudioStart();
      self.requestRtcLog('1', '回拨铃声开始响起（call_sound', orderid)
    },
    //6.IM--医生转呼 
    workbenchTransfer(orderid, obj) {
      console.log('医生转呼')
      isTransfer = true;
      self.setData({
        status: 0,
        doctor: {},
        startPlay: false,
        muted: true,
        playerBackgroundImg: self.data.bgImgs.defaultImg,
        loading: true
      })

      self.getAudioStop();
      self.requestHangUp('HANGUP', '医生转呼');
      self.rtcStop();
      self.data.transferTime1 = setTimeout(() => {
        self.setData({
          status: 1
        })
        let d = JSON.stringify(obj)
        apis.requestDoctor(d).then(res => {
          if (res.status == 200) {
            app.globalData.orderId = self.data.orderid;
            let roomID = self.data.orderid.slice(self.data.orderid.length - 6, self.data.orderid.length);
            self.setData({
              doctor: res.data,
              status: 1,
              playerBackgroundImg: res.data.photourl,
              roomID,
              netErrNum: 0,
              isDoctorTransfer: true
            })
            // self.getAudioStart();
            // self.sendMessage(self.data.command.call);
            self.requestRtcLog('1', 'call start: 转呼用户开始呼叫', self.data.orderid)

            self.getJoinRoom();

          } else {
            wx.showToast({
              title: '呼叫失败',
              icon: 'none'
            })
          }
        })
      }, 3000)
    },
    //6.IM -- 客服转呼
    workbenchAgentTransfer(orderid, obj) {
      isTransfer = true;
      self.setData({
        status: 0,
        doctor: {},
        startPlay: false,
        muted: true,
        playerBackgroundImg: self.data.bgImgs.defaultImg,
        loading: true
      })
      self.requestHangUp('HANGUP', '客服转呼');
      self.getAudioStop();
      self.rtcStop();
      self.data.transferTime2 = setTimeout(() => {
        self.requestCreateFamOrder(self.data.orderid, obj.deptId);
      }, 3000)
    },
    //7. 工作台挂断
    workbenchInterrupt(orderid, obj) {
      if (self.data.orderList.indexOf(obj.orderId) != -1) {
        // 工作台执行挂断 转呼 就会返回interrupt
        self.setData({
          roomID: ''
        })
        if (isTransfer) {
          isTransfer = false;
          return;
        } else {
          self.setData({
            isWorkbenchHangUp: true
          })
          self.data.interruptCount++
            if (self.data.interruptCount > 1) {
              return
            }
          self.aboutHangUpSomething('工作台已挂断');
          self.requestRtcLog(1, 'workbench interrupt:' + JSON.stringify(obj), self.data.orderid);
        }
      }
    },
    //8.工作台发送异常挂断
    workbenchServerHangup(orderid, obj) {
      self.aboutHangUpSomething('服务器通知挂断');
    },

    //除了status4,5 的点击挂断事件
    bindHangUp: function(e) {
      let type = e.currentTarget.dataset.type
      self.setData({
        isClickHangUp: true
      })
      self.aboutHangUpSomething('用户主动点击挂断');
      self.requestRtcLog('1', 'user click hangup:用户主动点击挂断' + type)
    },

    // 回拨挂断-拒接(回拨)
    bindDoctorHangUp: function() {
      self.setData({
        isClickHangUp: true
      })
      self.requestRtcLog('1', 'user click reject:用户拒绝接听回拨', self.data.orderid)
      self.sendMessage(self.data.command.REJECT);
      self.aboutHangUpSomething('用户拒绝接听');

    },
    // 回拨接听-(回拨)
    bindDoctorAccept: function() {
      self.getAudioStop();
      self.requestRtcLog('1', 'user click accept:用户接听回拨', self.data.orderid)
      self.setData({
        status: 3
      })
      self.sendMessage(self.data.command.ACCEPT);
      self.rtcStart();
      apis.requestCallResponse(self.data.orderid);
    },
    //进入房间
    getJoinRoom() {
      self.rtcStart();
      self.data.isPushTimer = setInterval(() => {
        if (self.data.isBeginPush) {
          clearInterval(self.data.isPushTimer);
          self.data.pushCount = 0;
          self.getAudioStart();
          self.sendMessage(self.data.command.call);
          return;
        }
        self.data.pushCount++
          if (self.data.pushCount > 10) {
            clearInterval(self.data.isPushTimer);
            self.data.pushCount = 0;
            // self.aboutHangUpSomething('连接服务器超时','left');
            wx.showModal({
              title: '提示',
              content: '连接服务器超时,建议重启微信再试~',
              showCancel: false,
              success: function(res) {
                if (res.confirm) {
                  self.aboutHangUpSomething('连接服务器超时');
                }
              }
            })
          }
      }, 500)
    },

    // TIM-----向工作台发送消息
    sendMessage(command, newOrderid, fromId) {
      if (self.data.orderid) {
        let orderId = (command == 'busy' && newOrderid) ? newOrderid : self.data.orderid
        let msgData = {
          command,
          orderId,
          uuid: self.data.userID
        }
        let uuid = self.data.doctor ? self.data.doctor.login.uuid : 0
        let toUser = (command == 'busy' && fromId) ? fromId : uuid;
        hhDoctor.sendMessage(toUser, msgData, orderId).then(res => {
          self.requestRtcLog('1', 'sendMessage success:' + command, self.data.orderid)
          if (command == 'call') {
            isWaitRing = true;
            // 如果是医生转呼医生则不再监听此接口
            if (!self.data.isDoctorTransfer) {
              self.data.acceptTimer = setInterval(res => {
                if (self.data.isWorkbenchAccept) {
                  clearInterval(self.data.acceptTimer);
                } else {
                  self.requestGetOrderStatus(self.data.orderid);
                }
              }, 5000)
            }
          }
          if (command == 'interrupt') {
            self.data.interruptCount++
          }
          if (command == 'ACCEPT') {
            wx.showLoading()
            setTimeout(res => {
              wx.hideLoading();
              self.setData({
                muted: false,
                startPlay: true
              })
              self.rtcPlay()
              self.setData({
                videoTimeStart: new Date().getTime()
              })
              self._startVideoTimer();
            }, 3000)
          }
        });
      }
    },
    // 向工作台发送call消息，检测发送状态
    requestGetOrderStatus(orderId) {
      self.requestRtcLog('1', 'getOrderStatus:开始检查医生接听状态')
      apis.requestGetOrderStatus(orderId).then(res => {
        if (res.data) {
          self.requestRtcLog('1', 'getOrderStatus:' + res.data);
          clearInterval(self.data.acceptTimer);
          self.workbenchAccept(orderId, res.data);
        }
      })
    },
    /** 监听webrtc事件*/
    onRoomEvent(e) {
      var self = this;
      console.log('Room-event', e.detail)
      switch (e.detail.tag) {
        case 'play':
          if (self.data.statusPlay.indexOf(e.detail.code) != -1) {
            self.data.isPlayStart = true;
          }
          break;
        case 'push':
          if (1002 == e.detail.code && isWaitRing) { //已经与服务器握手完毕,开始推流
            console.log('>>>>>>>>>>>开始响铃', e.detail.code);
            // self.getAudioStart();
          }
          if (1002 == e.detail.code) { //已经与服务器握手完毕,开始推流
            self.data.isBeginPush = true;
          }
          break;
        case 'error':
          if (this.data.isErrorModalShow) { // 错误提示窗口是否已经显示
            return;
          }
          if (self.data.statusErr.indexOf(e.detail.code) != -1) {
            this.data.isErrorModalShow = true;
            self.aboutHangUpSomething(e.detail.detail, 'left');
            setTimeout(res => {
              wx.showToast({
                title: e.detail.detail,
                mask: true,
                icon: 'none',
                duration: 2000,
              })
            }, 1000)
            setTimeout(res => {
              wx.navigateBack({})
            }, 2000)
          }

          if (3 == self.data.status &&
            (e.detail.code == 3005 || e.detail.code == -6)) {
            self.requestRtcLog('1', 'onRoomEvent:3005推拉流失败', self.data.orderid)
            wx.showLoading({
              title: '网络开小差了...'
            })
            self.rtcStop();
            self.rtcStart();
            setTimeout(res => {
              wx.hideLoading();
              self.rtcPlay();
            }, 3000)
          }
          break;
      }
    },
    //点击挂断 左滑 压后台 拍照需要处理的事情 转呼单独处理
    aboutHangUpSomething: function(reason, left) {
      self.rtcStop();
      self.getAudioStop();
      console.log(reason + '-执行aboutHangUpSomething');
      switch (self.data.status) {
        case 0:
        case 1:
        case 2:
          if (reason != '工作台已挂断' || reason != '服务器通知挂断') {
            self.sendMessage(self.data.command.call_cancel)
          };
          self.requestHangUp('CANCEL', reason);
          break;
        case 3:
          if (reason != '工作台已挂断' || reason != '服务器通知挂断') {
            self.sendMessage(self.data.command.interrupt)
          };
          self.requestHangUp('HANGUP', reason);
          break;
        case 4:
        case 5:
        case 6:
          if (reason != '工作台已挂断' || reason != '服务器通知挂断') {
            self.sendMessage(self.data.command.REJECT)
          };
          self.requestHangUp('HANGUP', reason);
          break;
      }
      if (left != 'left') {
        wx.navigateBack();
      }
    },
    //主呼-挂断http提交 type挂断类型:CANCEL HANGUP  transfer:是否为转呼  
    requestHangUp: function(type, reason) {
      let videoTime = 0;
      if ((self.data.status == 0 || self.data.status == 3) &&
        self.data.videoTimeStart) {
        videoTime = parseInt((new Date().getTime() - self.data.videoTimeStart) / 1000);
      }

      let reasonText = encodeURIComponent(reason + '(' + self.data.statusText[self.data.status] + ')');
      let params = `?famOrderId=${self.data.orderid}&hangupType=${type}&serviceType=${self.data._request.serviceType}&videoTime=${videoTime}&reason=${reasonText}`
      apis.requestHangUp(params).then(res => {
        self.setData({
          videoTimeStart: '',
          videoTime: '00:00'
        })
        self.requestRtcLog('1', 'request hangup:' + type + '-' + self.data.statusText[self.data.status], self.data.orderid)
        app.globalData.orderId = '';
        if (res.status !== 200) {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 1500
          })
        }
      })
      self._triggerEvent('hangup', {
        initiative: true,
        hangupType: type,
        videoDur: videoTime
      });
    },
    // 注册IM执行方法
    workbenchRegist() {
      let self = this;
      workbenchList['accept'] = self.workbenchAccept;
      workbenchList['busy'] = self.workbenchBusy;
      workbenchList['waitUserInfo'] = self.workbenchWait;
      workbenchList['call'] = self.workbenchCall;
      workbenchList['transfer'] = self.workbenchTransfer;
      workbenchList['agent_transfer'] = self.workbenchAgentTransfer
      workbenchList['cancel'] = self.workbenchInterrupt;
      workbenchList['interrupt'] = self.workbenchInterrupt;
      workbenchList['dispatchDoctorByONS'] = self.workbenchDispatchDoctorByONS;
      workbenchList['server_hangup'] = self.workbenchServerHangup;
    },
    //开始响铃
    getAudioStart: function() {
      isWaitRing = false;
      stopRing = false;
      if (!audioContext) {
        audioContext = wx.createInnerAudioContext();
        audioContext.src = self.data.audio;
        audioContext.loop = true;
        audioContext.volume = 1;
      }

      // this.audioContext.loop = true;
      audioContext.offEnded(this.onAudioEnded);
      audioContext.onEnded(this.onAudioEnded);
      audioContext.play();
      self.requestRtcLog('1', 'call sound:开始响铃', self.data.orderid)
    },
    //停止响铃
    getAudioStop: function() {
      isWaitRing = false;
      stopRing = true;
      if (audioContext) {
        audioContext.stop();
        audioContext.destroy();
        self.requestRtcLog('1', 'sound end:停止响铃', self.data.orderid)
      }
    },

    onAudioEnded() {
      if (stopRing) {
        audioContext.offEnded(this.onAudioEnded);
        self.getAudioStop();
      }
    },

    // 调用start方法
    rtcStart() {
      if (!self.data.webrtcroomCom) {
        self.data.webrtcroomCom = self.selectComponent('#webrtcroom');
      }
      self.data.webrtcroomCom.start();
    },
    rtcStop() {
      self.data.isBeginPush = false;
      self.data.isWorkbenchAccept = false;
      self.data.pushCount = 0;
      if (!self.data.webrtcroomCom) {
        self.data.webrtcroomCom = self.selectComponent('#webrtcroom');
      }
      if (!self.data.webrtcroomCom) return;
      self.data.webrtcroomCom.stop();
    },
    rtcPlay() {
      if (self.data.status == 3) {
        if (!self.data.webrtcroomCom) {
          self.data.webrtcroomCom = self.selectComponent('#webrtcroom');
        }
        self.setData({
          startPlay: true,
          loading: false,
          isPlayStart: false
        })
        self.data.webrtcroomCom.startPlay();
        clearTimeout(self.data.playTimeout);
        self.data.playTimeout = setTimeout(() => {
          if (!self.data.isPlayStart) {
            self.rtcPlay();
          }
        }, 1500)
      }
    },
    rtcPreview() {
      if (!self.data.webrtcroomCom) {
        self.data.webrtcroomCom = self.selectComponent('#webrtcroom');
      }
      self.data.webrtcroomCom.startPreview()
    }
  }
})