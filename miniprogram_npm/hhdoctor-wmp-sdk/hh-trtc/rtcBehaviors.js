const app = getApp();
const apis = require('../utils/api.js');
const dateUtil = require('../utils/dateUtil.js');
const hhDoctor = require('../hhDoctor.js');
let receivedMsgs = [];
let self;
let start;
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
			cancel:'cancel',
			iosWxVersion:'iOS_7.0.15'
		},
		hangupcommand: ['call_cancel', 'call_cancel', 'call_cancel', 'interrupt', 'REJECT', 'REJECT', 'call_cancel'],
		phaseArray: ['过渡中', '呼叫中', '排队中', '视频中', '医生回拨', '专家回拨', '观看视频中'],
		workbenchList: [],
		preReceivedCommand: '',
		cameraTorch: false, //手电筒
		photoIdx: 0, //预览上传图片的下标
		videoTimeStart: '', //先获取一下当前时间
		videoTime: '00:00',
		isClickHangUp: false,
		isDoctorHangUp:false,
		timerGetStatus: null, //检测发送call消息接收状态
		timerTransfer: null, //医生转呼
		timerChangeDoctor: null, //更换医生
		timerWaitVideo: null, //进入排队中
		timerWaittingTips: null, //显示排队提示
        timerVideoChat:null,//视频计时
		enterChooseImages :false,
		audio:{url:'https://imgs.hh-medic.com/icon/ring.mp3'},
        systeminfo:null,
        realPatientUuid:0,
        isShowModalTip:false,
		modal:null,
		s:null,
		w:null
	},
	attached: function() {
        self = this;
        wx.getSystemInfo({
            success: function (systeminfo) {
                console.log(systeminfo)
                self.setData({ systeminfo })
                self.requestRtcLog(1, JSON.stringify(systeminfo));
            }
		})
		self.data.s= self.data.systeminfo.system.split(' ');
		self.data.w = self.data.systeminfo.version.split('.');
    },
	ready() {
		self = this;
	},
	methods: {
		_getClearTimer() {
			clearInterval(self.data.timerGetStatus);
			clearInterval(self.data.timerWaitVideo);
			clearTimeout(self.data.timerTransfer);
			clearTimeout(self.data.timerChangeDoctor)
			clearTimeout(self.data.timerWaittingTips)
		},
		//注册监听通信
		_registMessageReceived() {
			hhDoctor.on('messageReceived', function(e) {
				if (e && e.length > 0) {
					let msgId = e[0].ID;
					if (receivedMsgs[msgId]) {
						return;
					}
					receivedMsgs[msgId] = msgId;
				}
				self.requestRtcLog(1, 'onImMessage:' + JSON.stringify(e), self.data.orderid);
				e.map((item, index) => {
					let obj = JSON.parse(item.payload.data);
					if (self.data.preReceivedCommand == obj.command && obj.command != 'waitUserInfo') {
						return;
					}
                    self.requestRtcLog(1, 'onImMessage-command:' + obj.command, self.data.orderid);
					self.data.preReceivedCommand = obj.command;
					self.data.workbenchList[obj.command] && self.data.workbenchList[obj.command](obj.orderId, obj, item.from,item.to);
				});
			});
		},
		// 向工作台发送消息
		sendMessage(command, newOrderid, fromId, success, fail) {
			console.log('sendMessage===*', self.data.orderid, command)
            if(self.data.isDoctorHangUp)return;
            if (self.data.isaboutHangUpSomething)return;
			return new Promise((resolve, reject) => {
				let data = self.data;
				if (data.orderid) {
					if (data.preCommand == command) {
						return;
					}
					let orderId = (command == 'busy' && newOrderid) ? newOrderid : data.orderid;
					let serviceType = data.doctor && data.doctor.serviceTypeStatus == 'zhuanke' ? 'zhuanke' : data._request.serviceType;
					let msgData = {
						command,
						orderId,
						serviceTypeStatus: serviceType,
						uuid: data.userID
					};
					console.log('sendMessage===*', msgData)

					let uuid = data.doctor ? data.doctor.login.uuid : 0;
					let toUser = command == 'busy' && fromId ? fromId : uuid;
					self.requestRtcLog('1', 'sendMessage start:' + command + '；type:' + serviceType, self.data.orderid);
					self.data.preCommand = command;
					hhDoctor.sendMessage(toUser, msgData, orderId).then(res => {
						console.log('发消息成功')
                        self.requestRtcLog('1', 'sendMessage success:' + command + '；type:' + serviceType, self.data.orderid);
						resolve();
					}).catch(res => {
						reject();
					})
				}
			})
		},
		// 注册IM执行方法存储
		_workbenchRegist() {
			let self = this;
			self.data.workbenchList['accept'] = self.workbenchAccept;
			self.data.workbenchList['busy'] = self.workbenchBusy;
			self.data.workbenchList['waitUserInfo'] = self.workbenchWait;
			self.data.workbenchList['call'] = self.workbenchCall;
			self.data.workbenchList['agent_transfer'] = self.workbenchAgentTransfer;
			self.data.workbenchList['cancel'] = self.workbenchInterrupt;
			self.data.workbenchList['interrupt'] = self.workbenchInterrupt;
			self.data.workbenchList['dispatchDoctorByONS'] = self.workbenchDispatchDoctorByONS;
		},
		//点击-切换摄像头
		bindSwitchCamera() {
            self.requestRtcLog('1', 'bind switchcamera' , self.data.orderid);
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
            self.requestRtcLog('1', 'createFamOrder start');
			self.data.createOrderPromise = apis.requestCreateFamOrder(deptId ? deptId : self.data._request.dept, famOrderId,
				self.data.systeminfo.platform, self.data.systeminfo.SDKVersion, self.data.realPatientUuid, self._request.appointedDoctorId, self._request.appointedOrderId,self.data._request.medicRecordId, self.data._request.hospitalId,self.data.realPatientUserToken).then(res => {
					console.log('创建订单====>',res)
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
					},()=>{
                        if (data.doctor) {
                            self.requestRtcLog('1', 'enter call success', self.data.orderid);
                            self.setData({
                                phase: 1
                            })
                            self.enterRoom(self.data.command.call)
                        } else {
                            self.requestRtcLog('1', 'enter callwait', self.data.orderid);
                            self.setData({
                                phase: 2
                            })
                            let preCallResponse = self.data.preCallResponse;
                            self.data.timerWaittingTips = setTimeout(function () {
                                self._showWaittingTips(preCallResponse.videoMsgTime, preCallResponse.videoMsgTemplate);
                            }, preCallResponse.videoMsgDelay * 1000);
                        }
                    })

				} else {
                    self._showModalTip({ content: res.message||'请保持网络流畅' })
				}
			}).catch(err => {
				console.log('创建订单err====>',err)
                self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })
			})
		},
		//更换医生封装函数
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
        requestChangeDoctor(){
            wx.showLoading();
            self.requestRtcLog('1', 'change doctor start', self.data.orderid);
            if (!self.data.orderid) return;
            apis.requestChangeDoctor(self.data.orderid).then(res => {
                wx.hideLoading();
                if (res.status == 200) {
                    self.requestHangUp('用户更换医生')
                    self.data.trtcComponent.exitRoom('UserExit')
                    self.setData({
                        isTransfer: true,
                        doctor: null,
                        phase: 0,
                        preCommand: '',
                        createOrderPromise: null,
                        isWorkbenchAccept: false,
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
		requestHangUp(reason, isBack) {
            console.log('调用挂断')
			if (!self.data.orderid) return;
			let data = self.data;
			let phase = data.phase;
			let videoTimeStart = data.videoTimeStart;
			let videoTime = 0;
			if ((phase == 0 || phase == 3) && videoTimeStart) {
				videoTime = parseInt((new Date().getTime() - videoTimeStart) / 1000);
			}
			let reasonText = encodeURIComponent(reason + '(' + data.phaseArray[phase] + ')');
			let serviceType = (data.doctor && data.doctor.serviceTypeStatus == 'zhuanke') ? 'zhuanke' : data._request.serviceType;
			let params = `?famOrderId=${data.orderid}&serviceType=${serviceType}&videoTime=${videoTime}&reason=${reasonText}`
            self.requestRtcLog('1', 'requestHangUp start；videoTime:'+videoTime +'s；'+ reason + '-' + data.phaseArray[phase], self.data.orderid);
            wx.showLoading();
			apis.requestHangUp(params).then(res => {
				wx.hideLoading();
				self.setData({
					videoTimeStart: '',
					videoTime: '00:00'
				})
                self.requestRtcLog('1', 'requestHangUp success:' + res.message + '-' + data.phaseArray[phase], self.data.orderid);
				if (res.status == 200) {
					if (res.data && res.data.question && data.isClickHangUp) {
						self.setData({
							isEvaluate: true,
							evaluateData: res.data
						})
					} else {
						if (isBack == 'isBack') {
							wx.navigateBack();
						}
					}
				} else {
					wx.showToast({
						title: res.message,
						icon: 'none',
						duration: 1500
					})
				}
			}).catch(err=>{
                wx.hideLoading();
                self._showModalTip({ title: '网络不给力', content: '请保持网络流畅' })
            })
		},
		//进入排队提示中
		_showWaittingTips(msgTimeSeconds, msgTemplate) {
			if (self.data.phase != 2) return;
			self.setData({
				waitTips: {
					videoTimeTip: msgTemplate.replace('{time}', msgTimeSeconds),
					waitVideoTips: true,
				}
			})
			clearInterval(self.data.timerWaitVideo);
			self.data.timerWaitVideo = setInterval(function() {
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

		// 进入视频计时
		_startVideoTimer() {
			self.data.videoTimeStart = new Date().getTime();
			console.log(self.data.videoTimeStart)
            self.data.timerVideoChat = setInterval(() => {
				if (!self.data.videoTimeStart) {
                    clearInterval(self.data.timerVideoChat);
                    self.data.timerVideoChat = null;
					return;
				}
				let vt = parseInt((new Date().getTime() - self.data.videoTimeStart) / 1000);
				self.setData({
					videoTime: dateUtil.formatTimeLength(vt)
				})
			}, 1000)
		},
		//关掉排队时观看的视频,返回排队页中
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
				success: function(res) {
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
		/** 检查用户授权 */
		_checkAuthorize: function() {
			return new Promise((resolve, reject) => {
				wx.authorize({
					scope: "scope.record",
					success: function() {
						console.log('麦克风已授权')
						wx.authorize({
							scope: "scope.camera",
							success: function() {
								console.log('摄像头已授权')

								resolve();
							},
							fail: function() {
								console.log('摄像头未授权')
								self.setData({
									isAuthBox: true
								})
								reject();
							}
						})
					},
					fail: function() {
						console.log('麦克风未授权')
                        wx.authorize({
                            scope: "scope.camera",
                            success: function () {
                                console.log('摄像头已授权')
                            },
                            fail: function () {
                                console.log('摄像头未授权')
                                self.setData({
                                    isAuthBox: true
                                })
                                reject();
                            }
                        })
						reject();
					}
				})
			})
		},

		//点击授权按钮
		bindAuthButton: function() {
			wx.navigateBack()
		},
        _onMemoryWarning(){
            wx.onMemoryWarning(function (res) {
                wx.showToast({
                    title: '小程序内存不足',
                    icon: 'none',
                    duration: 1000
                })
                self.requestRtcLog('1', 'onMemoryWarning:内存告警:' + JSON.stringify(res),self.data.orderid)
            })
        },
        _onNetworkStatusChange(){
            wx.onNetworkStatusChange(function (res) {
                self.requestRtcLog('1', 'networkStatusChange:' + JSON.stringify(res), self.data.orderid);
                self._getNetWorkType();
            })
        },
        _getNetWorkType(){
            wx.getNetworkType({
                success(res) {
                    self.requestRtcLog(1, 'networkType: ' + JSON.stringify(res), self.data.orderid);
                    if(res.networkType=='none'){
                        // self.aboutHangUpSomething('网络已断开，连接超时')
                        self._showModalTip({ title:'网络不给力', content:'请保持网络流畅'})
                    }
                }
            })
        },
		/** 上报日志 */
		requestRtcLog(type, content, orderId) {
		    hhDoctor.addLog(type, content, orderId);
		    if ('life:detached' == content) {
		        hhDoctor.refreshSession(500);
		    }
		},
        bindTrtcModalConfirm(){
            self.stopAudio();
        },
        _showModalTip(data){
            if(self.data.phase==3){
                clearInterval(self.data.timerVideoChat);
                self.data.timerVideoChat=null;
            }
            self.setData({
                isShowModalTip:true,
                modal: { title:data.title || '提示',content:data.content ,isExitWx:data.isExitWx}
            })
        }
      
	}
})
