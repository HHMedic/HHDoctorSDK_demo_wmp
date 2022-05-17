// components/hh-trtc/hh-trtc.js
const apis = require('../utils/api.js')
const dateUtil = require('../utils/dateUtil.js')
const hhDoctor = require('../hhDoctor.js');
const uiUtil = require('../utils/uiUtil')
const { requestCallResponse } = require('../utils/api.js');
const PATIENT_STATUS_ENUM = require('../utils/enumUtil').PATIENT_STATUS_ENUM
let audioContext;
let self;
let phaseEnum = {
  TRANSFER: 0,		//转呼或更换医生3秒过渡
  RINGING: 1,			//呼叫振铃中，默认值
  QUEUE: 2,				//呼叫排队中
  CALLING: 3,			//视频通话过程中
  DOCTOR_CALL: 4,	//医生回拨
  EXPERT_CALL: 5,	//专家回拨
  VIDEO_AD: 6,		//观看小视频
  INVITED: 7,			//多人视频被邀请
  EXPERT_WAIT: 8	//提前进房等待专家
}
let cardScene = {
  s1007: '单人',
  s1008: '群聊',
  s1036: 'APP',
  s1044: 'shareTicket'
}

Component({
  behaviors: [require('../behaviors/hhStarter'),
  require('../behaviors/hhCommon'),
  require('./rtcBehaviors'),
  require('./roomBehaviors'),
  require('./rtcDaemon')],
  data: {

    _name: 'hh-trtc',
    phaseStatus: phaseEnum,
    phase: phaseEnum.RINGING,
    rtcConfig: {
      sdkAppID: '1400073238', // 必要参数 开通实时音视频服务创建应用后分配的 sdkAppID
      userID: '', // 必要参数 用户 ID 可以由您的帐号系统指定
      userSig: '', // 必要参数 身份签名，相当于登录密码的作用
      template: '', // 必要参数 组件模版，支持的值 1v1 grid custom ，注意：不支持动态修改, iOS 不支持 pusher 动态渲染
      maxBitrate: 1000,
      minBitrate: 600,
      beautyLevel: 0, // 开启美颜等级 0～9级美颜
      enableIM: false, // 可选，仅支持初始化设置（进房前设置），不支持动态修改
    },
    localVideo: true,
    localAudio: true,
    template: '',//根据单人多人设置模板_setRtcTemplate
    subscribeList: {},
    callTips: {
      callintTip: '医生连线中，请耐心等待...',
      callintTipQueue: '拨号中...',
      callintTipTransfer: '拨号中...'
    },
    realPatientUuid: '',
    realPatientUserToken: '',
    realPatientName: '',
    isAuth: true,
    waitTips: null,//排队提示
    preCallResponse: null,//创建订单返回数据
    doctor: null,//医生数据
    order: null,//订单数据
    orderid: '',
    roomID: '',//房间id
    isTransfer: null,//是否转呼
    pageStatus: '',//页面的声明状态
    isaboutHangUpSomething: false,//是否调用挂断API
    roomCommand: '',//用于存储进房传入房间命令
    isInvite: 0,//是否为邀请模式 0单人 1多人
    patientStatus: PATIENT_STATUS_ENUM.DEFAULT,
    patientName: '',
    whiteboardVisible: false,
    whiteboardUrl: '',
    remoteUserCount: 0,
    waitRoom: '',
  },
  lifetimes: {
    created() { },
    attached() { self = this },
    ready() {
      self = this
      console.log('HH-TRTC:ready')
    },
    detached() {
      this.data.pageStatus = 'detached'
      this._pageLifeExit()
    }
  },
  pageLifetimes: {
    show() {
      this.data.pageStatus = 'show'
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
      setTimeout(res => {
        wx.setKeepScreenOn({ keepScreenOn: true })
      }, 500)
      this._pageLifeExit()

    },
    hide() {
      this.data.pageStatus = 'hide'
      this._pageLifeExit();
    }
  },
  methods: {
    _pageLifeExit() {
      if (!self.data || !self.data.pageStatus) return
      let pageStatus = self.data.pageStatus;
      let phase = self.data.phase;
      switch (pageStatus) {
        case 'show':
          self.requestRtcLog(1, 'life:show', self.data.orderid);
          if (phase == phaseEnum.TRANSFER) self._naviBack()
          self._onMemoryWarning();
          self._onAudioInterruption()
          self._onNetworkStatusChange();
          self._getNetWorkType();
          break;
        case 'hide':
          self._exitHideAndDetached('life:hide', '用户压后台挂断-removeUser')
          break;
        case 'detached':
          hhDoctor.off('messageReceived');
          clearInterval(self.data.cameraInterval);
          self._getClearTimer()
          self._offAudioInterruption()
          self._exitHideAndDetached('life:detached', '页面卸载-removeUser')
          break;
      }
    },
    _exitHideAndDetached(life, text) {
      self.requestRtcLog(1, life, self.data.orderid);
      self.stopAudio();
      setTimeout(() => { self.stopAudio() }, 200);
      wx.offMemoryWarning();
      wx.offNetworkStatusChange();
      if (self.data.isClickHangUp) return;
      if (self.data.isDoctorHangUp) return;
      if (self.data.isaboutHangUpSomething) return;
      if (self.data.enterChooseImages || self.data.enterShare) return;
      if (self.data.phase == phaseEnum.INVITED) {
        self.bindInviteHangUp();
        return;
      }
      if (self.data.createOrderPromise) {
        self.data.createOrderPromise.then(res => {
          self.aboutHangUpSomething(text, 'isBack');
        })
      } else self.aboutHangUpSomething(text, 'isBack');

    },
    _requestComplete() {
      self = this;
      console.log('onLoad======>', this.data._request)
      self.requestRtcLog(1, 'hh-trtc request:' + JSON.stringify(this.data._request));
      if ('undefined' != typeof this.data._request.localVideoStatus) {
        this.setData({ ['_request.localVideoStatus']: parseInt(this.data._request.localVideoStatus) })
      }
      if (this.data._request.isInvite == 1) {
        //多人视频暂不支持关闭本地摄像头
        this.setData({ ['_request.localVideoStatus']: 2 })
      }
      this._request = this.data._request;
      this._setRtcTemplate();
      this.trtcComponent = this.selectComponent('#trtc-component')
      let enterOptions = wx.getEnterOptionsSync()
      if (enterOptions) {
        self.requestRtcLog(1, '小程序进入参数:' + JSON.stringify(enterOptions));
      }
      this.setData({ clientRect: wx.getMenuButtonBoundingClientRect() })
      self._checkAuthorize().then(res => {
        self.requestRtcLog(1, 'authorize: check success');
        self.setData({
          isAuthBox: false
        })
        self._getLocation()
        self.componentOnload();
      }).catch(err => {
        console.error('>>> _checkAuthorize error:', err)
        self.requestRtcLog(1, 'authorize: check fail');
        this._getAuthFun("scope.userLocation")
        self.setData({
          isAuthBox: true
        })
      });

    },
    // 模板渲染
    _setRtcTemplate() {
      self.data.isInvite = this.data._request.isInvite == 1 ? 1 : 0;
      self.data.template = 'custom'
      this.data.rtcConfig.template = this.data.template;
      this.setData({
        isInvite: self.data.isInvite,
        rtcConfig: this.data.rtcConfig
      })
    },

    componentOnload() {
      console.log('选择成员——requestUUid', self.data._request)
      this.data.trtcComponent = this.trtcComponent;
      this.bindTRTCRoomEvent();
      self._workbenchRegist();
      self._registMessageReceived();
      self.data.realPatientUuid = self.data._request.realPatientUuid || self.data._request.uuid || 0; //选择成员呼叫需携带成员id 进入评价页需传入成员或用户i
      self.data.realPatientUserToken = self.data._request.realPatientUserToken || self.data._request.userToken || '';
      if (self._request.dept.indexOf('F') == 0) {
        self.patientWait(hhDoctor.getUserId())
        if (self.data._request.joinRoom) {
          console.log('>>> 提前进房')
          wx.showLoading({ title: '正在加入房间' })
          self.roomerJoin(hhDoctor.getUserId())
          self.waitForExpert(self._request.dept)
        } else {
          console.log('=======> 回拨')
          if (self._request.orderId && self._request.doctorId && !self._request.order && !self._request.doctor) {
            hhDoctor.getDoctorInfo({ uuid: self._request.caller, doctorId: self._request.doctorId, orderId: self._request.orderId })
              .then(res => {
                let order = res.order
                if (!order || 'accept' != order.onekeycallStatus || order.videoTime) {
                  uiUtil.modal('', '视频已挂断，无法加入视频', '我知道了', '', false)
                    .then(res => { wx.navigateBack({ delta: 1 }) }).catch(err => { })
                  return
                }
                self._request.order = encodeURIComponent(JSON.stringify(order))
                self._request.doctor = encodeURIComponent(JSON.stringify(res.doctor))
                apis.requestSetManyVideo(self._request.dept)
                  .then(res => self.workbenchCall(self._request.dept))
                  .catch(err => {
                    uiUtil.modal('', err && err.message || '系统错误，请稍后再试', '我知道了', '', false)
                      .then(res => { wx.navigateBack({ delta: 1 }) }).catch(err => { })
                  })
              }).catch(err => {
                uiUtil.modal('', err && err.message || '系统错误，请稍后再试', '我知道了', '', false)
                  .then(res => { wx.navigateBack({ delta: 1 }) }).catch(err => { })
              })
          } else self.workbenchCall(self._request.dept)
        }
      } else {
        if (!hhDoctor.supportCall()) {
          wx.showModal({
            title: '',
            content: '当前环境可能无法正常呼叫，请使用手机版微信呼叫医生',
            confirmText: '我知道了',
            confirmColor: '#0592f5',
            showCancel: true,
            cancelText: '继续呼叫',
            cancelColor: '#323232'
          }).then(res => {
            console.log(res)
            if (res.confirm) wx.navigateBack({ delta: 1 })
            else self._enterCall()
          })
        } else self._enterCall()
      }
    },

    //进入呼叫
    _enterCall(orderid, deptId) {
      self.dismissRoom()
      self.patientWait(hhDoctor.getUserId())
      self.requestRtcLog('1', 'enter call start', self.data.orderid);
      self.resetCallType()
      self._requestCreateFamOrder(orderid, deptId);
    },
    //当点击小程序卡片进入呼叫时，重新设置callType
    resetCallType() {
      if (self.data._request.callType) return
      let enterOptions = wx.getEnterOptionsSync()
      if (!enterOptions.scene || !cardScene['s' + enterOptions.scene]) return
      self.data._request.callType = 'share_card'
    },
    //1.收到医生接听的消息doctor已接听
    workbenchDoctorAccept(orderid, obj) {
      wx.showLoading({ title: '视频连接中...', mask: true })
      setTimeout(() => { wx.hideLoading().then().catch(err => { }) }, 3000)
      self.triggerEvent('acceptcall', { order: self.data.order, doctor: self.data.doctor })
    },
    // 向工作台发送call消息，检测发送状态
    requestGetOrderStatus(orderId) {
    },
    //2.IM--工作台忙碌状态
    workbenchBusy(orderid, obj) {
      self.requestRtcLog('1', 'doctor busy', self.data.orderid);
      if (self.data.isInvite == 1) {
        self.sendCustomerMessage(self.data.command.busy, self.data.realPatientUuid)
        if (self.data.phase != phaseEnum.CALLING) {
          self.showToast('医生正在忙碌中')
        }
        return;
      }
      self.aboutHangUpSomething('医生忙碌返回busy', 'noBack', 'busy');
      self._showModalTip({ content: '医生忙碌中，请稍后再呼' })
    },
    //3.IM--排队中显示排队等待
    workbenchWait(orderid, obj) {
      self.setData({
        'waitTips.waitUserInfoText': obj.msg,
        'waitTips.waitUserInfo': obj
      })
      self.requestRtcLog('1', 'waitTips:' + JSON.stringify(obj.msg), self.data.orderid);
    },
    //4.IM--由排队进入分配医生
    workbenchDispatchDoctorByONS(orderid, obj) {
      self.requestRtcLog('1', 'dispatchDoctorByONS:' + JSON.stringify(obj), self.data.orderid);
      if (self.data.orderid && self.data.orderid != obj.orderId) {
        self.requestRtcLog('1', '非当前订单的分配医生消息，暂不处理', self.data.orderid)
        return
      }
      self.trtcComponent.stopPreview()
      self.setData({
        doctor: obj.doctor,
        orderid: obj.orderId,
        phase: phaseEnum.RINGING
      }, () => {
        self.enterRoom(self.data.command.call)
      })
    },

    //5.IM--回拨 -- 通过doctor条件判定 1.医生 2.专家打来 3.正在接听状态 
    // doctor.serviceTypeStatus   zhuanke: 专家 quanke: 家庭医生
    workbenchCall(orderid, obj, fromId) {
      self.requestRtcLog('1', '回拨 doctor call', orderid);
      if (self.data.orderid && orderid != self.data.orderid) {
        self.sendMessage(self.data.command.busy, orderid, fromId);
        return;
      }
      self.playAudio()
      let doctor = JSON.parse(decodeURIComponent(self._request.doctor));
      let order = JSON.parse(decodeURIComponent(self._request.order))
      let roomID = orderid.slice(orderid.length - 6, orderid.length);
      if (doctor.serviceTypeStatus == 'zhuanke') {
        self.setData({ ['_request.localVideoStatus']: 2 })
      }
      self.setData({
        doctor,
        order,
        roomID,
        orderid,
        userSig: hhDoctor.getUserSig(),
        userID: hhDoctor.getUserId(),
        phase: self.data.isInvite == phaseEnum.RINGING ? phaseEnum.INVITED : (doctor.serviceTypeStatus == 'quanke') ? phaseEnum.DOCTOR_CALL : phaseEnum.EXPERT_CALL
      }, () => {
        self.trtcComponent.startPreview();
        if (self.isManyVideo()) self.setData({ patientStatus: PATIENT_STATUS_ENUM.WAIT })
      })

    },
    //6.IM 转呼 =>走新单号=>agentTransfer=> 重新创建订单
    workbenchAgentTransfer(orderid, obj) {
      self.requestRtcLog('1', 'doctor transfer:' + JSON.stringify(obj), orderid)
      self.trtcComponent.exitRoom('UserExit')
      if (self.data.enterChooseImages || self.data.enterShare) {
        self.aboutHangUpSomething('相册中收到转呼异常挂断')
        self._naviBack()
        return;
      };
      self.requestHangUp('医生发起转呼', 'noBack');
      self.setData({
        isTransfer: self.data.doctor && self.data.doctor.login && self.data.doctor.login.uuid || '',
        doctor: null,
        phase: phaseEnum.TRANSFER,
        preCommand: '',
        createOrderPromise: null,
        isWorkbenchAccept: false,
        orderid: ''
      })
      self.data.isDoctorHangUp = false
      self.data.timerTransfer = setTimeout(() => {
        self._enterCall(orderid, obj.deptId)
      }, 3000);
    },
    //7. 医生挂断=> 转呼、 收到其它单号的挂断、 用户挂断 、异常挂断、都会收到interrupt
    workbenchInterrupt(orderid, obj) {
      if (self.data.phase == phaseEnum.TRANSFER) return
      if (self.data.phase == phaseEnum.EXPERT_CALL) return self._naviBack()
      if (self.data.pageStatus == 'detached') return
      // if (self.data.pageStatus == 'hide') {
      // 	return;
      // }
      if (self.data.isTransfer) {
        self.data.isTransfer = null
        return;
      }
      if (self.data.isClickHangUp) return
      if (self.data.isaboutHangUpSomething) return
      //是否为当前单号 
      if (orderid == self.data.orderid) {
        self.data.isDoctorHangUp = self.roomerCount(1, 1) == 0;
        self.requestRtcLog('1', 'doctor interrupt:' + JSON.stringify(obj), orderid);
        if (self.data.isInvite == 1) {
          self.sendCustomerMessage(self.data.command.interrupt, self.data.realPatientUuid)
        }
        if (self.data.isDoctorHangUp) self.triggerEvent('hangUp')
        //self.trtcComponent.exitRoom('UserExit')
        //self._naviBack()
      }
      if ('cancel' == self.data.preReceivedCommand) {
        //医生回拨取消
        self.trtcComponent.exitRoom('UserExit')
        self._naviBack()
      }
    },
    exitWaitRoomAndCall() {
      self.requestHangUp('退出候诊室选择其他医生', 'noBack');
      self.setData({
        doctor: null,
        order: null,
        phase: phaseEnum.RINGING,
        preCommand: '',
        createOrderPromise: null,
        isWorkbenchAccept: false,
        orderid: ''
      })
      self.data.isDoctorHangUp = false
      self.data.waitRoom = '-1'
      self.data.timerTransfer = setTimeout(() => {
        self._enterCall('', '')
      }, 3000);
    },
    //提前进房等待专家
    waitForExpert(orderid, obj, fromId) {
      self.requestRtcLog('1', '提前进房等待专家', orderid);
      self.playAudio()
      let doctor = JSON.parse(decodeURIComponent(self._request.doctor));
      let order = JSON.parse(decodeURIComponent(self._request.order))
      let roomID = orderid.slice(orderid.length - 6, orderid.length);
      if (doctor.serviceTypeStatus == 'zhuanke') {
        self.setData({ ['_request.localVideoStatus']: 2 })
      }
      self.setData({
        doctor,
        order,
        roomID,
        orderid,
        userSig: hhDoctor.getUserSig(),
        userID: hhDoctor.getUserId(),
        phase: phaseEnum.EXPERT_WAIT
      }, () => {
        self.enterRoom()
        self.trtcComponent.setViewRect({
          userID: hhDoctor.getUserId(),
          streamType: 'main',
          xAxis: '0',
          yAxis: '0r',
          width: '100%',
          height: '100%',
        })
      })

    },
    //多人视频-被邀请人忙碌
    workbenchBusyInvite(orderid) {
      self.showToast('对方正在忙碌中')
      self.requestRtcLog('1', 'member busy', self.data.orderid);
      self.aboutHangUpSomething('对方忙碌返回busy', 'noBack', 'busy');
    },
    //多人视频-呼叫中邀请人取消
    workbenchCancelInvite(orderid) {
      console.log(orderid, self.data.orderid, '收到邀请人取消邀请===')
      if (self.data.orderid != orderid) return;
      self.stopAudio();
      self.aboutHangUpSomething('邀请人点击挂断', 'noBack');
      self.showToast(self.data.order.patientName + '已取消呼叫', 'isBack')
    },
    //多人视频-对端患者挂断
    workbenchInterruptInvite(orderid) {
      console.log(orderid, self.data.orderId, '对端患者挂断消息')
      if (self.data.orderid != orderid) return;
      self.stopAudio();
      //clearInterval(self.data.timerVideoChat);
    },
    //多人视频-被邀请人拒接
    workbenchRejectInvite(orderid, msg) {
      self.stopAudio();
      //self.setData({ isInviteBReject: true })
      self.setData({ patientStatus: PATIENT_STATUS_ENUM.DEFAULT })
      self.showToast((msg && msg.data && msg.data.name || self.data.order.realPatientName) + '拒绝了您的邀请', 'noBack')
      //self.aboutHangUpSomething('被邀请人点击挂断', 'noBack');
    },
    //B收到 A发来的 医生已接听的消息 
    workbenchDoctorAcceptInvite(orderid) {
    },
    //收到白板消息
    workbenchWhiteboard(orderId, msg) {
      if (!self.data.orderid || self.data.orderid != orderId) return
      let url = apis.getWhiteboardUrl(msg.groupId, orderId, self.data.videoTimeStart)
      console.error(url)
      self.setData({ whiteboardVisible: 'conference_begin' == msg.command, whiteboardUrl: 'conference_begin' == msg.command ? url : '' })
      console.log(wx)
    },
    /** 进入摄像头 */
    workbenchEnterCamera(orderId, msg, from, to) {
      self.setData({ patientStatus: PATIENT_STATUS_ENUM.HOLDON })
    },
    /** 离开摄像头 */
    workbenchExitCamera(orderId, msg, from, to) {
      self.setData({ patientStatus: PATIENT_STATUS_ENUM.DEFAULT })
    },
    /** 医生触发用户实名认证 */
    workbenchUserAuth(orderId, msg, from, to) {
      console.log('>>> workbenchUserAuth', msg, from, to)
      let reanNameUuid = msg.uuid
      apis.requestGetBaseUserInfo(msg.uuid).then(res => {
        self.setData({
          realPatientUuid: msg.uuid,
          realPatientUserToken: res.data.userToken,
          realPatientName: res.data.name,
        })
        self.selectComponent('#trtcCamera').showRealname();
      }).catch(err => { console.error(err) })
    },
    //回拨接听
    bindAccept() {
      self.requestRtcLog('1', 'user click accept', self.data.orderid);
      apis.requestCallResponse(self.data.orderid);
      self.stopAudio();
      self.trtcComponent.stopPreview();
      self.sendMessage(self.data.command.ACCEPT, '', self.data._request.caller).then(res => {
        self.enterRoom()
        self.setData({ phase: phaseEnum.CALLING })
        self._startVideoTimer();
        if (self.data._request.localVideoStatus < 1) {
          //发消息通知医生，用户主动关闭本地视频
          self.requestRtcLog('1', '回拨接听时用户未开启本地视频', self.data.orderid);
          self.sendMessage(self.data.command.SWITCH_TO_AUDIO_USER);
        }
      })
    },
    //多人视频-phase-g B接听 
    bindInviteAccept() {
      self.stopAudio();
      self.trtcComponent.stopPreview();
      self.enterRoom()
      //检查医生是否接听
      self.requestGetOrderStatus(self.data.orderid)
      if (self.data.isWorkbenchAccept) {
        self.setData({ phase: phaseEnum.CALLING })
        self._startVideoTimer();
      } else {
        //通知邀请人A 已接听
        self.setData({ phase: phaseEnum.RINGING })
      }
    },
    //多人视频-phase-gB点击拒接 通知A
    bindInviteHangUp() {
      //正常点击挂断不走requestHangUp
      self.sendCustomerMessage(self.data.command.reject_invite, self.data.order.patientUuid, { name: hhDoctor.getUserName() });
      self.trtcComponent.stopAutoPush()
      self._naviBack()
    },
    //用户点击挂断
    bindHangUp() {
      self.data.isClickHangUp = true;
      self.requestRtcLog('1', 'user click hangup', self.data.orderid);
      // 如果是回拨 向工作台发送reject 且不联网
      if (self.data.phase == phaseEnum.DOCTOR_CALL) {
        self.sendMessage(self.data.command.REJECT);
        return wx.navigateBack()
      }
      self.aboutHangUpSomething('用户点击挂断', 'isBack');
    },
    /** 用户等待中取消 */
    bindCancel() {
      self.requestRtcLog('1', '用户取消提前进房等待专家', self.data.orderid);
      self.stopAudio()
      self.trtcComponent.unpublishLocalAudio()
      self.trtcComponent.unpublishLocalVideo()
      self.trtcComponent.exitRoom('UserExit')
      self.data.isClickHangUp = true;
      return wx.navigateBack()
    },
    //点击挂断 左滑 压后台 拍照需要处理的事情 转呼单独处理不进入该函数内
    aboutHangUpSomething(reason, isBack, isBusy) {
      if (!self.data.orderid) return self._naviBack()
      self._getClearTimer()
      if (self.data.isaboutHangUpSomething) return
      self.requestRtcLog('1', 'aboutHangUpSomething：' + reason, self.data.orderid);
      self.data.isaboutHangUpSomething = true;
      self.stopAudio();
      if (self.isManyVideo() && self.data.isClickHangUp && !self.isRealPatient()) {
        //多人视频，当前用户主动挂断，且不是实际患者时，通知实际患者
        self.sendCustomerMessage(self.data.hangupcommand_invite[self.data.phase], self.data.realPatientUuid);
      }
      self.requestHangUp(reason, isBack);
      if (self.data.isClickHangUp) {
        self.trtcComponent.exitRoom('UserExit');
      }
      self.triggerEvent('hangUp')
    },
    enterRoom(command) {
      console.log('* room enterRoom', command)
      if (self.isManyVideo()) self.setData({ patientStatus: PATIENT_STATUS_ENUM.WAIT })
      self.data.roomCommand = command;
      self.requestRtcLog('1', 'room enterRoom:' + command || '', self.data.orderid);
      let rtcConfig = {
        userID: self.data.userID,
        userSig: self.data.userSig
      };
      Object.assign(this.data.rtcConfig, rtcConfig);
      this.setData({ rtcConfig: this.data.rtcConfig }, () => {
        //this.resetPusherView()
        this.data.enterRoomPromise = this.trtcComponent.enterRoom({
          roomID: self.data.roomID,
        }).then(res => {
          console.log('* room joinRoom 进房成功:');
          self.requestRtcLog('1', 'room enterRoom then', self.data.orderid);
          // 真正进房成功需要通过 1018 事件通知
          // view 渲染成功回调后，开始推流
          //bindTRTCRoomEvent 监听用户进房成功与否 异常问题

        }).catch(res => {
          wx.hideLoading()
          self.requestRtcLog('1', 'room enterRoom catch', self.data.orderid);
          // 进房失败需要通过 pusher state 事件通知，目前还没有准确的事件通知
          self.aboutHangUpSomething('连接服务器超时');
          self._showModalTip({ content: '连接服务器超时' })
          console.error('* room enterRoom init fail:', res);
        });
      })

    },
    playAudio() {
      if (self.data.isaboutHangUpSomething) return;
      if (!audioContext) audioContext = wx.createInnerAudioContext();
      audioContext.stop()
      audioContext.src = self.data.audio.url;
      audioContext.loop = true;
      setTimeout(() => {
        audioContext.play();
        console.log('开始响铃')
        self.requestRtcLog('1', 'audio play:' + self.data.audio.url, self.data.orderid);
      }, 100);
    },
    stopAudio() {
      if (audioContext) {
        self.requestRtcLog('1', 'audio stop ', self.data.orderid);
        audioContext.stop();
        audioContext.destroy();
        audioContext = null
      }
    },
    //进入或相机-静音publishLocalAudio
    bindEnterCamera(e) {
      let type = e.detail;
      self.requestRtcLog('1', '准备进入相册', self.data.orderid);
      self.setData({ enterChooseImages: true, })
      let cmd = self.data.localVideoStatus < 1 ? self.data.command.SWITCH_TO_AUDIO_USER : self.data.command.SWITCH_TO_AUDIO
      this.sendMessage(cmd)
      self.getInveterCamera();
      self.selectComponent('#trtcCamera').joinCameraFun(type);
      if (self.data.isInvite == 1) {
        let toUser = self.data.userID == self.data.order.patientUuid ? self.data.order.realPatientUuid : self.data.order.patientUuid;
        self.sendCustomerMessage(self.data.command.enter_camera, toUser);
      }
    },

    //跳出相册或相机publishLocalAudio
    bindCompleteCamera() {
      self.requestRtcLog('1', '跳出相册', self.data.orderid);
      self.setData({ enterChooseImages: false })
      clearInterval(self.data.cameraInterval);
      this.trtcComponent.publishLocalAudio()
      this.trtcComponent.publishLocalVideo()
      let cmd = self.data._request.localVideoStatus < 1 ? self.data.command.SWITCH_TO_AUDIO_USER : self.data.command.SWITCH_TO_VIDEO
      this.sendMessage(cmd)
      if (this.data.isInvite == 1) {
        this.trtcComponent.allRemoteAudio();
      }
      if (self.data.isInvite == 1) {
        let toUser = self.data.userID == self.data.order.patientUuid ? self.data.order.realPatientUuid : self.data.order.patientUuid;
        self.sendCustomerMessage(self.data.command.exit_camera, toUser);
      }
    },
    getInveterCamera() {
      clearInterval(self.data.cameraInterval);
      self.sendMessage(self.data.command.SWITCH_TO_CAMERA);
      self.data.cameraInterval = setInterval(res => {
        self.sendMessage(self.data.command.SWITCH_TO_CAMERA);
      }, 5000)
    },
    // 给邀请人发送消息
    sendCustomerMessage(command, toUser, data) {
      self.requestRtcLog('1', 'inviter member start:' + command, self.data.orderid);
      console.log('inviter member start:', command)
      if (self.data.preInviteCommand == command) return;
      self.data.preInviteCommand = command;
      apis.sendCustomerMessage(hhDoctor.getUserId() || self.data.rtcConfig.userID || self.data.order.realPatientUuid, toUser, command, self.data.orderid, data).then(res => {
        if (res.status == 200) {
          console.log('inviter member success:', command)
          self.requestRtcLog('1', 'inviter member success:' + command, self.data.orderid);
        }
      }).catch(res => self.requestRtcLog('1', '邀请成员消息发送失败', self.data.orderid))
    },

    /** 处理TRTC上报的事件 */
    bindTRTCRoomEvent() {
      const TRTC_EVENT = this.trtcComponent.EVENT
      this.timestamp = []
      //1.本地进房成功 
      this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
        if (self.data.pageStatus == 'hide' || self.data.pageStatus == 'detached' || self.data.isaboutHangUpSomething || self.data.phase == phaseEnum.TRANSFER) return;
        console.log('* room LOCAL_JOIN', event)
        self.requestRtcLog('1', 'room LOCAL_JOIN（进房成功）:' + JSON.stringify(event), self.data.orderid);
        self.roomerJoin(event.data.userID)
        if (self.data.roomCommand && self.data.phase != phaseEnum.CALLING) {
          switch (self.data.roomCommand) {
            case 'call':
              self.playAudio();
              if (self.data.isInvite == 1) {
                if (self.data.isDoctorHangUp) return;
                if (self.data.isaboutHangUpSomething) return;
                self.sendCustomerMessage(self.data.command.call_invite, self.data.realPatientUuid);
              }
              self.sendMessage(self.data.roomCommand).then(res => {
                self.requestGetOrderStatus(self.data.orderid);
              }).catch(err => console.error(err));
              break;
          }
        }
        if (this.data.localVideo === true || this.data.template === 'custom') {
          if (self.data.phase == phaseEnum.RINGING || self.data.phase == phaseEnum.CALLING) {
            this.trtcComponent.publishLocalVideo()
            this.trtcComponent.publishLocalAudio()
          }
        }
        if (self.data.phase == phaseEnum.EXPERT_WAIT) {
          //提前进房等待专家呼叫
          wx.hideLoading()
          wx.showToast({ title: '已进入房间', icon: 'none' })
        }
      })
      //2.监听本地退房
      this.trtcComponent.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
        self.requestRtcLog('1', 'room LOCAL_LEAVE:' + JSON.stringify(event), self.data.orderid);
        self.roomerLeave(event.data.userID)
        console.log('* room LOCAL_LEAVE', event)
      })
      //3.通话异常报错ERROR本地推流出现错误、渲染错误事件等。
      this.trtcComponent.on(TRTC_EVENT.ERROR, (event) => {
        self.requestRtcLog('1', 'room ERROR:' + JSON.stringify(event), self.data.orderid);
        console.log('* room ERROR', event)
        //转呼中、用户主动点击挂断情况下，收到房间错误，暂不处理 mayonglei
        //if (self.data.phase == phaseEnum.TRANSFER || self.data.isaboutHangUpSomething) return
        if ((self.data.phase != phaseEnum.CALLING && self.data.phase != phaseEnum.DOCTOR_CALL && self.data.phase != phaseEnum.EXPERT_CALL)
          || self.data.phase == phaseEnum.QUEUE || self.data.isaboutHangUpSomething) return
        self.stopAudio();
        self.aboutHangUpSomething('异常' + event.data.msg + '-code:' + event.data.code);
        self._showModalTip({ content: event.data.msg + ',建议重启微信后呼叫医生' || '通话异常中断，重启微信后呼叫医生', isExitWx: true })
      })
      //4.远端用户进房
      this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
        if (self.data.isaboutHangUpSomething) return;
        let userlist = this.trtcComponent.getRemoteUserList()
        if (userlist.length) {
          userlist.map((item, index) => {
            if (item.userID == self.data.order.realPatientUuid) self.stopAudio()
          })
          console.error('>>> RemoteUserCount:', userlist.length)
          self.setData({ remoteUserCount: userlist.length })
        }
        self.requestRtcLog('1', 'room REMOTE_USER_JOIN:' + JSON.stringify(event), self.data.orderid);
        if (self.isPatient(event.data.userID)) {
          self.patientWait(event.data.userID)
          self.setData({ patientName: self.getPatientName(event.data.userID) })
        } else self.doctorWait(event.data.userID)
        self.roomerJoin(event.data.userID)
        console.log('* room REMOTE_USER_JOIN', event, this.trtcComponent.getRemoteUserList())
        if (self.data.phase == phaseEnum.EXPERT_WAIT) {
          //提前进房后，专家已经进房
          self.stopAudio();
          self.setData({ phase: phaseEnum.CALLING })
          //将本地推流窗口放回默认位置
          self.trtcComponent.setViewRect({
            userID: hhDoctor.getUserId(),
            streamType: 'main',
            xAxis: '',
            yAxis: '',
            width: '',
            height: '',
          })
          self.trtcComponent && self.trtcComponent.publishLocalVideo && self.trtcComponent.publishLocalVideo()
          self.trtcComponent && self.trtcComponent.publishLocalAudio && self.trtcComponent.publishLocalAudio()
          self.requestRtcLog('1', '专家进房，开始沟通', self.data.orderid);
          self._startVideoTimer();
        }
        this.timestamp.push(new Date())
        if (self.data._request.localVideoStatus < 1) {
          //发消息通知医生，用户主动关闭本地视频
          self.data.preCommand = ''
          self.requestRtcLog('1', '发消息通知远端医生用户主动关闭本地视频', self.data.orderid);
          self.sendMessage(self.data.command.SWITCH_TO_AUDIO_USER);
        }
      })
      //5.远端用户退房
      this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
        self.requestRtcLog('1', 'room REMOTE_USER_LEAVE:' + JSON.stringify(event), self.data.orderid);
        self.roomerLeave(event.data.userID)
        let userlist = this.trtcComponent.getRemoteUserList()
        if (userlist.length) {
          console.error('>>> RemoteUserCount:', userlist.length)
          self.setData({ remoteUserCount: userlist.length })
        }
        console.log('* room REMOTE_USER_LEAVE', event, this.trtcComponent.getRemoteUserList(), 'isTransfer:', self.data.isTransfer)
        if (self.isPatient(event.data.userID)) {
          self.setData({ patientStatus: PATIENT_STATUS_ENUM.DEFAULT })
          self.showToast(self.data.patientName + '已挂断', 'noBack')
        }
        if (self.data.pageStatus == 'hide') return
        if (self.data.pageStatus == 'detached') return
        if (self.data.isTransfer && parseInt(self.data.isTransfer) == parseInt(event.data.userID)) {
          console.log('>>> 转呼医生退房')
          self.data.isTransfer = null
          return;
        }
        if (self.data.isClickHangUp) return
        if (self.data.enterChooseImages || self.data.enterShare) return;
        console.log('>>> roomDismissed:', self.roomDismissed())
        if (self.roomDismissed()) {
          //房间已解散
          self.trtcComponent.exitRoom('UserExit')
          self.aboutHangUpSomething('医生主动挂断', 'isBack')
          //self._naviBack()
        } else self.resetViewRect()
      })
      //6.远端用户推送视频
      this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
        self.requestRtcLog('3', 'room REMOTE_VIDEO_ADD_远端用户推送视频', self.data.orderid);
        console.log('* room REMOTE_VIDEO_ADD(远端用户推送视频)', event, this.trtcComponent.getRemoteUserList())
        // 订阅视频
        const userList = this.trtcComponent.getRemoteUserList()
        const data = event.data
        this.trtcComponent.subscribeRemoteVideo({
          userID: data.userID,
          streamType: data.streamType,
        })
        // 标记该用户已首次订阅过
        this.data.subscribeList[data.userID + '-video'] = true
        //}
        self.resetViewRect()
        if (self.isPatient(event.data.userID)) self.setData({ patientStatus: PATIENT_STATUS_ENUM.DEFAULT })
        else if (self.data.phase == phaseEnum.RINGING) self.doctorAccept()
        wx.hideLoading().then().catch(err => { })
      })
      //7.远端用户取消推送视频
      this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
        self.requestRtcLog('1', 'room REMOTE_VIDEO_REMOVE_远端用户取消推送视频' + JSON.stringify(event), self.data.orderid);
        console.log('* room REMOTE_VIDEO_REMOVE(远端用户取消推送视频)', event, this.trtcComponent.getRemoteUserList())
        if (self.isPatient(event.data.userID)) {
          self.setData({ patientStatus: PATIENT_STATUS_ENUM.HOLDON })
          self.showToast(self.data.patientName + '暂时离开', 'noBack')
        }
      })
      //8.远端用户推送音频
      this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
        self.requestRtcLog('1', 'room REMOTE_AUDIO_ADD_远端用户推送音频' + JSON.stringify(event), self.data.orderid);
        console.log('* room REMOTE_AUDIO_ADD(远端用户推送音频)', event, this.trtcComponent.getRemoteUserList())
        // 订阅音频
        const data = event.data
        if (!this.remoteUser || this.remoteUser === data.userID) {
          this.remoteUser = data.userID
          this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })
        } else {
          this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })
          // 标记该用户已首次订阅过
          this.data.subscribeList[data.userID + '-audio'] = true
        }
      })
      //9.远端用户取消推送音频
      this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
        self.requestRtcLog('1', 'room REMOTE_AUDIO_REMOVE_远端用户取消推送音频:' + JSON.stringify(event), self.data.orderid);
        console.log('* room REMOTE_AUDIO_REMOVE', event, this.trtcComponent.getRemoteUserList())
      })
      //10.本地音量发生变化
      this.trtcComponent.on(TRTC_EVENT.LOCAL_AUDIO_VOLUME_UPDATE, (event) => {
        // self.requestRtcLog('1', 'room LOCAL_AUDIO_VOLUME_UPDATE:' + JSON.stringify(event), self.data.orderid);
        // console.log('* room LOCAL_AUDIO_VOLUME_UPDATE', event)
      })
      //11.REMOTE_NET_STATE_UPDATE
      this.trtcComponent.on(TRTC_EVENT.REMOTE_NET_STATE_UPDATE, (event) => {
        console.log('* room REMOTE_NET_STATE_UPDATE', event)
        self._onRemoteNetStateUpdate(event.data.detail.info)
      })
      //12.LOCAL_NET_STATE_UPDATE
      this.trtcComponent.on(TRTC_EVENT.LOCAL_NET_STATE_UPDATE, (event) => {
        console.log('* room LOCAL_NET_STATE_UPDATE', event)
        self._onLocalNetStateUpdate(event.data.detail.info)
      })
      //13.自定义事件：用户点击右上角的开关本地视频按纽
      this.trtcComponent.on('CUSTOMER_EVENT_OPEN_CLOSE_LOCAL_VIDEO', (event) => {
        let status = event.data.localVideoStatus
        this.setData({ ['_request.localVideoStatus']: status })
        self.requestRtcLog('1', '用户点击右上角主动' + (status == 1 ? '开启' : '关闭') + '本地摄像头', self.data.orderid);
        self.sendMessage(status == 1 ? self.data.command.SWITCH_TO_VIDEO_USER : self.data.command.SWITCH_TO_AUDIO_USER);
      })
    },
    /** 远端用户进房、退房时，重设播放器布局 */
    resetViewRect() {
      let fullScreenDoctor = false, i = 0
      this.trtcComponent.getRemoteUserList().forEach(user => {
        console.log('>>> resetViewRect user:', user)
        let sysInfo = wx.getSystemInfoSync()
        if (this.isPatient(user.userID)) {
          //TODO:被邀请人
          console.log('>>> 患者进房')
          this.trtcComponent.setViewRect({
            userID: user.userID,
            streamType: 'main',
            xAxis: '490rpx',
            yAxis: this.data.clientRect.bottom + 170 + 'px',
            width: '240rpx',
            height: '320rpx',
          })
          this.trtcComponent.setViewZIndex({
            userID: user.userID,
            streamType: 'main',
            zIndex: 900
          })
        } else {
          this.trtcComponent.setViewRect({
            userID: user.userID,
            streamType: 'main',
            xAxis: fullScreenDoctor ? '490rpx' : '0',
            yAxis: fullScreenDoctor ? (this.data.clientRect.bottom + 165 * i + 5 + 'px') : '0',
            width: fullScreenDoctor ? '240rpx' : sysInfo.windowWidth + 'px',
            height: fullScreenDoctor ? '320rpx' : sysInfo.windowHeight + 'px',
          })
          this.trtcComponent.setViewZIndex({
            userID: user.userID,
            streamType: 'main',
            zIndex: fullScreenDoctor ? 9 : 1
          })
          fullScreenDoctor = true
          i++
        }
      })
    },
    /** 根据userID判断是否为患者 */
    isPatient(userId) {
      return parseInt(userId) == parseInt(this.data.order.patientUuid) || parseInt(userId) == parseInt(this.data.order.realPatientUuid)
    },
    /** 当前用户是否为实际患者 */
    isRealPatient() {
      return this.data.order && parseInt(hhDoctor.getUserId()) == parseInt(this.data.order.realPatientUuid)
    },
    /** 根据userID获取姓名 */
    getPatientName(userId) {
      if (parseInt(userId) == parseInt(this.data.order.patientUuid)) return this.data.order.patientName
      return this.data.order.realPatientName
    },
    /** 是否为多人视频 */
    isManyVideo() {
      return self.data.order && self.data.order.orderType && 'many_video' == self.data.order.orderType ? true : false
    },
    requestPip(e) {
      //console.log('>>> requestPip', e)
      let userID = this.data.doctor.login.uuid + '', streamType = 'main'
      //console.log('>>> requestPip:', userID)
      self.setData({ enterShare: true })
      //self.trtcComponent.enterPictureInPicture({ userID, streamType })
      self.triggerEvent('invite', e.detail)
    },
    doctorAccept() {
      console.log('>>> 医生进房')
      if (self.data.phase == phaseEnum.RINGING || self.data.phase == phaseEnum.CALLING) {
        self.trtcComponent && self.trtcComponent.publishLocalVideo && self.trtcComponent.publishLocalVideo()
        self.trtcComponent && self.trtcComponent.publishLocalAudio && self.trtcComponent.publishLocalAudio()
      }
      self.stopAudio();
      self.setData({
        phase: phaseEnum.CALLING,
        isWorkbenchAccept: true
      })
      self.requestRtcLog('1', 'doctor accept-进入视频界面', self.data.orderid);
      self._startVideoTimer();
      if (self.data._request.localVideoStatus < 1) {
        //发消息通知医生，用户主动关闭本地视频
        self.requestRtcLog('1', '医生接听时用户未开启本地视频', self.data.orderid);
        self.sendMessage(self.data.command.SWITCH_TO_AUDIO_USER);
      }
    }
  }
})
