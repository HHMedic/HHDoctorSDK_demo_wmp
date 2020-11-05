// components/hh-trtc/hh-trtc.js
const apis = require('../utils/api.js')
const dateUtil = require('../utils/dateUtil.js')
const hhDoctor = require('../hhDoctor.js');
const { sendLog } = require('../utils/HH_WMP_SDK.js');
const { requestCallResponse } = require('../utils/api.js');
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
			template: '', // 必要参数 组件模版，支持的值 1v1 grid custom ，注意：不支持动态修改, iOS 不支持 pusher 动态渲染
			maxBitrate: 1000,
			minBitrate: 2000,
			beautyLevel: 0, // 开启美颜等级 0～9级美颜
			enableIM: false, // 可选，仅支持初始化设置（进房前设置），不支持动态修改
		},
		localVideo: true,
		localAudio: true,
		template: '',
		subscribeList: {},
		callTips: {
			callintTip: '医生连线中，请耐心等待...',
			callintTipQueue: '拨号中...',
			callintTipTransfer: '拨号中...'
		},
		realPatientUuid: '',
		realPatientUserToken: '',
		waitTips: null,
		preCallResponse: null,
		doctor: null,
		order: null,
		orderid: '',
		roomID: '',
		isTransfer: false,
		pageStatus: '',
		isaboutHangUpSomething: false,
		roomCommand: '',
		inviteCallCommand: '',
		isInvite: 0,//是否为邀请模式 
		inviteRole: 1,//邀请角色 配合邀请模式使用 1邀请人 2被邀请人
		isBUserAccept: false,//B用户是否接听
		isInviteBReject: false,
		isBUserLeaveRoom: false,
		isAUserLeaveRoom: false,
	},
	lifetimes: {
		attached: function () { },
		created() { },
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
			if (this.data.orderid && this.data.trtcComponent && this.data.isaboutHangUpSomething) {
				setTimeout(() => {
					this.data.trtcComponent.exitRoom('userExit')
				}, 500)
			}
			this._pageLifeExit()

		},
		hide() {
			this.data.pageStatus = 'hide'
			this._pageLifeExit();

		}
	},
	methods: {
		_pageLifeExit() {
			console.log('pageLife', this.data.pageStatus)
			let self = this;
			let pageStatus = this.data.pageStatus;
			let phase = self.data.phase;
			switch (pageStatus) {
				case 'show':
					self.requestRtcLog(1, 'life:show', self.data.orderid);
					if (phase == 0) self._naviBack()
					self._onMemoryWarning();
					self._onNetworkStatusChange();
					self._getNetWorkType();
					break;
				case 'hide':
					self._exitHideAndDetached('life:hide', '用户压后台挂断')
					break;
				case 'detached':
					hhDoctor.off('messageReceived');
					clearInterval(self.data.cameraInterval);
					self._getClearTimer()
					self._exitHideAndDetached('life:detached', '页面卸载')
					break;
			}
		},
		_exitHideAndDetached(life, text) {
			self.requestRtcLog(1, life, self.data.orderid);
			self.stopAudio();
			wx.offMemoryWarning();
			wx.offNetworkStatusChange();
			if (self.data.isClickHangUp) return;
			if (self.data.isDoctorHangUp) return;
			if (self.data.isaboutHangUpSomething) return;
			if (self.data.enterChooseImages) return;
			if (self.data.phase == 7) {
				self.bindInviteHangUp();
				return;
			}
			self.bindTRTCOffEvent();
			if (self.data.createOrderPromise) {
				self.data.createOrderPromise.then(res => {
					self.aboutHangUpSomething(text, 'isBack');
				})
			} else {
				self.aboutHangUpSomething(text, 'isBack');
			}
		},
		_requestComplete() {
			console.log('onLoad======>', this.data._request)
			self = this;
			this.setData({
				isInvite: this.data._request.isInvite || 0,
				template: this.data._request.isInvite == 1 ? 'grid' : '1v1'
			})
			self.data.rtcConfig.template = this.data.template;
			this.setData({
				rtcConfig: self.data.rtcConfig
			})
			this.trtcComponent = this.selectComponent('#trtc-component')
			this._request = this.data._request;
			self._checkAuthorize().then(res => {
				self.requestRtcLog(1, 'authorize: check success');
				self.setData({
					isAuthBox: false
				})
				self._getLocation()
				self.componentOnload();
			}).catch(res => {
				self.requestRtcLog(1, 'authorize: check fail');
				self.setData({
					isAuthBox: true
				})
				console.log('授权失败')
			});
		},

		componentOnload() {
			this.data.trtcComponent = this.trtcComponent;
			this.bindTRTCRoomEvent();
			self._workbenchRegist();
			self._registMessageReceived();
			self.data.realPatientUuid = self.data._request.uuid || 0; //选择成员呼叫需携带成员id 进入评价页需传入成员或用户i
			self.data.realPatientUserToken = self.data._request.realPatientUserToken || '';
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

		//1.收到医生接听的消息doctor已接听
		workbenchDoctorAccept(orderid, obj) {
			console.log('* 医生接听=====', orderid)
			if (orderid == self.data.orderid) {
				if (self.data.isWorkbenchAccept) {
					return;
				}
				if (self.data.isInvite == 1) {
					// A通知B
					self.sendCustomerMessage(self.data.command.doctor_accept_invite, self.data.realPatientUuid)
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
		//B收到 A发来的 医生已接听的消息 
		workbenchDoctorAcceptInvite(orderid) {
			if (orderid == self.data.orderid) {
				self.data.isWorkbenchAccept = true;
				if (self.data.isBUserAccept) {
					self.setData({ phase: 3 })
					self._startVideoTimer();
				}
				self.stopAudio();
			}
		},
		// 向工作台发送call消息，检测发送状态
		requestGetOrderStatus(orderId) {
			self.data.timerGetStatus = setInterval(res => {
				//工作台已接听则无需继续往下走
				if (self.data.isWorkbenchAccept || self.data.phase == 3 || self.data.pageStatus == 'hide' || self.data.pageStatus == 'detached') {
					clearInterval(self.data.timerGetStatus);
					return;
				}
				self.requestRtcLog('1', 'getOrderStatus-检查医生是否接听', self.data.orderid);
				apis.requestGetOrderStatus(orderId).then(res => {
					if (res.data) {
						clearInterval(self.data.timerGetStatus);
						self.workbenchDoctorAccept(orderId, res.data);
					}
				});
			}, 3500);
		},
		//2.IM--工作台忙碌状态
		workbenchBusy(orderid, obj) {
			self.requestRtcLog('1', 'doctor busy', self.data.orderid);
			if (self.data.isInvite == 1) {
				self.sendCustomerMessage(self.data.command.busy, self.data.realPatientUuid)
				if (self.data.phase != 3) {
					self.showToast('医生正在忙碌中')
				}
				return;
			}
			self.aboutHangUpSomething('医生忙碌返回busy', 'noBack', 'busy');
			self._showModalTip({ content: '医生忙碌中，请稍后再呼' })
		},
		//用户忙碌
		workbenchBusyInvite(orderid) {
			self.requestRtcLog('1', 'doctor busy', self.data.orderid);
			self.aboutHangUpSomething('医生忙碌返回busy', 'noBack', 'busy');
			if (self.data.isInvite == 1 && self.data.inviteRole == 2) {
				self.showToast('医生正在忙碌中')
			}
		},
		//3.IM--排队中显示排队等待
		workbenchWait(orderid, obj) {
			self.setData({
				'waitTips.waitUserInfoText': obj.msg
			})
			self.requestRtcLog('1', 'waitTips:' + JSON.stringify(obj.msg), self.data.orderid);
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
			let doctor = JSON.parse(decodeURIComponent(self._request.doctor));
			let order = JSON.parse(decodeURIComponent(self._request.order))
			let roomID = orderid.slice(orderid.length - 6, orderid.length);
			self.setData({
				inviteRole: 2,
				doctor,
				order,
				roomID,
				orderid,
				userSig: hhDoctor.getUserSig(),
				userID: hhDoctor.getUserId(),
				phase: self.data.isInvite == 1 ? 7 : (doctor.serviceTypeStatus == 'quanke') ? 4 : 5
			}, () => {
				self.trtcComponent.startPreview();
			})
		},
		//6.IM 转呼 =>走新单号=>agentTransfer=> 重新创建订单
		workbenchAgentTransfer(orderid, obj) {
			self.requestRtcLog('1', 'doctor transfer:' + JSON.stringify(obj), orderid);
			self.trtcComponent.exitRoom('UserExit');
			if(self.data.enterChooseImages){
				self.aboutHangUpSomething('相册中收到转呼异常挂断')
				self._naviBack()
				return;
			};
			self.requestHangUp('医生发起转呼', 'noBack');
			self.setData({
				isTransfer: true,
				doctor: null,
				phase: 0,
				preCommand: '',
				createOrderPromise: null,
				isWorkbenchAccept: false,
				orderid:''
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
			if (self.data.isClickHangUp) {
				return;
			}
			//是否为当前单号 
			if (orderid == self.data.orderid) {
				self.data.isDoctorHangUp = true;
				self.requestRtcLog('1', 'doctor interrupt:' + JSON.stringify(obj), orderid);
				if (self.data.isInvite == 1) {
					self.sendCustomerMessage(self.data.command.interrupt, self.data.realPatientUuid)
				}
				self.trtcComponent.exitRoom('UserExit')
				self._naviBack()
			}

		},

		//多人视频-B收到A取消呼叫-呼叫中 返回首页
		workbenchCancelInvite(orderid) {
			console.log(orderid, self.data.orderid, '收到邀请人取消邀请===', self.data.inviteRole)
			if (self.data.inviteRole == 2 && !orderid) {
				self.showToast('对方已取消呼叫')
				return;
			}
			if (self.data.orderid != orderid) return;
			self.stopAudio();
			self.aboutHangUpSomething('邀请人点击挂断', 'noBack');
			self.showToast(self.data.order.patientName + '已取消呼叫')


		},
		//多人视频-B收到A A主动挂断
		workbenchInterruptInvite(orderid) {
			console.log(orderid, self.data.orderId, 'A挂断')
			if (self.data.orderid != orderid) return;
			self.stopAudio();
			clearInterval(self.data.timerVideoChat);
			if (self.data.phase == 7) {
				self.showToast(self.data.order.patientName + '已挂断')
			} else {
				self.showToast(self.data.order.patientName + '已挂断', 'noBack')
			}
		},
		//多人视频-A收到B拒接 消息
		workbenchRejectInvite(orderid) {
			console.log(orderid, self.data.orderid)
			self.stopAudio();
			self.setData({ isInviteBReject: true })
			if (self.data.phase == 1) {
				self.showToast(self.data.order.realPatientName + '拒绝了您的邀请')
				self.aboutHangUpSomething('被邀请人点击挂断', 'noBack');
			}
		},
		//多人视频-收到对方进入相册
		workbenchEnterCamera(orderid, obj) {
			if (self.data.isInvite == 1 && self.data.phase == 3) {
				if (obj.uuid == self.data.order.realPatientUuid) {
					self.setData({
						isBUserLeaveRoom: true
					})
					self.showToast(self.data.order.realPatientName + '已离开', 'noBack')
					return;

				}
				if (obj.uuid == self.data.order.patientUuid) {
					self.setData({
						isAUserLeaveRoom: true
					})
					self.showToast(self.data.order.patientName + '已离开', 'noBack')
					return;
				}
			};
		},
		//多人视频-收到对方退出相册
		workbenchExitCamera(orderid, obj) {
			if (self.data.isInvite == 1 && self.data.phase == 3) {
				if (obj.uuid == self.data.order.realPatientUuid) {
					self.setData({
						isBUserLeaveRoom: false
					})
					return;

				}
				if (obj.uuid == self.data.order.patientUuid) {
					self.setData({
						isAUserLeaveRoom: false
					})
					return;
				}
			};
		},
		//回拨接听
		bindAccept() {
			self.requestRtcLog('1', 'user click accept', self.data.orderid);
			apis.requestCallResponse(self.data.orderid);
			self.stopAudio();
			self.trtcComponent.stopPreview();
			self.sendMessage(self.data.command.ACCEPT).then(res => {
				self.enterRoom()
				self.setData({ phase: 3 })
				self._startVideoTimer();
			})
		},
		//多人视频-phase-g B接听 
		bindInviteAccept() {
			self.stopAudio();
			self.trtcComponent.stopPreview();
			self.enterRoom()
			self.setData({
				isBUserAccept: true
			})
			if (self.data.isWorkbenchAccept) {
				self.setData({ phase: 3 })
				self._startVideoTimer();
			} else {
				//通知邀请人A 已接听
				self.setData({
					phase: 1
				})

			}
		},
		//多人视频-phase-gB点击拒接 通知A
		bindInviteHangUp() {
			//正常点击挂断不走requestHangUp
			self.sendCustomerMessage(self.data.command.reject_invite, self.data.order.patientUuid);
			self._naviBack()
		},

		//用户点击挂断
		bindHangUp() {
			self.data.isClickHangUp = true;
			self.requestRtcLog('1', 'user click hangup', self.data.orderid);
			self.aboutHangUpSomething('用户点击挂断', 'isBack');

		},
		//点击挂断 左滑 压后台 拍照需要处理的事情 转呼单独处理不进入该函数内
		aboutHangUpSomething(reason, isBack, isBusy) {
			if (!self.data.orderid) {
				self._naviBack()
				return;
			}
			self._getClearTimer();
			if (self.data.isaboutHangUpSomething) return;
			self.requestRtcLog('1', 'aboutHangUpSomething：' + reason, self.data.orderid);
			self.data.isaboutHangUpSomething = true;
			self.stopAudio();
			
			//多人视频-邀请模式且为邀请人主动挂断 通知B ==>取消呼叫  
			if (self.data.isInvite == 1 && !self.data.isInviteBReject && isBusy != 'busy') {
				self.trtcComponent.exitRoom('UserExit');
				self.sendCustomerMessage(self.data.hangupcommand_invite[self.data.phase], self.data.realPatientUuid);
			}
			self.requestHangUp(reason, isBack);
			self.trtcComponent.exitRoom('UserExit');
		},
		enterRoom(command) {
			console.log('* room enterRoom', command)
			self.data.roomCommand = command;
			self.requestRtcLog('1', 'room enterRoom:' + command || '', self.data.orderid);
			let rtcConfig = {
				userID: self.data.userID,
				userSig: self.data.userSig
			};
			Object.assign(this.data.rtcConfig, rtcConfig);
			this.setData({
				rtcConfig: this.data.rtcConfig
			}, () => {
				this.data.enterRoomPromise = this.trtcComponent.enterRoom({
					roomID: self.data.roomID,
				}).then(res => {
					console.log('* room joinRoom 进房成功:');
					self.requestRtcLog('1', 'room enterRoom init success', self.data.orderid);
					// 真正进房成功需要通过 1018 事件通知
					// view 渲染成功回调后，开始推流
					//bindTRTCRoomEvent 监听用户进房成功与否 异常问题
				}).catch(res => {
					self.requestRtcLog('1', 'room enterRoom init fail', self.data.orderid);
					// 进房失败需要通过 pusher state 事件通知，目前还没有准确的事件通知
					self.aboutHangUpSomething('连接服务器超时');
					self._showModalTip({ content: '连接服务器超时' })
					console.error('* room enterRoom init fail:', res);
				});
			})

		},
		playAudio() {
			if (self.data.isaboutHangUpSomething) return;
			if (!audioContext) {
				audioContext = wx.createInnerAudioContext();
			}
			audioContext.src = self.data.audio.url;
			audioContext.loop = true;
			audioContext.play();
			console.log('开始响铃')
			self.requestRtcLog('1', 'audio play', self.data.orderid);

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
			self.setData({
				enterChooseImages: true,
			})
			self.sendMessage(self.data.command.SWITCH_TO_AUDIO);
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
			self.setData({
				enterChooseImages: false
			})
			clearInterval(self.data.cameraInterval);

			this.trtcComponent.publishLocalAudio()
			this.trtcComponent.publishLocalVideo()
			this.sendMessage(self.data.command.SWITCH_TO_VIDEO)
			if(this.data.isInvite==1){
				this.trtcComponent.allRemoteAudio();
			}
			if (self.data.isInvite == 1) {
				let toUser = self.data.userID == self.data.order.patientUuid ? self.data.order.realPatientUuid : self.data.order.patientUuid;
				self.sendCustomerMessage(self.data.command.exit_camera, toUser);
			}
		},
		getInveterCamera(){
			clearInterval(self.data.cameraInterval);
			self.sendMessage(self.data.command.SWITCH_TO_CAMERA);
			self.data.cameraInterval=setInterval(res=>{
				self.sendMessage(self.data.command.SWITCH_TO_CAMERA);
			},5000)
		},
		// 给邀请人发送消息
		sendCustomerMessage(command, toUser) {
			self.requestRtcLog('1', 'inviter member start:' + command, self.data.orderid);
			console.log('inviter member start:', command)
			apis.sendCustomerMessage(self.data.rtcConfig.userID || self.data.order.realPatientUuid, toUser, command, self.data.orderid).then(res => {
				if (res.status == 200) {
					console.log('inviter member success:', command)
					self.requestRtcLog('1', 'inviter member success:' + command, self.data.orderid);
				}
			}).catch(res => {
				self.requestRtcLog('1', '邀请成员消息发送失败', self.data.orderid);
			})
		},
		

		bindTRTCRoomEvent() {
			const TRTC_EVENT = this.trtcComponent.EVENT
			this.timestamp = []
			//1.本地进房成功
			this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
				console.log('* room LOCAL_JOIN', event)
				self.requestRtcLog('1', 'room LOCAL_JOIN（进房成功）:' + JSON.stringify(event), self.data.orderid);
				if (self.data.roomCommand && self.data.phase != 3) {
					switch (self.data.roomCommand) {
						case 'call':
							self.playAudio();
							if (self.data.pageStatus == 'hide' || self.data.pageStatus == 'detached') return;
							if (self.data.isInvite == 1) {
								if (self.data.isDoctorHangUp) return;
								if (self.data.isaboutHangUpSomething) return;
								self.sendCustomerMessage(self.data.command.call_invite, self.data.realPatientUuid);
	
							}
							self.sendMessage(self.data.roomCommand).then(res=>{
								self.requestGetOrderStatus(self.data.orderid);
							});
							break;
					}
				}
				if (this.data.localVideo === true || this.data.template === '1v1') {
					if (self.data.phase == 1) {
						this.trtcComponent.unpublishLocalVideo().then(res => {
							this.trtcComponent.publishLocalVideo()
						})
					}
					if (self.data.phase == 3) {
						this.trtcComponent.publishLocalVideo()

					}
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
				self.aboutHangUpSomething('异常' + event.data.msg + '-code:' + event.data.code);
				self._showModalTip({ content: '通话异常中断，重启微信后呼叫医生', isExitWx: true })
			})
			//4.远端用户进房
			this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
				if (self.data.isaboutHangUpSomething) return;
				let userlist = this.trtcComponent.getRemoteUserList()
				if (userlist.length) {
					userlist.map((item, index) => {
						if (item.userID == self.data.order.realPatientUuid) {
							self.stopAudio();
							self.setData({
								isBUserJoinRoom: true
							})

						}
					})
				}

				self.requestRtcLog('1', 'room REMOTE_USER_JOIN:' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_USER_JOIN', event, this.trtcComponent.getRemoteUserList())
				this.timestamp.push(new Date())

			})
			//5.远端用户退房
			this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
				self.requestRtcLog('1', 'room REMOTE_USER_LEAVE:' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_USER_LEAVE', event, this.trtcComponent.getRemoteUserList())
				if (self.data.pageStatus == 'hide') {
					return;
				}
				if (self.data.pageStatus == 'detached') {
					return;
				}
				if (self.data.isTransfer) {
					self.data.isTransfer = false;
					return;
				}
				if (self.data.isClickHangUp) {
					return;
				}

				if (self.data.isInvite == 1 && self.data.phase == 3) {
					if (event.data.userID == self.data.order.realPatientUuid) {
						self.setData({
							isBUserLeaveRoom: true
						})
						self.showToast(self.data.order.realPatientName + '已离开', 'noBack')
						return;

					}
					if (event.data.userID == self.data.order.patientUuid) {
						self.setData({
							isAUserLeaveRoom: true
						})
						self.showToast(self.data.order.patientName + '已离开', 'noBack')
						return;
					}
				};
				if (self.data.enterChooseImages) return;
				// self.data.isDoctorHangUp = true;
				// self.requestRtcLog('1', 'doctor exitRoom', self.data.orderid);
				// self.trtcComponent.exitRoom('UserExit')
				// wx.navigateBack();
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
				self.requestRtcLog('1', 'room REMOTE_AUDIO_ADD_远端用户推送音频' + JSON.stringify(event), self.data.orderid);
				console.log('* room REMOTE_AUDIO_ADD(远端用户推送音频)', event, this.trtcComponent.getRemoteUserList())
				// 订阅音频
				const data = event.data
				if (this.data.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
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
		bindTRTCOffEvent() {
			const TRTC_EVENTS = this.trtcComponent.EVENT
			this.trtcComponent.off(TRTC_EVENTS.LOCAL_JOIN)
			this.trtcComponent.off(TRTC_EVENTS.REMOTE_USER_JOIN)
			this.trtcComponent.off(TRTC_EVENTS.REMOTE_AUDIO_ADD)
			this.trtcComponent.off(TRTC_EVENTS.REMOTE_VIDEO_ADD)

		}
	}
})
