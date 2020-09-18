// components/hh-trtc/hh-trtc.js
const apis = require('../utils/api.js')
const dateUtil = require('../utils/dateUtil.js')
const hhDoctor = require('../hhDoctor.js');
let audioContext;
let self;
Component({
	behaviors: [require('../hhBehaviors.js'), require('./rtcBehaviors.js')],
	data: {
		_name: 'hh-trtc',
		phase: 1,//默认1 呼叫中
		rtcConfig: {
			sdkAppID: '1400073238', // 必要参数 开通实时音视频服务创建应用后分配的 sdkAppID
			userID: '', // 必要参数 用户 ID 可以由您的帐号系统指定
			userSig: '', // 必要参数 身份签名，相当于登录密码的作用
			template: '1v1', // 必要参数 组件模版，支持的值 1v1 grid custom ，注意：不支持动态修改, iOS 不支持 pusher 动态渲染
			maxBitrate: 1000,
			minBitrate: 2000,
			beautyLevel: 0 , // 开启美颜等级 0～9级美颜
			enableIM: false, // 可选，仅支持初始化设置（进房前设置），不支持动态修改
		},
		template: '1v1',
		subscribeList: {},
		callTips: {
			callintTip: '医生连线中，请耐心等待...',
			callintTipQueue: '拨号中...',
			callintTipTransfer: '拨号中...'
		},
		realPatientUuid:'',
		waitTips: null,
		preCallResponse: null,
		doctor: null,
		order: null,
		orderid: '',
		roomID: '',
		isTransfer: false,
		pageStatus: '',
        isaboutHangUpSomething:false,
        roomCommand:'',
	},
	lifetimes: {
        created(){},
		ready() {
			self = this;
		},
		detached() {
			this.data.pageStatus = 'detached'
			this._pageLifeExit()
		}
	},
	pageLifetimes: {
		show() {
			this.data.pageStatus = 'show'
			this._pageLifeExit()
		},
		hide() {
			this.data.pageStatus = 'hide'
			this._pageLifeExit()
		}
	},
	methods: {
		_pageLifeExit() {
			let self = this;
			let pageStatus = this.data.pageStatus;
			let phase = self.data.phase;
			switch (pageStatus) {
				case 'show':
                    self.requestRtcLog(1, 'life:show' , self.data.orderid);
					if (phase == 0) wx.navigateBack();
                    self._onMemoryWarning();
                    self._onNetworkStatusChange();
                    self._getNetWorkType();
					break;
				case 'hide':
					self._exitHideAndDetached('life:hide','用户压后台挂断')			
					break;
				case 'detached':
					hhDoctor.off('messageReceived');
					self._exitHideAndDetached('life:detached','页面卸载')
					break;
			}
		},
		_exitHideAndDetached(life,text){
			self.requestRtcLog(1, life, self.data.orderid);
			self.stopAudio();
			wx.offMemoryWarning();
			wx.offNetworkStatusChange();
			if (self.data.isClickHangUp) return;
			if (self.data.isDoctorHangUp) return;
			if (self.data.isaboutHangUpSomething) return;
			if (self.data.enterChooseImages) return;
			// self.trtcComponent.unpublishLocalAudio();
			if (self.data.createOrderPromise) {
				self.data.createOrderPromise.then(res => {
					self.aboutHangUpSomething(text,'isBack');
				})
			} else {
				self.aboutHangUpSomething(text,'isBack');
			}
		},
		_requestComplete() {
			console.log('onLoad======>',this.data._request)
			self = this;
			this.trtcComponent = this.selectComponent('#trtc-component')
			this._request = this.data._request;
			self._checkAuthorize().then(res => {
                self.requestRtcLog(1, 'authorize: check success');
				self.setData({
					isAuthBox: false
				})
				self.componentOnload();
			}).catch(res => {
                self.requestRtcLog(1, 'authorize: check fail');
				self.setData({
					isAuthBox: true
				})
			});
		},
		
		componentOnload() {
            this.data.trtcComponent = this.trtcComponent;
            this.bindTRTCRoomEvent();
            self._workbenchRegist();
            self._registMessageReceived();
            self.data.realPatientUuid = self.data._request.uuid || 0; //选择成员呼叫需携带成员id 进入评价页需传入成员或用户i
			if (self._request.dept.indexOf('F') == 0) {
				console.log('*回拨')
				self.workbenchCall(self._request.orderid);
			} else {
				self._enterCall();
			}
		},
		//进入呼叫
		_enterCall(orderid, deptId) {
            self.requestRtcLog('1', 'enter call start', self.data.orderid);
			self._requestCreateFamOrder(orderid, deptId);
		},
		//1.IM--工作台已接听
		workbenchAccept(orderid, obj) {
			console.log('* 医生接听=====', orderid)
			if (orderid == self.data.orderid) {
				if (self.data.isWorkbenchAccept) {
					return;
				}
				self.stopAudio();
				self.setData({
					phase: 3,
					isWorkbenchAccept: true
				})
                self.requestRtcLog('1', 'doctor accept-进入视频界面', self.data.orderid);
				self._startVideoTimer();
			}
		},
		// 向工作台发送call消息，检测发送状态
		requestGetOrderStatus(orderId) {
			self.data.timerGetStatus = setInterval(res => {
				//工作台已接听则无需继续往下走
                if (self.data.isWorkbenchAccept || self.data.phase == 3 || self.data.pageStatus == 'hide' || self.data.pageStatus =='detached') {
					clearInterval(self.data.timerGetStatus);
					return;
				}
                self.requestRtcLog('1', 'getOrderStatus-检查医生是否接听', self.data.orderid);
				apis.requestGetOrderStatus(orderId).then(res => {
					if (res.data) {
						clearInterval(self.data.timerGetStatus);
						self.workbenchAccept(orderId, res.data);
					}
				});
			}, 2000);
		},
		//2.IM--工作台忙碌状态
		workbenchBusy(orderid, obj) {
            self.requestRtcLog('1', 'doctor busy', self.data.orderid);
			self.aboutHangUpSomething('医生忙碌返回busy');
            self._showModalTip({ content: '医生忙碌中，请稍后再呼' })
		},

		//3.IM--排队中显示排队等待
		workbenchWait(orderid, obj) {
			self.setData({
				'waitTips.waitUserInfoText': obj.msg
			})
            self.requestRtcLog('1', 'waitTips:'+JSON.stringify(obj.msg), self.data.orderid);

		},
		//4.IM--由排队进入分配医生
		workbenchDispatchDoctorByONS(orderid, obj) {
            self.requestRtcLog('1', 'dispatchDoctorByONS:' + JSON.stringify(obj), self.data.orderid);
			self.setData({
				doctor: obj.doctor,
				orderid: obj.orderId,
				phase: 1
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
			let doctor = JSON.parse(self._request.doctor);
			console.log('doctor',doctor)

			let roomID = orderid.slice(orderid.length - 6, orderid.length);
			self.setData({
				doctor,
				roomID,
				orderid,
				userSig: hhDoctor.getUserSig(),
				userID: hhDoctor.getUserId(),
				phase: doctor.serviceTypeStatus == 'quanke' ? 4 : 5
			},()=>{
				
			})
		},
		//6.IM 转呼 =>走新单号=>agentTransfer=> 重新创建订单
		workbenchAgentTransfer(orderid, obj) {
            self.requestRtcLog('1', 'doctor transfer:' + JSON.stringify(obj), orderid);
			self.requestHangUp('医生发起转呼', 'noBack');
            self.trtcComponent.exitRoom('UserExit');
			self.setData({
				isTransfer: true,
				doctor: null,
				phase: 0,
				preCommand: '',
				createOrderPromise: null,
				isWorkbenchAccept: false
            })
			self.data.timerTransfer = setTimeout(() => {
				self._enterCall(orderid, obj.deptId)
			}, 3000);
		},
		//7. 医生挂断=> 转呼、 收到其它单号的挂断、 用户挂断 、异常挂断、都会收到interrupt
		workbenchInterrupt(orderid, obj) {
			if (self.data.pageStatus == 'detached') {
				return;
			}
			// if (self.data.pageStatus == 'hide') {
			// 	return;
			// }
			if (self.data.isTransfer) {
				self.data.isTransfer = false;
				return;
			}
			if(self.data.isClickHangUp){
				return;
			}
			//是否为当前单号 
			if (orderid == self.data.orderid) {
				self.data.isDoctorHangUp = true;
                self.requestRtcLog('1', 'doctor interrupt:' + JSON.stringify(obj), orderid);  
                self.trtcComponent.exitRoom('UserExit')
                wx.navigateBack();                 
				// self.aboutHangUpSomething(obj.command);
			}

		},

		//回拨接听
		bindAccept() {
            self.requestRtcLog('1', 'user click accept' , self.data.orderid);
            apis.requestCallResponse(self.data.orderid);
            self.stopAudio()
			self.sendMessage(self.data.command.ACCEPT).then(res=>{
                self.enterRoom()
				self.setData({phase: 3})
				self._startVideoTimer();
			})

		},
		//用户点击挂断
		bindHangUp() {
			self.data.isClickHangUp = true;
            self.requestRtcLog('1', 'user click hangup', self.data.orderid);
			self.aboutHangUpSomething('用户点击挂断','isBack');
			
		},
		//点击挂断 左滑 压后台 拍照需要处理的事情 转呼单独处理不进入该函数内
		aboutHangUpSomething(reason, isBack) {
			if(!self.data.orderid){
				wx.navigateBack()
				return;
			}

            if (self.data.isaboutHangUpSomething)return;
            self.requestRtcLog('1', 'aboutHangUpSomething：'+reason, self.data.orderid);
            self.data.isaboutHangUpSomething=true;
			self.stopAudio();
			self._getClearTimer()
            // if (self.data.pageStatus=='hide'){
            //   self.sendMessage(self.data.hangupcommand[self.data.phase])
            // }
            self.requestHangUp(reason, isBack);
            self.trtcComponent.exitRoom('UserExit');
		},
		enterRoom(command) {
			console.log('* room enterRoom', command)
            self.requestRtcLog('1', 'room enterRoom:' + command||'', self.data.orderid);
			let rtcConfig = {
				userID: self.data.userID,
				userSig: self.data.userSig
			};
			Object.assign(this.data.rtcConfig, rtcConfig);
			this.setData({
				rtcConfig: this.data.rtcConfig
			}, () => {
				this.trtcComponent.enterRoom({
					roomID: self.data.roomID,
				}).then(res => {
                    
					console.log('* room joinRoom 进房成功:');
                    self.requestRtcLog('1', 'room enterRoom init success', self.data.orderid);
                    self.data.roomCommand = command;
                    // 真正进房成功需要通过 1018 事件通知
                    // view 渲染成功回调后，开始推流
                    //bindTRTCRoomEvent 监听用户进房成功与否 异常问题
				}).catch(res => {
                    self.requestRtcLog('1', 'room enterRoom init fail', self.data.orderid);
                   // 进房失败需要通过 pusher state 事件通知，目前还没有准确的事件通知
                    self.aboutHangUpSomething('连接服务器超时');
                    self._showModalTip({content:'连接服务器超时'})
					console.error('* room enterRoom init fail:', res);
				});
			})

		},
		playAudio(){
            if (self.data.isaboutHangUpSomething)return;
            if (!audioContext){
                audioContext = wx.createInnerAudioContext();
            }
			audioContext.src = self.data.audio.url;
			audioContext.loop = true;
			audioContext.play();
            console.log('开始响铃')
            self.requestRtcLog('1', 'audio play', self.data.orderid);

		},
		stopAudio(){
            if (audioContext){
                self.requestRtcLog('1', 'audio stop ', self.data.orderid);
                audioContext.stop();
                audioContext.destroy();
                audioContext = null
            }
		},
		//进入或相机-静音publishLocalAudio
		bindEnterCamera() {
			console.log('进入相册')
			self.requestRtcLog('1', '进入相册', self.data.orderid);
            self.setData({
				enterChooseImages: true,
				isFromCamera:false
			})
			if(self.data.s[0]=='iOS'&& self.data.w[self.data.w.length-1]>=15 ){
				self.sendMessage(self.data.command.SWITCH_TO_AUDIO+'_iOS_7.0.15');
			}
			self.sendMessage(self.data.command.SWITCH_TO_AUDIO);
			self.trtcComponent.unpublishLocalAudio();
			self.trtcComponent.unsubscribeRemoteAudio({userID: self.data.rtcConfig.userID});
		},
		//跳出相册或相机publishLocalAudio
		bindCompleteCamera() {
			console.log('跳出相册')
			self.requestRtcLog('1', '跳出相册', self.data.orderid);
            self.setData({
				enterChooseImages: false,
				isFromCamera:true

			})
			if(self.data.s[0]=='iOS'&& self.data.w[self.data.w.length-1]>=15 ){
				self.sendMessage(self.data.command.SWITCH_TO_VIDEO+'_iOS_7.0.15');
			}
			self.sendMessage(self.data.command.SWITCH_TO_VIDEO);
			self.trtcComponent.subscribeRemoteAudio({userID: self.data.rtcConfig.userID})
			self.trtcComponent.publishLocalAudio();
			self.trtcComponent.publishLocalVideo();
		},
		bindTRTCRoomEvent() {
			const TRTC_EVENT = this.trtcComponent.EVENT
			this.timestamp = []
			//1.本地进房成功
			this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
				console.log('* room LOCAL_JOIN', event)
				self.requestRtcLog('1', 'room LOCAL_JOIN（进房成功）:' + JSON.stringify(event), self.data.orderid); 
                if (self.data.roomCommand && self.data.phase !=3) {
                    switch (self.data.roomCommand) {
                        case 'call':
                            self.playAudio();
                            self.sendMessage(self.data.roomCommand);
                            self.requestGetOrderStatus(self.data.orderid);
                            break;
                    }
                }
				// 进房成功，触发该事件后可以对本地视频和音频进行设置
				if (this.data.localVideo === true || this.data.template === '1v1') {
					this.trtcComponent.publishLocalVideo()
				}
				if (this.data.localAudio === true || this.data.template === '1v1') {
					this.trtcComponent.publishLocalAudio()
				}
			})
            //2.监听本地退房
			this.trtcComponent.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
                self.requestRtcLog('1', 'room LOCAL_LEAVE:' + JSON.stringify(event), self.data.orderid);
				console.log('* room LOCAL_LEAVE', event)
			})
            //3.通话异常报错ERROR本地推流出现错误、渲染错误事件等。
			this.trtcComponent.on(TRTC_EVENT.ERROR, (event) => {
                self.requestRtcLog('1', 'room ERROR:' + JSON.stringify(event), self.data.orderid);
				console.log('* room ERROR', event)
                self.stopAudio();
                self.aboutHangUpSomething('异常'+event.data.msg+'-code:'+event.data.code);
                self._showModalTip({ content: '通话异常中断，重启微信后呼叫医生' ,isExitWx:true})
			})
			//4.远端用户进房
			this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
                self.requestRtcLog('1', 'room REMOTE_USER_JOIN:' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_USER_JOIN', event, this.trtcComponent.getRemoteUserList())
				this.timestamp.push(new Date())
                
			})
			//5.远端用户退房
			this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
                self.requestRtcLog('1', 'room REMOTE_USER_LEAVE:' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_USER_LEAVE', event, this.trtcComponent.getRemoteUserList())
                if (self.data.pageStatus == 'detached') {
                    return;
                }
                if (self.data.pageStatus == 'hide') {
                    return;
                }
                if (self.data.isTransfer) {
                    self.data.isTransfer = false;
                    return;
                }
                if (self.data.isClickHangUp) {
                    return;
                }
                self.data.isDoctorHangUp = true;
                self.requestRtcLog('1', 'doctor exitRoom' , self.data.orderid);
                self.trtcComponent.exitRoom('UserExit')
                wx.navigateBack();
				// if (this.template === '1v1') {
				// 	wx.showModal({
				// 		title: '对方已退房',
				// 		content: '对方退房了'
				// 	})
				// 	this.timestamp = []
				// }
				// if (this.template === '1v1' && this.remoteUser === event.data.userID) {
				// 	this.remoteUser = null
				// }
			})
			//6.远端用户推送视频
			this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
                self.requestRtcLog('3', 'room REMOTE_VIDEO_ADD_远端用户推送视频', self.data.orderid);
				console.log('* room REMOTE_VIDEO_ADD(远端用户推送视频)', event, this.trtcComponent.getRemoteUserList())
				// 订阅视频
				const userList = this.trtcComponent.getRemoteUserList()
				const data = event.data
				if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
					// 1v1 只订阅第一个远端流
					this.remoteUser = data.userID
					this.trtcComponent.subscribeRemoteVideo({
						userID: data.userID,
						streamType: data.streamType,
					})
				} else {
					// if (!this.data.subscribeList[data.userID + '-video']) {
					this.trtcComponent.subscribeRemoteVideo({
						userID: data.userID,
						streamType: data.streamType,
					})
					// 标记该用户已首次订阅过
					this.data.subscribeList[data.userID + '-video'] = true
					// }
				}

			})
			//7.远端用户取消推送视频
			this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
                self.requestRtcLog('1', 'room REMOTE_VIDEO_REMOVE_远端用户取消推送视频' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_VIDEO_REMOVE(远端用户取消推送视频)', event, this.trtcComponent.getRemoteUserList())
			})
			//8.远端用户推送音频
			this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
				self.requestRtcLog('1', 'room REMOTE_AUDIO_ADD_远端用户推送音频'+ JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_AUDIO_ADD(远端用户推送音频)', event, this.trtcComponent.getRemoteUserList())
				// 订阅音频
				const data = event.data
				if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
					this.remoteUser = data.userID
					this.trtcComponent.subscribeRemoteAudio({
						userID: data.userID
					})
				} else {
					// if (!this.data.subscribeList[data.userID + '-audio']) {
					this.trtcComponent.subscribeRemoteAudio({
						userID: data.userID,
					})
					// 标记该用户已首次订阅过
					this.data.subscribeList[data.userID + '-audio'] = true
				}
			})
			//9.远端用户取消推送音频
			this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
				self.requestRtcLog('1', 'room REMOTE_AUDIO_REMOVE_远端用户取消推送音频:' + JSON.stringify(event), self.data.orderid);

				console.log('* room REMOTE_AUDIO_REMOVE', event, this.trtcComponent.getRemoteUserList())
			})
            //10.IM 就绪的通知，收到该通知后可以进行收发消息操作。
			this.trtcComponent.on(TRTC_EVENT.IM_READY, (event) => {
				console.log('* room IM_READY', event)
			})
            //11.收到 IM 消息的通知
			this.trtcComponent.on(TRTC_EVENT.IM_MESSAGE_RECEIVED, (event) => {
				console.log('* room IM_MESSAGE_RECEIVED', event)   
			})
            //12.
            this.trtcComponent.on(TRTC_EVENT.LOCAL_AUDIO_VOLUME_UPDATE, (event) => {
                // self.requestRtcLog('1', 'room LOCAL_AUDIO_VOLUME_UPDATE:' + JSON.stringify(event), self.data.orderid);
                // console.log('* room LOCAL_AUDIO_VOLUME_UPDATE', event)
            })
            

		},
	}
})
