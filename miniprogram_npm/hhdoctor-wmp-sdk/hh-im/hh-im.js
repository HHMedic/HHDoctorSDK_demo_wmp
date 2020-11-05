const common = require('../utils/commonUtil.js');
const hhBehaviors = require('../hhBehaviors.js');
const innerAudioContext = wx.createInnerAudioContext()
const bgm = wx.getBackgroundAudioManager();
const hhDoctor = require('../hhDoctor.js');
const msgUtil = require('../utils/msgUtil.js');
const apis = require("../utils/api.js");
const md5 = require('../utils/md5.min.js');
var that;
var hhim;
var voicePlaying = false;
var reloadMsg = false;
var safeArea = 0;
var pageIsShowing = false;
var firstShow = true;
var intervalHandler = {
  liveList: null,
  resize: null
}
var apiUtil;

Component({
  behaviors: [hhBehaviors],
  lifetimes: {
    attached() {
      that = this;
      pageIsShowing = true;
    },
    ready() { },
    detached() {
      pageIsShowing = false;

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

      if (!hhim) {
        return;
      }
      if (hhim) hhim.on('close', that._onWsClose);
      if (!hhim.loginStatus()) {
        getApp().globalData._hhim = null;
        that._viewIm();
      }
      this.checkNetStatus();
      this._getHistoryMsg();


    },
    hide() {
      pageIsShowing = false;
      if (hhim) hhim.on('close', null);
      that.setData({ isAuthBox: false })
      wx.offNetworkStatusChange();
    }
  },
  data: {
    _name: 'hh-im',
    url: '',
    host: {},
    navStyle: 'custom',
    sysInfo: null, //小程序系统信息
    msgPanelTop: 120, //中部消息列表顶部
    msgPanelHeight: 100, //中部消息列表高度
    livePanelHeight: 130,
    callBtnTop: 35,
    mainBtnHeight: 64,
    msgList: [], //消息列表数组
    lastMsgId: '', //最新消息id
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
    /**临时数据 */
    demoStatusInit: -1,
    userID: '',
    tapTime: '',
    userToken: '',
    sdkProductId: '',
  },
  methods: {
    _requestComplete() {
      console.log(this.data)
      that._logInfo('初始化参数完成，准备启动IM...');
      apiUtil = require('../utils/apiUtil.js')
      firstShow = true;
      that._resize();
      hhDoctor.off('chatMessage');
      hhDoctor.on('chatMessage', that._onImMsg);
      that._applyStyle();
      that._addMonitor();
      that._viewIm();
      apiUtil.reportTrace(-1, 'live', 'WMP_OPEN');
      that._getHistoryMsg();
      this.setData({
        userToken: this.data._request.userToken,
        sdkProductId: this.data._request.sdkProductId
      })
    },
    checkNetStatus() {
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType == 'none') {
            that.setData({ disConnected: true })
            setTimeout(res => {
              that.checkNetStatus()
            }, 500)
          } else {
            that.setData({ disConnected: false })
          }
        },
      })
    },

    bindLivePanelHeight(e) {
      that.setData({ livePanelHeight: e.detail.livePanelHeight })
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
    _viewIm() {
      if ('unreg' == this.data._request.userToken && getApp().globalData._hhim) {
        //强制重新登录
        getApp().globalData._hhim.logout();
        getApp().globalData._hhim = null;
      }
      this._initHhImSdk(true, {
        onHistory: that._receiveHis,
        onMsg: that._receiveMsg,
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
            demoStatusInit: hhim.getDemoStatus()
          })

          firstShow = false;
        } else {
          that._triggerEvent('login', {
            login: false
          });
        }
      });
    },
    //hh-top触发
    bindOnWsClose() {
      that._onWsClose();
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
          that.setData({ disConnected: true })
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

      if ('unreg' == this.data._request.userToken) return;
      wx.showToast({
        title: '获取消息',
        icon: 'loading',
        duration: 1000
      })

      setTimeout(() => {
        let asst = hhDoctor.getAsstInfo();
        if (!asst || !asst.uuid) {
          that._getHistoryMsg();
          return;
        };
        apiUtil.getHistoryMsg(asst.uuid).then((res) => {
          console.log('获取历史消息', res)
          that.data.msgList = [];
          that._parseMsgHis(res);
        }).catch(() => {
        })
      }, 1000)

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
      if ('card' == msg.type &&
        'appointmentExpertSuccess' == msg.bodyContent.command) {
        //格式化预约视频成功消息的预约时间字段
        let time = common.formatDate('MM月dd日 hh:mm', parseInt(msg.bodyContent.time));
        msg.bodyContent.timeText = time;
      }

      return msg;
    },

    _updateDrugOrderStatus(orderId) {
      wx.showLoading();
      var url = this._getHost().wmpHost +
        'im/getDrugOrderInfo?orderId=' + orderId +
        '&userToken=' + this.data._request.userToken;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
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

    _getMsgByDrugId(drugId) {
      let list = this.data.msgList.filter(msg => {
        return msg.bodyContent && msg.bodyContent.drugOrderId == drugId
      })
      return list && list.length > 0 && list[0] || null
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
    bindEveryIcon(e){
      console.log(e)
      switch(e.detail.type){
        case 'camera':
        case 'album':that._selectImage(e.detail.type)
        break;
        case 'accompany':that.selectComponent('#hhTop')._bindCheckAuthList(1)//呼叫医生-多人视频界面_bindCheckAuthList
      }
    },

    /** 选择图片或拍照 */
    _selectImage(type) {
      var imgCount = 'camera' == type ? 1 : 9;
      wx.chooseImage({
        count: imgCount,
        sizeType: ['original'],
        sourceType: [type],
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
      console.log(e)
      if (this.data._request.sdkProductId == 10182) {
        let channelName = 'zhbx';//渠道名称 必传 固定值 不能修改
        let orderId = e.currentTarget.dataset.drugid; //订单ID 必传
        let appId = 'wxa090add7f8c97f94';
        let appKey = '756c550269b379b35fc6a5de7912fe99';
        let sign = md5(appKey + channelName + orderId); //签名 必传
        let path = `pages/zhbx/pages/index/index?channelName=${channelName}&orderId=${orderId}&sign=${sign}`;
        wx.navigateToMiniProgram({
          appId: appId,
          path: path,
          envVersion: 'release'//trial 体验版  release 正式版
        })
      } else if (e.currentTarget.dataset.carturl) {
        //妙药
        let carturl = e.currentTarget.dataset.carturl + '&thirdId=' + getApp().globalData.openId
        this._viewMedicineMiaoHealth(carturl);
      } else if ('eleme' == e.currentTarget.dataset.source) {
        //饿了么购药 
        this._viewMedicineEleme(e.currentTarget.dataset.patientUuid, e.currentTarget.dataset.drugid, e.currentTarget.dataset.id, e.currentTarget.dataset.medicRecordId)
      } else {
        //和缓
        this._viewMedicine(e.currentTarget.dataset.drugid, this.data._request.redirectPage);
      }

    },
    /** 饿了么购药 */
    _viewMedicineEleme(patientUuid, drugId, informationId, medicRecordId) {
      wx.showLoading({ title: '加载中...', mask: true })
      let msg = this._getMsgByDrugId(drugId);
      if (1 == msg.body.isSuccess) {
        //购买成功，跳转饿了么查看详情
        that._viewOrderListEleme();
        return;
      }
      let hasRx = this._checkHasRx(msg)
      //获取药卡用户详情
      apis.requestGetRxPatientInfo('', patientUuid,hasRx)
        .then(res => {
          if (200 != res.status) return this._showModal('', res && res.message || '请稍后再试')
          let url = `${this.data.basePath}innerpages/eleme-message/eleme-message?informationId=${informationId}&drugId=${drugId}&name=${res.data.name}&isAuth=${res.data.auth}&phoneNum=${res.data.phone}&hasRx=${hasRx}&memberUserToken=${res.data.userToken}&medicRecordId=${medicRecordId}&medicationList=${encodeURIComponent(JSON.stringify(msg.bodyContent.medicationList))}`
          console.log(url)
          wx.navigateTo({
            url: url,
            success(){
              wx.hideLoading()
            }
          })

        })
        .catch(err => {
          wx.hideLoading()
          this._showModal('', err && err.message || '请稍后再试')
        })
    },
    /** 跳转饿了么订单列表 */
    _viewOrderListEleme() {
      wx.navigateToMiniProgram({
        appId: 'wxece3a9a4c82f58c9',
        path: '/pages/order/list/order-list',
        envVersion: 'release',
        complete(){
          wx.hideLoading();
        }
      })
    },

    _checkHasRx(msg) {
      if (!msg) return false
      if (!msg.bodyContent.medicationList || 0 == msg.bodyContent.medicationList.length) return false
      let rxList = msg.bodyContent.medicationList.filter(medicine => {
        return medicine.rx
      })
      return rxList && rxList.length > 0
    },

    _showModal(title, content) {
      wx.hideLoading();
      wx.showModal({ title, content })
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
          if (!res || !res.data || 200 != res.data.status) self._showModal('出错了', res && res.data && res.data.message || '网络开小差了，请稍后再试')
        },
        fail: function () {
          wx.hideLoading();
          self._showModal('出错了', '网络开小差了，请稍后再试')
        }
      })
    },
    //默认追加公共参数webview
    _tapViewUrl(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      this._viewUrl(e.currentTarget.dataset.url)
    },
    //护理报告
    _viewOriginUrl(e){
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(e.currentTarget.dataset.url);
      wx.navigateTo({
        url: pageUrl
      })
    },
    _tapViewDoctorInfo(e) {
      let pageUrl = `${this.data.basePath}innerpages/doctorInfo/doctorInfo?doctorId=${e.currentTarget.dataset.doctorId}`;
      wx.navigateTo({
        url: pageUrl
      })
    },
      /** 发送文本消息 */
      bindSendTextMsg(e) {
        if (e.detail && hhim && hhim.loginStatus()) {
          hhim.sendText(e.detail, that._sendCallback, that.data._request.appointedOrderId);
        }
      },
      bindSendAudio(e){
        // console.log(e)
        // that._sendCallback, that.data._request.appointedOrderId
        hhim.sendAudio(e.detail.tempFilePath, e.detail.duration, that._sendCallback, that.data._request.appointedOrderId);

      },
      //点击屏幕空白处 隐藏工具栏
      bindScrollView(){
        this.selectComponent('#hhBottom')._showUtils(false);
      },  
  }
})