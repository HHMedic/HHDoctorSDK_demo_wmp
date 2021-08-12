const app = getApp();
const apis = require('../utils/api.js');
const dateUtil = require('../utils/dateUtil.js');
const hhDoctor = require('../hhDoctor.js');
let receivedMsgs = [];
let self;
let start;
let netSpeedRemote = [], netSpeedRemoteMin = 10
module.exports = Behavior({
	behaviors: [],
	properties: {
		myBehaviorProperty: {
			type: String
		}
	},
	data: {
		command: {
			call: 'call', //主呼呼叫
			call_cancel: 'call_cancel', //呼叫-挂断
			HANGUP: 'HANGUP',//挂断
			interrupt: 'interrupt',
			busy: 'busy', //回拨如果正在忙碌-返回busy
			lingUp: "dispatchDoctorByONS", //排队-分配医生成功(我收到的)
			waitUserInfo: "waitUserInfo", //排队中-（我收到的）
			ACCEPT: 'ACCEPT', //回拨-接听
			REJECT: 'REJECT', //回拨-挂断
			SWITCH_TO_AUDIO: 'SWITCH_TO_AUDIO', //转音频模式
			SWITCH_TO_VIDEO: 'SWITCH_TO_VIDEO', //转视频模式
			SWITCH_TO_CAMERA: 'SWITCH_TO_CAMERA',//相机模式
			SWITCH_TO_AUDIO_USER: 'SWITCH_TO_AUDIO_USER', //用户点击右上角，主动关闭本地视频
			SWITCH_TO_VIDEO_USER: 'SWITCH_TO_VIDEO_USER', //用户点击右上角，主动开启本地视频
			TRANSFER: "TRANSFER", //转呼命令
			cancel: 'cancel',//取消-呼叫取消现已改成call_cancel
			call_invite: 'call_invite',//多人视频-邀请人呼叫命令
			doctor_accept_invite: 'doctor_accept_invite',//通知被邀请人医生接听
			cancel_invite: 'cancel_invite',//被邀请人取消呼叫
			reject_invite: 'reject_invite',//被邀请人拒接
			exit_camera: 'exit_camera',//被邀请人退出相册
			enter_camera: 'enter_camera',//被邀请人进入相册
			busy_invite: 'busy_invite',//被邀请人忙碌
		},
		hangupcommand: ['call_cancel', 'call_cancel', 'call_cancel', 'interrupt', 'REJECT', 'REJECT', 'call_cancel'],
		hangupcommand_invite: ['cancel_invite', 'cancel_invite', 'cancel_invite', 'interrupt_invite', '', '', 'cancel_invite', 'reject_inite'],
		phaseArray: ['过渡中', '呼叫中', '排队中', '视频中', '医生回拨', '专家回拨', '观看视频中', '呼叫中'],
		workbenchList: [],//注册存储IM命令对应执行方法事件调用
		preReceivedCommand: '',//记录上一个已发送命令-防止发送重复命令
		cameraTorch: false, //手电筒
		photoIdx: 0, //预览上传图片的下标
		videoTimeStart: '', //先获取一下当前时间
		videoTime: '00:00',//处理格式的视频计时
		videoTimeSeconds: 0,//视频计时
		isClickHangUp: false,//是否为用户主动点击挂断
		isDoctorHangUp: false,//是否为医生主动挂断
		timerGetStatus: null, //检测发送call消息接收状态
		timerTransfer: null, //医生转呼
		timerChangeDoctor: null, //更换医生
		timerWaitVideo: null, //进入排队中
		timerWaittingTips: null, //显示排队提示
		timerVideoChat: null,//视频计时
		enterChooseImages: false,
		audio: { url: 'https://imgs.hh-medic.com/icon/ring.mp3' },
		systeminfo: null,
		realPatientUuid: 0,
		isShowModalTip: false,
		modal: null,
		s: null,
		w: null,
		isShowToast: false,
		toastTitle: '',
		isHideTip: true
	},
	attached: function () {
		self = this;
		wx.getSystemInfo({
			success: function (systeminfo) {
				console.log(systeminfo)
				self.setData({ systeminfo })
				self.requestRtcLog(1, JSON.stringify(systeminfo));
			}
		})
		self.data.s = self.data.systeminfo.system.split(' ');
		self.data.w = self.data.systeminfo.version.split('.');
	},
	ready() {
		self = this;
	},
	methods: {
		//清空定时器们
		_getClearTimer() {
			clearInterval(self.data.timerGetStatus);
			clearInterval(self.data.timerWaitVideo);
			clearTimeout(self.data.timerTransfer);
			clearTimeout(self.data.timerChangeDoctor)
			clearTimeout(self.data.timerWaittingTips)

		},
		//注册监听通信
		_registMessageReceived() {
			hhDoctor.on('messageReceived', function (e) {
				if (e && e.length > 0) {
					let msgId = e[0].ID;
					if (receivedMsgs[msgId]) {
						return;
					}
					receivedMsgs[msgId] = msgId;
				}
				//self.requestRtcLog(1, 'onImMessage:' + JSON.stringify(e), self.data.orderid);
				e.map((item, index) => {
					let obj = JSON.parse(item.payload.data);
					console.log('收到的消息>>>>>>', obj)
					if (self.data.preReceivedCommand == obj.command && obj.command != 'waitUserInfo') {
						return;
					}
					self.requestRtcLog(1, 'onImMessage-command:' + obj.command, self.data.orderid);
					self.data.preReceivedCommand = obj.command;
					self.data.workbenchList[obj.command] && self.data.workbenchList[obj.command](obj.orderId, obj, item.from, item.to);
				});
			});
		},
		// 向工作台发送消息
		sendMessage(command, newOrderid, fromId, success, fail) {
			console.log('sendMessage===*', self.data.orderid, command)
			self.requestRtcLog('1',
				`sendMessage init:${command}; isDoctorHangUp:${self.data.isDoctorHangUp}; isaboutHangUpSomething:${self.data.isaboutHangUpSomething}; preCommand:${self.data.preCommand}`,
				self.data.orderid);

			return new Promise((resolve, reject) => {
				if (self.data.isDoctorHangUp) return reject('isDoctorHangUp');
				if (self.data.isaboutHangUpSomething) return reject('isaboutHangUpSomething');
				let data = self.data;
				if (data.orderid) {
					if (data.preCommand == command) {
						return reject('重复消息');
					}
					let orderId = (command == 'busy' && newOrderid) ? newOrderid : data.orderid;
					let serviceType = data.doctor && data.doctor.serviceTypeStatus == 'zhuanke' ? 'zhuanke' : data._request.serviceType;
					let msgData = {
						command,
						orderId,
						serviceTypeStatus: serviceType,
						uuid: data.userID
					};
					//let uuid = data.doctor ? data.doctor.login.uuid : 0;
					let uuid = self._getDoctorUuidList()
					if (!uuid) uuid = data.doctor ? data.doctor.login.uuid : 0;
					let toUser = command == 'busy' && fromId ? fromId : uuid;
					self.requestRtcLog('1', 'sendMessage start:' + command + ';type:' + serviceType + ';toUser:' + toUser, self.data.orderid);
					self.data.preCommand = command != 'SWITCH_TO_CAMERA' ? command : '';
					hhDoctor.sendMessage(toUser, msgData, orderId).then(res => {
						console.log('发消息成功')
						self.requestRtcLog('1', 'sendMessage success:' + command + '；type:' + serviceType, self.data.orderid);
						resolve();
					}).catch(res => {
						reject('发消息失败');
					})
				}
			})
		},
		_getDoctorUuidList() {
			let doctorList = self.roomerList(1, 1)
			doctorList = doctorList.map(doctor => { return doctor.substr(5) })
			return doctorList.join(',')
		},
		//注册IM执行方法存储
		_workbenchRegist() {
			let self = this;
			self.data.workbenchList['accept'] = self.workbenchDoctorAccept;
			self.data.workbenchList['busy'] = self.workbenchBusy;
			self.data.workbenchList['waitUserInfo'] = self.workbenchWait;
			self.data.workbenchList['call'] = self.workbenchCall;
			self.data.workbenchList['agent_transfer'] = self.workbenchAgentTransfer;
			self.data.workbenchList['cancel'] = self.workbenchInterrupt;
			self.data.workbenchList['interrupt'] = self.workbenchInterrupt;
			self.data.workbenchList['dispatchDoctorByONS'] = self.workbenchDispatchDoctorByONS;
			self.data.workbenchList['doctor_accept_invite'] = self.workbenchDoctorAcceptInvite;
			self.data.workbenchList['cancel_invite'] = self.workbenchCancelInvite;
			self.data.workbenchList['reject_invite'] = self.workbenchRejectInvite;
			self.data.workbenchList['interrupt_invite'] = self.workbenchInterruptInvite;
			self.data.workbenchList['busy_invite'] = self.workbenchBusyInvite;
			self.data.workbenchList['conference_begin'] = self.workbenchWhiteboard;
			self.data.workbenchList['conference_end'] = self.workbenchWhiteboard;
			//self.data.workbenchList['enter_camera'] = self.workbenchEnterCamera;
			//self.data.workbenchList['exit_camera'] = self.workbenchExitCamera;

		},
		//点击-切换摄像头
		bindSwitchCamera() {
			self.requestRtcLog('1', 'bind switchcamera', self.data.orderid);
			this.data.trtcComponent.switchCamera()
		},
		//点击切换闪光灯
		bindToggleTorch() {
			self.requestRtcLog('1', 'bind toggle torch', self.data.orderid);
			this.data.trtcComponent.toggleTorch({
				success() {
					self.setData({
						cameraTorch: !self.data.cameraTorch
					})
					wx.showToast({
						title: self.data.cameraTorch ? '已为您打开闪光灯' : '已为您关闭闪光灯',
						icon: 'none',
						mask: true,
						duration: 1000
					})
				}
			})

		},

		// 万里长征第一步创建订单
		_requestCreateFamOrder(famOrderId, deptId) {
			self.requestRtcLog('1', 'createFamOrder start -Version:' + getApp().globalData.wmpVersion);
			let orderType = this.data._request.orderType || '';
			self.data.createOrderPromise = apis.requestCreateFamOrder(deptId ? deptId : self.data._request.dept, famOrderId, orderType,
				self.data.systeminfo.platform, self.data.systeminfo.SDKVersion, self.data._sdkVersion, self.data.realPatientUuid,
				self.data.realPatientUserToken, self._request.appointedDoctorId, self._request.appointedOrderId, self.data._request.medicRecordId,
				self.data._request.hospitalId, self.data._request.ext).then(res => {
					console.log('创建订单====>', res)
					if (res.status == 200) {
						self.requestRtcLog('1', 'createFamOrder success', self.data.orderid);

						let data = res.data;
						let preCallResponse = data.preCallResponse;
						let orderid = data.order.orderid;
						let roomID = orderid.slice(orderid.length - 6, orderid.length)
						self.setData({
							orderid,
							roomID,
							userID: data.uuid,
							userSig: hhDoctor.getUserSig(),
							order: data.order,
							doctor: data.doctor || null,
							preCallResponse: preCallResponse || '',
							callTips: {
								callintTip: preCallResponse.callingTip || '医生连线中，请耐心等待...',
								callintTipQueue: preCallResponse.callingTipQueue || '拨号中...',
								callintTipTransfer: preCallResponse.callingTipTransfer || '拨号中...'
							}
						}, () => {
							if (data.doctor) {
								self.requestRtcLog('1', 'enter call success', self.data.orderid);
								self.setData({
									phase: 1
								})
								self.enterRoom(self.data.command.call)
								self.doctorWait(data.doctor.login.uuid)
							} else {
								if (self.data.isInvite == 1) {
									self.showToast('医生忙碌，请稍候重新呼叫')
								}
								self.requestRtcLog('1', 'enter callwait', self.data.orderid);
								self.setData({
									phase: 2
								})
								let preCallResponse = self.data.preCallResponse;
								self.data.timerWaittingTips = setTimeout(function () {
									self._showWaittingTips(preCallResponse.videoMsgTime, preCallResponse.videoMsgTemplate);
								}, preCallResponse.videoMsgDelay * 1000);
								self.trtcComponent.startPreview();
							}
						})

					} else {
						self._showModalTip({ content: res.message || '请保持网络流畅' })
					}
				}).catch(err => {
					console.log('创建订单err====>', err)
					self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })
				})
		},
		//点击更换医生-弹出弹窗
		bindChangeDoctor() {
			self.requestRtcLog('1', 'change doctor user click', self.data.orderid);
			wx.showModal({
				title: '提示',
				content: '立即更换其他医生咨询，确定更换吗？【只可更换1次】',
				confirmText: '确定更换',
				confirmColor: '#0592F5',
				success: function (res) {
					if (res.confirm) {
						self.requestChangeDoctor();
					} else {
						self.requestRtcLog('1', 'change doctor user cancel', self.orderid)
					}
				}
			})
		},
		//更换医生调用该API进行更换-3秒后创建新的订单
		requestChangeDoctor() {
			wx.showLoading();
			self.requestRtcLog('1', 'change doctor start', self.data.orderid);
			if (!self.data.orderid) return;
			apis.requestChangeDoctor(self.data.orderid).then(res => {
				wx.hideLoading();
				if (res.status == 200) {
					self.requestHangUp('用户更换医生')
					self.trtcComponent.exitRoom('UserExit')
					self.setData({
						isTransfer: self.data.doctor && self.data.doctor.login && self.data.doctor.login.uuid || '',
						doctor: null,
						phase: 0,
						preCommand: '',
						createOrderPromise: null,
						isWorkbenchAccept: false
					})
					self.requestRtcLog('1', 'change doctor success', self.data.orderid);
					self.data.timerChangeDoctor = setTimeout(() => {
						self._enterCall();
					}, 3000)
					//跳转呼叫页重新呼叫 服务器返回成功后，重新进行呼叫，呼叫时的dept、实际患者uuid等参数使用用户上次呼叫时的参数值； 
				} else {
					wx.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			}).catch(err => {
				self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })
			})
		},
		//主呼-挂断http提交 type挂断类型:CANCEL HANGUP  transfer:是否为转呼
		//reasonText 如果追加'-removeUser' 则为告知服务端强制解散房间用于所有的异常挂断
		requestHangUp(reason, isBack) {
			if (!self.data.orderid) return;
			let data = self.data;
			let phase = data.phase;
			let videoTimeStart = data.videoTimeStart;
			let videoTime = 0;
			if ((phase == 0 || phase == 3) && videoTimeStart) {
				videoTime = parseInt((new Date().getTime() - videoTimeStart) / 1000);
			}
			let reasonText = encodeURIComponent(reason + '(' + data.phaseArray[phase] + ')');
			if (self.data.isInvite == 1 && !self.data.isClickHangUp && !self.data.isDoctorHangUp) {
				reasonText = reasonText + '-removeUser'
			}
			let serviceType = (data.doctor && data.doctor.serviceTypeStatus == 'zhuanke') ? 'zhuanke' : data._request.serviceType;
			let params = `?famOrderId=${data.orderid}&serviceType=${serviceType}&videoTime=${videoTime}&reason=${reasonText}`
			self.requestRtcLog('1', 'requestHangUp start；videoTime:' + videoTime + 's；' + reason + '-' + data.phaseArray[phase], self.data.orderid);
			wx.showLoading();
			apis.requestHangUp(params).then(res => {
				wx.hideLoading();
				self.setData({
					videoTimeStart: '',
					videoTime: '00:00',
					videoTimeSeconds: 0,
					roomCommand: ''
				})
				self.requestRtcLog('1', 'requestHangUp success:' + res.message + '-' + data.phaseArray[phase], self.data.orderid);
				if (res.status == 200) {
					if (res.data && res.data.question && data.isClickHangUp && data.isInvite != 1) {
						self.setData({
							isEvaluate: true,
							evaluateData: res.data
						})
					} else {
						if (isBack == 'isBack') self._naviBack()
					}
				} else {
					wx.showToast({
						title: res.message,
						icon: 'none',
						duration: 1500
					})
				}
			}).catch(err => {
				wx.hideLoading();
				self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })
				self.checkIsNetWork(() => {
					self.requestHangUp(reason, isBack)
				})
			})
		},
		//主要用于请求挂断是断网-检查是否还有网
		checkIsNetWork(doing) {
			setTimeout(res => {
				wx.getNetworkType({
					success: function (res) {
						if (res.networkType == 'none') {
							self.checkIsNetWork(doing)
						} else {
							doing && doing()
						}
					}
				})
			}, 1000)
		},


		//进入排队提示中-根据返回秒数进入视频观看界面
		_showWaittingTips(msgTimeSeconds, msgTemplate) {
			if (self.data.phase != 2) return;
			self.setData({
				waitTips: {
					videoTimeTip: msgTemplate.replace('{time}', msgTimeSeconds),
					waitVideoTips: true,
				}
			})
			clearInterval(self.data.timerWaitVideo);
			self.data.timerWaitVideo = setInterval(function () {
				if (self.data.phase != 2) {
					clearInterval(self.data.timerWaitVideo);
					return;
				}
				msgTimeSeconds--;
				if (msgTimeSeconds <= 0) {
					clearInterval(self.data.timerWaitVideo);
					self.setData({
						phase: 6
					})
					return;
				}
				self.setData({
					'waitTips.videoTimeTip': msgTemplate.replace('{time}', msgTimeSeconds)
				})
			}, 1000);
		},


		//开始视频计时
		_startVideoTimer() {
			self.data.videoTimeStart = new Date().getTime();
			self.data.timerVideoChat = setInterval(() => {
				if (!self.data.videoTimeStart) {
					clearInterval(self.data.timerVideoChat);
					self.data.timerVideoChat = null;
					return;
				}
				let vt = parseInt((new Date().getTime() - self.data.videoTimeStart) / 1000);
				self.setData({
					videoTime: dateUtil.formatTimeLength(vt),
					videoTimeSeconds: vt
				})
			}, 1000)
			setTimeout(() => {
				self.setData({ isHideTip: false })
			}, 11000)
		},
		//点击关掉排队时观看的视频,返回排队页中
		_onCloseVideo() {
			self.setData({
				phase: 2,
				'waitTips.waitVideoTips': false,
			})
		},
		//点击评论
		_onInputComment(e) {
			wx.showModal({
				title: '前往直播',
				content: '评论需退出排队，跳转至全屏直播，确认跳转吗?',
				success: function (res) {
					if (res.confirm) {
						self.aboutHangUpSomething('用户进入直播页')
						let pageUrl = self.data.basePath + 'innerpages/video/video?' + self._getPublicRequestParams() +
							'&liveSource=WMP_CALLING_LIVE' +
							'&videoType=live' +
							'&videoId=' + e.detail.id;
						wx.redirectTo({
							url: pageUrl,
						})
					}
				}
			})
		},
		//检查用户授权 麦克风 摄像头 地理位置(可选)
		_checkAuthorize: function () {
			return new Promise((resolve, reject) => {
				this._getAuthFun("scope.record").then(res => {
					this._getAuthFun("scope.camera").then(res => {
						this._getAuthFun("scope.userLocation").then(() => {
							resolve();
						}).catch(() => {
							resolve();
						})
					}).catch(err => {
						self.setData({
							isAuthBox: true
						})
						reject();
					})
				}).catch(res => {
					this._getAuthFun("scope.camera").catch(err => {
						self.setData({
							isAuthBox: true
						})
						reject();
					})
					reject();
				})
			})
		},
		//授权API
		_getAuthFun(scope) {
			return new Promise((resolve, reject) => {
				wx.authorize({
					scope: scope,
					success: function () {
						resolve()
					},
					fail() {
						reject()
					}
				})
			})

		},
		//上传坐标
		_getLocation() {
			wx.getLocation({
				altitude: 'false',
				highAccuracyExpireTime: 0,
				isHighAccuracy: false,
				type: 'gcj02',
				success: (res) => {
					apis.requestReportLocation(res.latitude, res.longitude)
						// apis.requestReportLocation(44.102759, 88.067443)  // 联调测试用
						.then(res => { }).catch(err => { })
					self.requestRtcLog('1', '位置上报成功:' + JSON.stringify(res), self.data.orderid || '');
				},
				fail: (err) => {
					apis.requestReportLocation(0, 0)
						.then(res => { }).catch(err => { })
					self.requestRtcLog('1', '位置未授权:' + JSON.stringify(err), self.data.orderid || '');
				}
			})
		},
		//点击授权按钮
		bindAuthButton: function () {
			self._naviBack()
		},
		//监测网络
		_onNetworkStatusChange() {
			wx.onNetworkStatusChange(function (res) {
				console.log('res 网络监听', res)
				self.requestRtcLog('1', 'networkStatusChange:' + JSON.stringify(res), self.data.orderid);
				self._getNetWorkType();
			})
		},
		//检查网络
		_getNetWorkType() {
			wx.getNetworkType({
				success(res) {
					self.requestRtcLog(1, 'networkType: ' + JSON.stringify(res), self.data.orderid);
					if (res.networkType == 'none') {
						self.aboutHangUpSomething('网络已断开，连接超时')
						self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })

					}
				}
			})
		},

		//上报日志
		requestRtcLog(type, content, orderId) {
			hhDoctor.addLog(type, content, orderId);
			if ('life:detached' == content) {
				hhDoctor.refreshSession(500);
			}
		},
		//点击组建弹窗确定按钮
		bindTrtcModalConfirm() {
			self.stopAudio();
		},
		//trtc-modal组建弹窗提示
		_showModalTip(data) {
			if (self.data.phase == 3) {
				clearInterval(self.data.timerVideoChat);
				self.data.timerVideoChat = null;
				self.trtcComponent.exitRoom();
			}
			if ('undefined' == typeof data.isExitWx) {
				data.isExitWx = self.isOnlyOnePage()
			}
			self.setData({
				isShowModalTip: true,
				modal: { title: data.title || '提示', content: data.content, isExitWx: data.isExitWx }
			})
		},
		showToast(title, isBack) {
			self.setData({
				isShowToast: true,
				toastTitle: title
			})
			setTimeout(res => {
				self.setData({
					isShowToast: false,
				})
				if (isBack != 'noBack') self._naviBack()

			}, 3000)
		},
		_naviBack() {
			// 如果阳光私人医生团队项目
			if (this.data._request.sdkProductId == 10265 && getApp().globalData.loginUser &&
				getApp().globalData.loginUser.loadcfg && getApp().globalData.loginUser.loadcfg.doctorTeamUrl) {
				wx.redirectTo({ url: '../newIndex/newIndex' })
				return;
			}

			//如果页面栈中有多个页面，正常返回
			if (!self.isOnlyOnePage()) {
				wx.navigateBack()
				return
			}
			//如果只有1个页面（即当前页面），显示模态框提示用户，并退出小程序
			wx.hideLoading()
			wx.hideToast()
			self._showModalTip({ title: '提示', content: '即将退出小程序', isExitWx: true })
		},
		//评价页返回事件-关闭评价
		_closeEvaluate() {
			self.setData({ isEvaluate: false })
			self._naviBack()
		},
		//关闭“请不要离开此界面，以防视频中断”
		bindCloseHideTip() {
			self.setData({
				isHideTip: false
			})
		},
		isOnlyOnePage() {
			let pageList = getCurrentPages()
			return pageList.length == 1
		},

	}
})
