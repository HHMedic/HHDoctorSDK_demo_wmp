const common = require('../utils/commonUtil.js');
const hhBehaviors = require('../hhBehaviors.js');
const innerAudioContext = wx.createInnerAudioContext()
const bgm = wx.getBackgroundAudioManager();
const rm = wx.getRecorderManager();
const hhDoctor = require('../hhDoctor.js');
const msgUtil = require('../utils/msgUtil.js');
const apis = require("../utils/api.js");
const md5 = require('../utils/md5.min.js');


var that;
var hhim;
var recordStardPosition = null;
var recording = false;
var reloadMsg = false;
var safeArea = 0;
var pageIsShowing = false;
var firstShow = true;
var voicePlaying = false;
var calling = false;
var intervalHandler = {
  liveList: null,
  resize: null
}
var apiUtil;

Component({
  behaviors: [hhBehaviors],
  /**
   * 组件的属性列表
   */
  properties: {
  },

  lifetimes: {
    attached() {
      that = this;
      rm.onStart(that._onRecordStart);
      rm.onStop(that._onRecordStop);
      pageIsShowing = true;
    },
    ready() { },
    detached() {
      pageIsShowing = false;
      that._clearAllIntervalHandler();
      hhDoctor.off('chatMessage');
    }
  },

  pageLifetimes: {
    show() {
      pageIsShowing = true;
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      this._addMonitor();
      this.setData({ sceneNum: wx.getLaunchOptionsSync().scene })
      if (!hhim) {
        return;
      }
      if (hhim) hhim.on('close', that._onWsClose);
      if (!hhim.loginStatus()) {
        getApp().globalData._hhim = null;
        that._viewIm();
      }
      that._getLiveListCycle();
      that._checkRecordAuth();
      this.getMember();
      this.checkNetStatus();
   
    },

    hide() {
      pageIsShowing = false;
      if (hhim) hhim.on('close', null);
      that._clearAllIntervalHandler();
      that.setData({ isAuthBox: false })
      wx.offNetworkStatusChange();
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-im',
    url: '',
    host: {},
    navStyle: 'custom',
    sysInfo: null, //小程序系统信息
    memberCallTop: -1200,
    msgPanelTop: 120, //中部消息列表顶部
    msgPanelHeight: 100, //中部消息列表高度
    livePanelHeight: 130,
    bottomHeight: 50, //底部输入和工具栏高度
    callBtnTop: 35,
    mainBtnHeight: 64,
    msgList: [], //消息列表数组
    lastMsgId: '', //最新消息id
    inputText: '', //用户输入的文字
    inputTypeClass: 'audio', //输入区域类型
    inputTextVisible: true, //文本输入是否可见
    recordMaskVisible: 'hidden', //录音遮罩层是否可见
    recordBtnTip: '按住 说话', //录音按纽的提示文字
    recordCancel: false, //是否取消录音
    animationData: null, //顶部按纽栏动画对象
    animationMemberData: null,
    utilsAnimation: null, //工具栏动画对象
    disconnAnimation: null,
    wxMbb: null, //右上角胶囊信息
    navigationBar: {
      bColor: '#ffffff',
      fColor: '#000000',
      text: ''
    },
    safeAreaHight: 34,
    customStyle: null,
    cardOptions: {
      medTitle: '用药说明',
      summaryTitle: '家庭医生视频咨询总结'
    },
    disConnected: false,
    personalIconLight: '',
    extendBtns: [],
    demoStatus: -1,
    liveList: [],
    /**临时数据 */
    roomNo: '123',
    userID: '',
    tapTime: '',
    template: 'bigsmall',
    isShowModal: false,//补全信息的弹窗开关
    isRecordAuth: true,//是否开启录音权限
    isAuthBox: false,//默认不显示授权弹出层
    isLoading: false,
    modalMsgData: { source: 'member', content: '请补充该成员的年龄等信息，才可呼叫医生', confirmText: '立即补充' },//disclaimer member 目前只有补充成员信息和免责声明用到该组件
    isAgreeExplain: true,//呼叫协议
    deleteCount: 0,//删除成员的个数 
    userToken:'',
    sdkProductId:'',
    memberList:[],
    patient:null,
    parent:null,
    isEnterFace:false,//是否打开人脸识别
    callPageUrl:'',
    showAddBtn:false

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      console.log(this.data._request)
      that._logInfo('初始化参数完成，准备启动IM...');
      apiUtil = require('../utils/apiUtil.js')
      firstShow = true;
      that._resize();
      /*if ('custom' == this.data.navStyle) {
        mHeight = this.data.wxMbb.top + (this.data._request.callPage ? 102 : 38);
      } else if (!this.data._request.callPage) {
        mHeight = 0;
      }
      this.setData({
        msgPanelTop: mHeight,
        msgPanelHeight: this.data.sysInfo.windowHeight - mHeight - safeArea - 50
      })*/
      hhDoctor.off('chatMessage');
      hhDoctor.on('chatMessage', that._onImMsg);
      that._applyStyle();
      that._addMonitor();
      that._viewIm();
      that._getLiveListCycle();
      that._getHistoryMsg();
      this.getMember();
      this.setData({
        userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0,
        explainUrl: encodeURIComponent(getApp().globalData._hhSdkOptions._host.wmpHost + 'wmp/license?type=2000'),
        userToken:this.data._request.userToken,
        sdkProductId: this.data._request.sdkProductId,
      })
      that._checkSceneNum();
      that._checkRecordAuth();

    },
    checkNetStatus(){
      wx.getNetworkType({
        success: (res) => {
          if(res.networkType=='none'){
            that.setData({disConnected:true})
            setTimeout(res=>{
              that.checkNetStatus()
            },500)
          }else{
            that.setData({disConnected:false})
          }
        },
      })
    },
    //检测来源
    _checkSceneNum(){
        let self = this;
        let forbiddenScene = getApp().globalData.loginUser?getApp().globalData.loginUser.loadcfg.forbiddenScene:'';
        console.log(forbiddenScene)

        if (!forbiddenScene && !forbiddenScene.length){
            return;
        }
        for (var i = 0; i < forbiddenScene.length; i++) {
            if (forbiddenScene[i].scene == self.data.sceneNum) {
                wx.reLaunch({
                    url: '/pages/error/error?msg=' + forbiddenScene[i].msg+'&btnText='+(forbiddenScene[i].btnText?forbiddenScene[i].btnText:'退出')
                })
                return;
            }
        }
    },
    _checkRecordAuth() {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.record']) {
            that.data.isRecordAuth = false;
          } else {
            that.data.isRecordAuth = true;
          }
        }
      })
    },
    // 获取家庭成员
    getMember: function () {
      if (this.data._request.userToken == 'unreg') {
        return;
      }
      wx.showLoading();
      apis.requestGetMember().then(res => {
        wx.hideLoading();
        if (res.status == 200) {
          let memberList = res.data.memberList;
          let patient = res.data.patient;
          memberList.unshift(patient)
          this.setData({
            memberList,
            showAddBtn: res.data.showAddBtn,
            showAccount: res.data.showAccount,
            relationList: JSON.stringify(res.data.relationList),
            deleteCount: res.data.deleteCount, 
            patient:res.data.patient,
            parent:res.data.parent?res.data.parent:null,
            isLoading: true ,
          })
            if (hhDoctor && hhDoctor.getUserId()) {
                hhDoctor.getUserInfo()
                    .then(() => {
                        this.setData({
                            userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0
                        })
                    })
            }
          //首次是否弹出信息不全提示
            let integrityCheck =getApp().globalData.loginUser.loadcfg.integrityCheck;
            if (!this.checkMemberMessage(patient.name, patient.sex, patient.birthday) && integrityCheck){
                this.setData({
                    modalMsgData: { source: 'member', content: '检测到您的信息不全，请补充您的年龄信息，才可呼叫医生', confirmText: '立即补充' },
                    isShowModal: true,
                    memberUuid: this.data.memberList[0].uuid
                })
            }
           
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      }).catch(err=>{
          wx.hideLoading();
      })
    },
    //添加家庭成员
    bindAddFimily: function () { 
      //检查自己信息是否补全
      if (!that.checkMemberMessage(that.data.memberList[0].name, that.data.memberList[0].sex, that.data.memberList[0].birthday)) {
        that.setData({
          modalMsgData: {
            source: 'member',
            content: '请补充自己的年龄等信息，才可添加成员',
            confirmText: '立即补充'
          },
          isShowModal:true,
          memberUuid: that.data.memberList[0].uuid
        })
        calling = false;
        return;
      } 
        if (!that.data.isAgreeExplain) {
            wx.showModal({
                title: '提示',
                content: '同意《视频医生服务说明》后\n可添加成员',
                showCancel: false,
                confirmColor: '#0592F5',
                confirmText: '我知道了',
                success() {
                    calling = false;
                }

            });
            return;
        }
      if (this.data.userCnt == -1) {
        this.navigateAddMember();
        return;
      }
      let userNum = this.data.userCnt - (this.data.memberList.length - 1) - this.data.deleteCount
      let modalCon = this.data.deleteCount > 0 ? `还可添加${userNum}成员（删除已添加成员后仍占用名额，已删除${this.data.deleteCount}成员），确定添加吗？` : `还可添加${userNum}成员（删除已添加成员后仍占用名额），确定添加吗？`
      this.setData({
        isShowModal: true,
        modalMsgData: { source: 'addmember', content: modalCon, confirmText: '确定添加' }
      })
    },
    //跳转添加成员 
    navigateAddMember() { 
      let params = `?relationList=${this.data.relationList}&showAccount=${this.data.showAccount}&isIndex=true&pageUrl=${this.data._request.callPage}`;
      wx.navigateTo({
        url: `${this.data.basePath}innerpages/ehr-addmember/ehr-addmember${params}`
      })
    },
    //是否同意呼叫协议点击
    _bindIsAgreeExplain() {
      that.setData({
        isAgreeExplain: !that.data.isAgreeExplain
      })
    },


    _onImMsg(msg) {
      that._parseMsg(msg);
    },

    _resize() {
      intervalHandler.resize = setInterval(() => {
        that._doResize().then(() => {
          that._logInfo('获取resize参数成功');
          that._clearIntervalHandler(intervalHandler.resize);
          let mHeight = 64;
          if ('custom' == that.data.navStyle) {
            mHeight = that.data.wxMbb.top + (that.data._request.callPage && that.data._request.callBtnVisible ? 102 : 38);
          } else if (!that.data._request.callPage || !that.data._request.callBtnVisible) {
            mHeight = 0;
          }
          that.setData({
            msgPanelTop: mHeight,
            msgPanelHeight: that.data.sysInfo.windowHeight - mHeight - safeArea - 50
          })
        })
      }, 100)
    },

    _doResize() {
      return new Promise((resolve, reject) => {
        let rect = wx.getMenuButtonBoundingClientRect();
        let res = wx.getSystemInfoSync();
        let styleName = 'custom';
        let bTop = 35;
        if (res.windowHeight < res.screenHeight) {
          styleName = 'default';
          bTop = -35;
        }
        that._getSafeAreaHeight(res);
        that.setData({
          sysInfo: res,
          wxMbb: rect,
          navStyle: styleName,
          callBtnTop: bTop
        })
        resolve();
      })
    },

    _viewImUnReg() {

    },
    _viewIm() {
      if ('unreg' == this.data._request.userToken && getApp().globalData._hhim) {
        //强制重新登录
        getApp().globalData._hhim.logout();
        getApp().globalData._hhim = null;
      }
      this._initHhImSdk(true, {
        onHistory: that._receiveHis,
        onMsg: that._receiveMsg,
        //onCall: that._onCall,
        onClose: that._onWsClose
      }, function (res) {
        if (200 == res.status) {
          that.setData({
            disConnected: false
          })
          that._triggerEvent('login', {
            login: true
          });
          hhim = getApp().globalData._hhim;
          hhim.clearCache();
          that.setData({
            demoStatus: hhim.getDemoStatus()
          })
          firstShow = false;
          /*wx.showLoading({
            title: '获取消息...',
            mask: true
          })
          setTimeout(function() {
            wx.hideLoading();
          }, 3000)*/
        } else {
          that._triggerEvent('login', {
            login: false
          });
        }
      });
    },

    _onWsClose() {
      that._logInfo('与服务器连接断开，正在尝试重连...');
      if (!firstShow) {
        that.setData({
          disConnected: true
        })
      }
      setTimeout(function () {
        if (hhim && hhim.loginStatus()) {
          return;
        }
        hhim = null;
        getApp().globalData._hhim = null;
        that._viewIm();
      }, 2000)
    },

    _addMonitor() {
      wx.onNetworkStatusChange(function (res) {
        if (!res.isConnected) {
          that.setData({disConnected: true})
          if (getApp().globalData._hhim) {
            getApp().globalData._hhim.logout();
            getApp().globalData._hhim = null;
          }
        } else if (that.data.disConnected) {
          setTimeout(function () {
            getApp().globalData._hhim = null;
            that._viewIm();
          }, 500)
        }
      })

      bgm.onEnded(that._onStopAudio);
    },

    /** 获取历史消息 */
    _getHistoryMsg() {
      wx.showLoading({
        title: '获取消息'
      })
      setTimeout(()=>{
        let asst = hhDoctor.getAsstInfo();
        if (!asst || !asst.uuid) {
          that._getHistoryMsg();
          return;
        };
          
        apiUtil.getHistoryMsg(asst.uuid).then((res) => {
          that._parseMsgHis(res);
          wx.hideLoading()
        }).catch(() => {
            wx.hideLoading()
  
        })
      },1000)
      
    },

    /** 收到历史消息 */
    _receiveHis(msgList) {
      if ('unreg' != that.data._request.userToken) {
        return;
      }
      that._addToMsgList(msgList, reloadMsg);
    },

    /** 收到即时消息 */
    _receiveMsg(msg) {
      if ('unreg' != that.data._request.userToken) {
        return;
      }
      that._addToMsgList([msg]);
    },

    /** 解析收到的消息 */
    _parseMsg(msg) {
      msg = msgUtil.parseMsgReceive(msg);
      console.log('msg解析收到的消息', msg)
      if (!msg.head || !msg.name) {
        let asst = hhDoctor.getAsstInfo();
        msg.head = asst.photo + '';
        msg.name = asst.name;
      }
      that._addToMsgList([msg]);
    },

    /** 解析收到的历史消息 */
    _parseMsgHis(res) {
      if (!res.data || 0 == res.data.length) return;
      let msgList = msgUtil.parseMsgHistory(res);
      let uuid = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      if (null == msgList || 0 == msgList.length) return;
      for (let i = 0; i < msgList.length; i++) {
        if (!msgList[i].head || !msgList[i].name) {
          let isUser = parseInt(msgList[i].from) == uuid;
          msgList[i].from = isUser ? 'c' : 'd';
          msgList[i].head = isUser ? hhDoctor.getUserPhoto() : asst.photo;
          msgList[i].name = isUser ? '' : asst.name;
        }
      }
      that._addToMsgList(msgList);
    },

    /** 将收到的消息加入数组 */
    _addToMsgList(msgList, reload) {
      if (!msgList || 0 == msgList.length) {
        return;
      }
      var msgId = '';
      var lastMsgTime = '';
      var list = this.data.msgList;
      if (reload) {
        if (list.length > 0) {
          lastMsgTime = list[0].time;
        }
        list = [];
      }
      for (var i = 0; i < msgList.length; i++) {
        var msg = this._precessMsg(msgList[i]);
        if (!this.data._request.callPage &&
          msg.text &&
          msg.text.indexOf('呼叫') >= 0) {
          continue;
        }
        if (!this.data._request.callPage &&
          'card' == msg.type) {
          continue;
        }
        list.push(msg);
        if (!reload) {
          msgId = 'msg' + msgList[i].time;
        } else if (i > 0 && lastMsgTime == msgList[i].time) {
          msgId = 'msg' + msgList[i - 1].time;
        }
      }
      this.setData({
        msgList: list,
        lastMsgId: msgId
      })

    },
    _precessMsg(msg) {
      //将unix时间戳格式化成文本
      var f = common.formatDate('MM月dd日 hh:mm', parseInt(msg.time));
      msg.timeText = f;
      if (msg.dur) {
        //格式化音频类消息的时长字段
        var dur = msg.dur / 1000;
        dur = dur.toFixed(1);
        msg.durText = dur;
      }

      if ('card' == msg.type &&
        'buyDrugInformation' == msg.bodyContent.command) {
        //获取药卡的最新状态
        var drugOrderId = msg.bodyContent.drugOrderId;
        if (drugOrderId) {
          var payStatus = wx.getStorageSync('drugOrderPay_' + drugOrderId);
          if (payStatus && 1 == payStatus) {
            msg.bodyContent.buttonName = '查看订单';
          } else {
            this._updateDrugOrderStatus(drugOrderId);
          }
        }
      }
      return msg;
    },

    _updateDrugOrderStatus(orderId) {
      var url = this._getHost().wmpHost +
        'im/getDrugOrderInfo?orderId=' + orderId +
        '&userToken=' + this.data._request.userToken;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            if (1 == res.data.data.famOrderDrug.isPay) {
              //已付款
              that._updateDrugOrderCommandText(orderId);
            }
          }
        }
      })
    },
    //检查医生状态
    _checkBlackList() {
      return new Promise((resolve, reject) => {
        let url = this._getHost().wmpHost +
          'wmp/isInBlack' +
          '?sdkProductId=' + this.data._request.sdkProductId +
          '&userToken=' + this.data._request.userToken;
        wx.request({
          url: url,
          data: {},
          method: 'POST',
          success: function (res) {
            if (res && res.data &&
              200 == res.data.status &&
              !res.data.data) {
              resolve();
            } else {
              reject();
            }
          },
          fail: function () {
            reject();
          }
        })
      })
    },
    _updateDrugOrderCommandText(orderId) {
      wx.setStorage({
        key: 'drugOrderPay_' + orderId,
        data: 1
      })
      var list = this.data.msgList;
      for (var i = 0; i < list.length; i++) {
        if (list[i].bodyContent && orderId == list[i].bodyContent.drugOrderId) {
          list[i].bodyContent.buttonName = '查看订单';
          this.setData({
            msgList: list
          })
          return;
        }
      }
    },
    /** 显示或隐藏呼叫医生弹出层 */
    _showHideBtn() {
      this._showBtn(!this.data.callBtnsVisible);
    },

    /** 隐藏呼叫医生弹出层 */
    _hideBtn() {
      this._showBtn(false);
      this._showUtils(false);
    },

    /** 动画修改呼叫医生弹出层的高度 */
    _showBtn(visible) {
      if (visible == this.data.callBtnsVisible) {
        return;
      }

      var animation = wx.createAnimation({
        duration: 250,
        timingFunction: 'ease-in-out',
      })
      // 选择成员列表弹出动画
      this.data.memberCallTop = this.data.msgPanelTop;
      var topPx = visible ? this.data.memberCallTop : -(this.data.memberList.length * 98 + 178);
      animation.top(topPx).step();
      this.setData({
        callBtnsVisible: visible,
        animationMemberData: animation.export(),
      })

      // var topPx = visible ? this.data.msgPanelTop : this.data.callBtnTop;
      // animation.top(topPx).step();
      // this.setData({
      //   callBtnsVisible: visible,
      //   animationData: animation.export(),
      // })


      // if (1 == this.data.demo) {
      //   setTimeout(function () {
      //     that.setData({
      //       showDemoTip: !visible
      //     })
      //   }, visible ? 0 : 250)
      // }
    },

    /** 显示或隐藏底部的工具栏 */
    _showHideUtils() {
      if (this.data.bottomHeight < 100) {
        this._showUtils(true);
      } else {
        this._showUtils(false);
      }
    },

    /** 修改底栏高度 */
    _showUtils(visible) {
      this.setData({
        bottomHeight: visible ? 260 : 50,
        safeAreaHight: visible ? 0 : safeArea
      })
    },

    _changeDemoStatus() {
      that.setData({
        demoStatus: 1 - that.data.demoStatus
      })
      return false;
    },
    //检查成员信息是否补全
    checkMemberMessage(name,sex,birthday) {
      let obj = {}
      obj['birthday'] = birthday;
      obj['name'] = name;
      obj['sex'] = sex;
      this.setData({storeMsg:obj})
      for (var key in obj) {
          if (obj[key] == '' || !obj[key] || obj[key] == '请完善信息以发起呼叫') {
          return false;
        }
      }
      return true;
    },
    _bindMyConfirm(e) {
      that.setData({
        isShowModal: false
      })
      switch (e.currentTarget.dataset.type) {
        case 'member':
              let params = '?isUpdate=' + true + '&pageUrl=' + that.data._request.callPage + '&memberUuid=' + that.data.memberUuid + '&item=' + JSON.stringify(that.data.storeMsg);
          wx.navigateTo({
            url: `/components/innerpages/ehr-addmember/ehr-addmember${params}`
          })
          break;
		   case 'addmember':that.navigateAddMember(); 
			break; 
         case 'disclaimer':
          that._viewMedixcine(that.data.modalMsgData.params.drugid, that.data.modalMsgData.params.redirectPage)
          break;
      }
    },

    /** 点击呼叫医生 */
    _callDoctor(e) {
      this._hideBtn();
      if (!this.data._request.callPage || !this.data._request.callBtnVisible) {
        return;
      }
      if (calling) {
        return;
      }
      calling = true;
      wx.showLoading({
        title: '连接中...',
      })
      let uuid = e.currentTarget.dataset.uuid ? e.currentTarget.dataset.uuid : getApp().globalData.uuid;
      
      var callTimeout = 0;
      var callInterval = setInterval(function () {
        if (callTimeout >= 5000) {
          //超时，显示提示信息
          wx.hideLoading();
          calling = false;
          clearInterval(callInterval);
          wx.showModal({
            title: '网络不给力',
            content: '建议切换网络或稍后呼叫医生',
            showCancel: false,
            confirmText:'我知道了',
            confirmColor:'#0592f5',
            success: function () {
              that._onWsClose();
              // wx.navigateBack({
              //   delta: 1
              // })
            }
          })
          return;
        }
        if (!that.data.disConnected && hhim && hhim.loginStatus()) {
          //登录成功，可以呼叫
          wx.hideLoading();
          clearInterval(callInterval);

          //检查是否是黑名单
          that._checkBlackList()
            .then(() => {
              console.log('检测黑名单then')
              //用户是否同意视频医生协议
              if (!that.data.isAgreeExplain) {
                wx.showModal({
                  title: '提示',
                  content: '同意《视频医生服务说明》后\n可发起咨询',
                  showCancel: false,
                  confirmColor: '#0592F5',
                  confirmText: '我知道了',
                  success() {
                    calling = false;
                  }
                })
                return;
              }
              //检查信息是否补全
              if (!that.checkMemberMessage(e.currentTarget.dataset.name, e.currentTarget.dataset.sex, e.currentTarget.dataset.birthday)) {
                that.setData({
                    modalMsgData: { source: 'member', content: '请补充该成员的年龄等信息，才可呼叫医生', confirmText: '立即补充'},
                  isShowModal: true,
                  memberUuid: e.currentTarget.dataset.uuid
                })
                calling = false;
                return;
              }
              //是否为演示模式
              if (1 == that.data.demoStatus) {
                that._callDemo(e.currentTarget.dataset.dept, 4, uuid);
                return;
              }
                //获取时间戳
                let timestamp = Date.parse(new Date());
                let preTimeStamp = wx.getStorageSync('preTimeStamp') || 0;
                let seconds = parseInt((timestamp - preTimeStamp) / 1000)
                if (seconds < 8) {
                    wx.showToast({
                        title: '操作太频繁啦，稍后再试',
                        icon: 'none',
                        mask: true,
                        duration: 3000
                    })
                    calling = false;
                    return;
                }
                wx.setStorageSync('preTimeStamp', timestamp)

              //正式呼叫 如果是选择成员 就传成员id 否则就传自己的 以供评价使用
              let pageUrl = that.data._request.callPage + '?' + that._getPublicRequestParams() + '&dept=' + e.currentTarget.dataset.dept + '&uuid=' + uuid;
              if(that.data._request.sdkProductId==10182){
                that.setData({
                  isEnterFace:true,
                  callPageUrl:pageUrl
                })
                calling = false;
                return;
              }
              wx.navigateTo({
                url: pageUrl
              })
              calling = false;
            })
            .catch(() => {
              console.log('检测黑名单catch')
              //进入演示模式
              that._callDemo(e.currentTarget.dataset.dept, 5, uuid);
              calling = false;
            })

          return;
        }
        callTimeout += 100;
      }, 100)
    },
    bindContinue(){
      that.setData({
        isEnterFace:false     
      })
      wx.navigateTo({
        url: that.data.callPageUrl
      })
    },
    bindBeginFaceVerify(e){
      let self = this;
      self.setData({
        isEnterFace:false
      })
      wx.startFacialRecognitionVerify({
        name:e.detail.username,
        idCardNumber: e.detail.cardid,
        checkAliveType: 2,
        success(res) {
          console.log('success',res)
          wx.navigateTo({
            url: self.data.callPageUrl
          })
        },
        fail(err) {
          console.log('fail',err)
          //如果是被投保人刷脸失败 => 显示让投保人协助认证
          //如果是投保人协助认证刷脸失败 =>显示为被投保人自己刷脸 err.errCode==90100
          if(self.data.parent.uuid!=self.data.patient.uuid){
           let content = (e.detail.username==self.data.parent.name)?'可让被保人'+self.getStarName(self.data.patient.name)+'刷脸认证':'可让投保人'+self.getStarName(self.data.parent.name)+'刷脸帮助认证';
            wx.showModal({
              content: '若刷脸认证失败，'+content,
              confirmText:'我知道了',
              confirmColor:'#0592f5',
              cancelColor:'#666',
              showCancel:false,
              success(){
                
              }
            })
          }
        },
        complete(){
         

        }
  
      })
    },
    getStarName(str){
      return '*'+str.substring(1,str.length)
    },
    //关闭人脸认证界面
    bindCloseFaceVerify(){
      this.setData({isEnterFace:false})
    },

    _callDemo(deptId, type, uuid) {
      var pageUrl = that.data._request.demoPage + '?' + that._getPublicRequestParams() + '&dept=' + deptId + '&openType=' + type + '&uuid=' + uuid;
      wx.navigateTo({
        url: pageUrl
      })
      calling = false;
    },

    /** 切换显示语音输入和文字输入 */
    _changeInputType() {
      this._showUtils(false);
      var isAudio = 'audio' == this.data.inputTypeClass;
      this.setData({
        inputTypeClass: isAudio ? 'keyboard' : 'audio',
        inputTextVisible: !isAudio
      })
    },

    /** 输入文本消息 */
    _inputText(e) {
      this.setData({
        inputText: e.detail.value
      })
    },

    /** 发送文本消息 */
    _sendTextMsg(e) {
      if (that.data.inputText && hhim && hhim.loginStatus()) {
        hhim.sendText(that.data.inputText, that._sendCallback, that.data._request.appointedOrderId);
      }
      that.setData({
        inputText: ''
      })
    },

    /** 开始录音 */
    _startRecord(e) {
      if (!that.data.isRecordAuth) {
        that.setData({ isAuthBox: true })
        wx.authorize({
          scope: 'scope.record',
          success(s) {
            that.setData({
              isAuthBox: false,
              isRecordAuth: true
            })
          }
        })
        return;
      }
      if (recording) {
        wx.showToast({
          title: '录音中请稍候',
          icon: 'none'
        })
        return;
      }

      this.setData({
        recordBtnTip: '松开 结束',
        recordMaskVisible: '',
        recordCancel: false
      })
      recordStardPosition = e.touches[0].clientY;
      rm.start({
        format: 'mp3'
      });
    },

    /** 停止录音 */
    _stopRecord(e) {
      if (!that.data.isRecordAuth) {
        return;
      }
      this._doStopRecord()
        .then(() => {
          that.setData({
            recordBtnTip: '按住 说话',
            recordMaskVisible: 'hidden'
          })
          recordStardPosition = null;
        })
    },

    _doStopRecord() {
      return new Promise((resolve, reject) => {
        let t = setInterval(function () {
          if (recording) {
            clearInterval(t);
            rm.stop();
            resolve();
          }
        }, 100)
      })
    },

    /** 取消录音 */
    _cancelRecord(e) {
      if (recordStardPosition) {
        var deltarY = Math.abs(e.touches[0].clientY - recordStardPosition);
        if (deltarY > 50) {
          this.setData({
            recordCancel: true
          })
        } else {
          this.setData({
            recordCancel: false
          })
        }
      }
    },

    _onRecordStart() {
      recording = true;
    },
    /** 录音结束后调用上传 */
    _onRecordStop(res) {
      recording = false;
      if (that.data.recordCancel) {
        return;
      }
      if (res.duration <= 500) {
        wx.showToast({
          title: '录音时长过短',
          icon: 'none'
        })
        return;
      }
      // wx.showLoading({
      //   title: '发送中...',
      // })
      hhim.sendAudio(res.tempFilePath, res.duration, that._sendCallback, that.data._request.appointedOrderId);
      // setTimeout(function() {
      //   wx.hideLoading();
      // }, 5000);
    },

    /** 预览图片 */
    _previewImg(e) {
      wx.previewImage({
        current: e.currentTarget.dataset.url,
        urls: [e.currentTarget.dataset.url],
      })
    },

    /**播放语音 */
    _playAudio(e) {
      if (voicePlaying) {
        wx.hideLoading();
        bgm.stop();
        voicePlaying = false;
        return;
      }
      var url = e.currentTarget.dataset.url;
      bgm.title = 'bgm' + new Date().getTime();
      bgm.src = url;
      voicePlaying = true;
      wx.showToast({
        title: '播放中...',
        icon: 'loading',
        duration: parseInt(e.currentTarget.dataset.dur)
      })
    },

    _onStopAudio() {
      wx.hideLoading();
      voicePlaying = false;
    },

    /** 选择图片或拍照 */
    _selectImage(e) {
      this._showUtils(false);
      var imgCount = 'camera' == e.currentTarget.dataset.type ? 1 : 9;
      wx.chooseImage({
        count: imgCount,
        sizeType: ['original'],
        sourceType: [e.currentTarget.dataset.type],
        success: function (res) {
          wx.showLoading({
            title: '发送中...'
          })
          hhim.sendImages(res.tempFilePaths, that._sendCallback, that.data._request.appointedOrderId);
          setTimeout(function () {
            wx.hideLoading();
          }, imgCount * 2000);
        },
      })
    },

    /** 发送消息回调 */
    _sendCallback(res) {
      if (res.success && 'unreg' != that.data._request.userToken) {
        that._addToMsgList([res.imMessage]);
      }
      if (res.allDone) {
        wx.hideLoading();
      }
    },

    /** 点击查看视频咨询总结卡片 */
    _viewSummary(e) {

    //   this._viewEhr({
    //     viewModule: 'detail',
    //     patient: e.currentTarget.dataset.patient,
    //     medicRecordId: e.currentTarget.dataset.mrid
    //   });
        let medicRecordId = e.currentTarget.dataset.mrid;
        let patient = e.currentTarget.dataset.patient;
        wx.navigateTo({
            url: `${this.data.basePath}innerpages/ehr-filingdetail/ehr-filingdetail?id=${medicRecordId}&memberUuid=${patient}`
        })
    },

    _applyStyle() {
      if (!this.data._request.style) {
        return;
      }
      var style = this.data._request.style;
      if (style.extendBtns) {
        this.setData({
          extendBtns: style.extendBtns
        })
      }
      if (this.data.extendBtns.length > 0) {
        this.setData({
          msgPanelHeight: this.data.msgPanelHeight - 40
        })
      }

      this._setNavigationBar();

      if (style.customStyle && style.customStyle.length > 0) {
        var cStyle = {};
        for (var i = 0; i < style.customStyle.length; i++) {
          var ss = that._getCustomStyle(style.customStyle[i].style);
          switch (style.customStyle[i].item) {
            case '.main-btn':
              cStyle.mainBtn = ss;
              break;
            case '.pop-btn':
              cStyle.popBtn = ss;
              break;
            case '.pop-btn-text':
              cStyle.popBtnText = ss;
              break;
            default:
              break;
          }
        }
        that.setData({
          customStyle: cStyle
        })
      }

      if (style.card) {
        var card = that.data.cardOptions;
        if (style.card.medTitle) {
          card.medTitle = style.card.medTitle
        }
        if (style.card.summaryTitle) {
          card.summaryTitle = style.card.summaryTitle
        }
        that.setData({
          cardOptions: card
        })
      }
      if (style.asst) {

      }
    },

    _setNavigationBar() {
      let navBar = this.data.navigationBar;
      let style = this.data._request.style;
      if (style.navigationBar) {
        navBar = Object.assign(navBar, style.navigationBar);
      } else {
        if (style.navBarBg) {
          navBar.bColor = style.navBarBg;
        }
        if (style.navBarFg) {
          navBar.fColor = style.navBarFg;
        }
        if (style.pageTitle) {
          navBar.text = style.pageTitle;
        }
      }
      this.setData({
        navigationBar: navBar
      })
      wx.setNavigationBarColor({
        frontColor: navBar.fColor,
        backgroundColor: navBar.bColor
      })
      wx.setNavigationBarTitle({
        title: navBar.text
      })

      if (style.personalIconClass) {
        this.setData({
          personalIconLight: style.personalIconClass
        })
      } else {
        this._setPersonalIcon(navBar.bColor);
      }
    },

    _setPersonalIcon(bg) {
      if (bg.indexOf('#') < 0) return;
      if (7 != bg.length) return;

      var r = parseInt(bg.substring(1, 3), 16);
      var g = parseInt(bg.substring(3, 5), 16);
      var b = parseInt(bg.substring(5, 7), 16);
      if ((r + g + b) / 3 < 128) {
        this.setData({
          personalIconLight: 'light'
        })
      }
    },

    _getCustomStyle(style) {
      var str = '';
      for (var item in style) {
        str += item + ":" + style[item] + ";";
      }
      return str;
    },
    _loadMoreHisMsg() {
      if (!hhim) {
        return;
      }
      reloadMsg = true;
      hhim.getHisMsg(true);
    },

    _getSafeAreaHeight(info) {
      if (info.model.toLowerCase().indexOf('iphone x') >= 0) {
        safeArea = 34;
      } else {
        if (info.safeArea) {
          safeArea = info.screenHeight - info.safeArea.bottom
        }
      }
      that.setData({
        safeAreaHight: safeArea
      })
    },
    _naviToApp() {
      //从小程序跳转过来的      
      if (this.data.sceneNum == 1037) {
        wx.navigateBackMiniProgram();
      }
      //从上一个页面进来的
      if (this.data.sceneNum == 1001) {
        wx.navigateBack();
      }

    },
    //个人中心
    _viewPers() {
      var pageUrl = this.data._request.personalPage ? this.data._request.personalPage : this.data.basePath + 'innerpages/user/user';
      pageUrl += '?' + this._getPublicRequestParams();
      if (!this.data._request.personalPage) {
        pageUrl += '&addressPage=' + this.data._request.addressPage + '&payPage=' + this.data._request.payPage + '&autoAcl=true';
      }
      pageUrl += '&regPage=' + this.data._request.regPage;

      wx.navigateTo({
        url: pageUrl
      })

  
    },

    _buyService(e) {
      this._logInfo('buyService...');
      this._viewPersonal('payselect');
    },
    _buyProduct() {
        var pageUrl = this.data.basePath + 'innerpages/buyProduct/buyProduct?' + this._getPublicRequestParams() + '&payPage=' + this.data._request.payPage;
      wx.navigateTo({
        url: pageUrl,
      })
    },
    //点击药卡
    _buyMedicine(e) {
      this._logInfo('buyMedicine...');
      if (!e.currentTarget.dataset.trans) {
        return;
      }
    //  if (e.currentTarget.dataset.carturl) {
    //     //妙药
    //     let carturl = e.currentTarget.dataset.carturl + '&thirdId=' + getApp().globalData.openId
    //     this._viewMedicineMiaoHealth(carturl);
    //   }else{
    //     //和缓
    //     this._viewMedicine(e.currentTarget.dataset.drugid, this.data._request.redirectPage);
    //   }
    console.log(e)
    if (this.data._request.sdkProductId == 10182){
      let channelName = 'zhbx';//渠道名称 必传 固定值 不能修改
      let orderId= e.currentTarget.dataset.drugid; //订单ID 必传
      let appId = 'wxa090add7f8c97f94';
      let appKey = '756c550269b379b35fc6a5de7912fe99';
      let sign = md5(appKey + channelName + orderId); //签名 必传
      let path = `pages/zhbx/pages/index/index?channelName=${channelName}&orderId=${orderId}&sign=${sign}`;
      wx.navigateToMiniProgram({
        appId: appId,
        path: path,
        envVersion: 'trial'//trial 体验版  release 正式版
      })
    }else if (e.currentTarget.dataset.carturl) {
      //妙药
      let carturl = e.currentTarget.dataset.carturl + '&thirdId=' + getApp().globalData.openId
      this._viewMedicineMiaoHealth(carturl);
    }else{
      //和缓
      this._viewMedicine(e.currentTarget.dataset.drugid, this.data._request.redirectPage);
    }
    },

    _tapExtendBtn(e) {
      if (!e.currentTarget.dataset.btn) {
        return;
      }
      var btn = e.currentTarget.dataset.btn;
      switch (btn.type) {
        case 'view':
          this._viewUrl(btn.url);
          break;
        case 'click':
          this._clickExtendBtn(btn.key);
          break;
        default:
          return;
      }
    },

    _clickExtendBtn(key) {
      wx.showLoading({
        title: '请稍候...',
      })
      var url = this._getHost().wmpHost +
        'im/clickExtendBtn?' + this._getPublicRequestParams() +
        '&extendBtnKey=' + key;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            //成功
          } else {
            var msg = (res && res.data && res.data.message) ? res.data.message : '网络开小差了，请稍后再试';
            wx.showModal({
              title: '出错了',
              content: msg,
            })
          }
        },
        fail: function () {
          wx.hideLoading();
          wx.showModal({
            title: '出错了',
            content: '网络开小差了，请稍后再试',
          })
        }
      })
    },

    _getLiveListCycle() {
      that._clearIntervalHandler(intervalHandler.liveList);
      /*if (intervalHandler.liveList) {
        clearInterval(intervalHandler.liveList);
        intervalHandler.liveList = null;
      }*/
      that._getLiveList();
      intervalHandler.liveList = setInterval(function () {
        that._getLiveList();
      }, 30000)
    },
    /** 获取直播列表 */
    _getLiveList() {
      if ('unreg' == that.data._request.userToken ||
        !that.data._request.callPage || !that.data._request.callBtnVisible) {
        that.setData({
          livePanelHeight: 0
        })
        return;
      }
      let url = this._getHost().wmpHost +
        'video/bannerList?' + this._getPublicRequestParams();
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res && res.data) {
            that._filterLiveList(res.data.list)
          }

        },
        fail: function () {
          that.setData({
            livePanelHeight: 0
          })
        }
      })
    },
    _filterLiveList(list) {
      let liveList = [];
      for (var i = 0; i < list.length; i++) {
        if (0 == list[i].liveStatus || 1 == list[i].liveStatus) {
          liveList.push(list[i]);
        }
        if (2 == liveList.length) {
          break;
        }
      }
      that.setData({
        liveList: liveList
      })
      that.setData({
        livePanelHeight: that.data.liveList.length > 0 ? 130 : 0
      })
    },
    _tapLive(e) {
      let live = e.currentTarget.dataset.live;
      if (live.id < 0) return;
      switch (live.liveStatus) {
        case 0:
          wx.showToast({
            title: live.message ? live.message : '请查看开播时间，记得按时观看哦',
            icon: 'none',
            duration: 2500
          })
          break;
        case 1:
          let pageUrl = that.data.basePath + 'innerpages/video/video?' +
            that._getPublicRequestParams() +
            '&liveSource=WMP_BANNER_LIVE' +
            '&enableLiveShare=' + that.data._request.enableLiveShare +
            '&filterType=live' +
            '&videoType=live' +
            '&videoId=' + live.id;
          wx.navigateTo({
            url: pageUrl,
          })
          break;
        default:
          break;
      }

      //上报日志
      apiUtil.reportTrace(live.id, 'live', 'WMP_BANNER_CLICK');
    },

    _clearAllIntervalHandler() {
      Object.keys(intervalHandler).forEach(function (key) {
        that._clearIntervalHandler(intervalHandler[key]);
      });
    },

    _clearIntervalHandler(handler) {
      if (handler) {
        clearInterval(handler);
        handler = null;
      }
    }
  }
})