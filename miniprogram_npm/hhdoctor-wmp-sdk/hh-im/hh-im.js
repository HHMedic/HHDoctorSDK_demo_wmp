const common = require('../utils/commonUtil.js');
const bgm = wx.getBackgroundAudioManager();
const hhDoctor = require('../hhDoctor.js');
const uiUtil = require('../utils/uiUtil')
const msgUtil = require('../utils/msgUtil.js');
const apis = require("../utils/api.js");
const md5 = require('../utils/md5.min.js');
const { getOptions } = require('../hhDoctor.js');
let self
var voicePlaying = false;
var reloadMsg = false, lastMsgTime, scrollToBottom = true;
var pageIsShowing = false;
var firstShow = true;
var intervalHandler = {
  liveList: null,
  resize: null
}
var apiUtil;
let msgPanelHeightCache = 0

Component({
  behaviors: [
    require('../behaviors/hhStarter'),
    require('../behaviors/hhCommon'),
    require('../behaviors/hhLayout'),
    require('../behaviors/hhNavigator')],
  lifetimes: {
    attached() {
      self = this;
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
      this.getLoginUserInfo();
      this.checkNetStatus();
      if (!firstShow) this._getHistoryMsg(false)
    },
    hide() {
      pageIsShowing = false;
      self.setData({ isAuthBox: false })
      wx.offNetworkStatusChange();
      this._removeSunshineStore()
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
    livePanelHeight: 0,
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
    //demoStatusInit: -1,
    userID: '',
    tapTime: '',
    userToken: '',
    sdkProductId: '',
    doctorList: [],
    isShowRealName: false,
    realNameMsg: null,
    sourceList: ['ddky', 'renhe', 'eleme', 'yishu', 'xiaoyaoyao']
  },
  methods: {
    _requestComplete() {
      console.log(this.data._request)
      console.log('初始化参数完成，准备启动IM...');
      apiUtil = require('../utils/apiUtil.js')
      hhDoctor.off('chatMessage');
      hhDoctor.on('chatMessage', self._onImMsg);
      this._applyStyle();
      this._addMonitor();
      this._viewIm();
      apiUtil.reportTrace(-1, 'live', 'WMP_OPEN');
      lastMsgTime = null
      this._getHistoryMsg(true);
      this.setData({
        userToken: this.data._request.userToken,
        sdkProductId: this.data._request.sdkProductId,
        loadcfg: this.data._request.loadcfg
      })
      this.getLoginUserInfo();
      this.getIsSunshineDoctor();
    },
    // 判断是否为阳光渠道并进入私人医生团队匹配入口
    getIsSunshineDoctor() {
      if (this.data.sdkProductId == 10265 && this.data.loadcfg.doctorTeamUrl) {
        apis.requestGetDoctorsTeam().then(res => {
          if (res.status == 200) {
            this.setData({ doctorList: res.data.doctorList || [] })
            if (!this.data.doctorList.length) {
              this._viewReLauch(this.data.loadcfg.doctorTeamUrl)
              return;
            }
            if (wx.getStorageSync('rate') == 5 && !this.getAddDoctorInfo()) {
              let doctor = wx.getStorageSync('doctor');
              //呼叫结束 五星好评 弹出是否添加医生
              this.setData({
                isShowModal: true,
                modalMsgData: { source: 'isAddDoctor', content: `根据您的评价，需要将${doctor.name}医生添加至您的私人医生团队吗？`, confirmText: '添加' },
              })
            }
          }
        })
      }
    },
    getAddDoctorInfo() {
      let doctorList = this.data.doctorList;
      return doctorList.find((item, index) => {
        return item.doctorId == wx.getStorageSync('doctor').doctorid
      })
    },
    getLoginUserInfo() {
      let app = getApp()
      if (!app.globalData._hhSdkOptions
        || !app.globalData._hhSdkOptions._sdkProductId
        || !app.globalData._hhSdkOptions._userToken) return
      apis.requestGetUserInfo().then(res => {
        this.setData({
          loadcfg: res.data.loadCfg,
          manyVideo: res.data.loadCfg && res.data.loadCfg.manyVideo ? true : false,
          product: res.data.user.product
        })
        this.getIsSunshineDoctor();
      }).catch(err => { })
    },

    _bindMyCancel() {
      this._removeSunshineStore()
      this.setData({ isShowModal: false })
    },
    // 弹窗确定
    _bindMyConfirm() {
      wx.showLoading({ mask: true })
      this.setData({
        isShowModal: false
      })
      apis.requestAddDoctorToTeam(wx.getStorageSync('doctor').doctorid).then(res => {
        if (res.status == 200) {
          uiUtil.toast('添加成功')
          this._removeSunshineStore()
        }
      })
    },

    getMemberList(e) {
      this.setData({ memberList: e.detail })
    },
    checkNetStatus() {
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType == 'none') {
            self.setData({ disConnected: true })
          } else {
            self.setData({ disConnected: false })
          }
        },
      })
    },
    bindLivePanelHeight(e) {
      self.setData({ livePanelHeight: e.detail.livePanelHeight })
    },
    _onImMsg(msg) {
      self._getHistoryMsg(false)
    },
    _viewIm() { },
    _initHhImSdk(requestHis, hhImCallbacks, initCallback) { },

    //hh-calling触发
    bindOnWsClose() {
      self._onWsClose();
    },
    _onWsClose() { },

    _addMonitor() {
      wx.onNetworkStatusChange(function (res) {
        self.setData({ disConnected: !res.isConnected })
      })

      bgm.onEnded(self._onStopAudio);
    },

    /** 获取注册用户的历史消息 */
    _getHistoryMsg(isFirst) {
      console.log('>>> _getHistoryMsg', this.data._request.userToken)
      if (!this.data._request.userToken) return
      if ('unreg' == this.data._request.userToken) return this._getUnregHistoryMsg();
      let asst = hhDoctor.getAsstInfo();
      if (!asst || !asst.uuid)
        return setTimeout(() => self._getHistoryMsg(isFirst), 500)
      //let lastTime = self.data.msgList.length ? self.data.msgList[self.data.msgList.length - 1].time : ''
      console.log('>>> 获取历史消息', asst.uuid, isFirst, lastMsgTime)
      if (isFirst) uiUtil.loading('获取消息...', 5000)
      apiUtil.getHistoryMsg(asst.uuid, isFirst, lastMsgTime)
        .then((res) => {
          //self.data.msgList = [];
          self._parseMsgHis(res);
          firstShow = false
        }).catch(() => {
          firstShow = false
          uiUtil.hideLoading()
        })
    },
    /** 获取未注册用户的历史消息 */
    _getUnregHistoryMsg() {
      apiUtil.getUnregHistoryMsg()
        .then(res => {
          console.log('>>>getUnregHistoryMsg:', res.data)
          let _asst = res.data.loginResponse
          hhDoctor.setAsstInfo({
            uuid: _asst.asstAccount,
            name: _asst.asstName,
            photo: _asst.asstPhoto
          })
          this.data.msgList = [];
          this._parseMsgHis({ data: res.data.historyMsgs });
          firstShow = false
        })
        .catch(err => { firstShow = false })
    },
    /** 收到历史消息 */
    _receiveHis(msgList) {
      if ('unreg' != self.data._request.userToken) return
      self._addToMsgList(msgList, reloadMsg);
    },

    /** 收到即时消息 */
    _receiveMsg(msg) {
      if ('unreg' != self.data._request.userToken) return
      self._addToMsgList([msg]);
    },

    /** 解析收到的历史消息 */
    _parseMsgHis(res) {
      if (!res.data || !res.data.length) return;
      //console.log('获取历史消息结果:', res.data)
      let msgList = msgUtil.parseMsgHistory(res);
      let uuid = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      if (!msgList || !msgList.length) return;

      for (let i = 0; i < msgList.length; i++) {
        if (!msgList[i].head || !msgList[i].name) {
          let isUser = parseInt(msgList[i].from) == uuid;
          msgList[i].from = isUser ? 'c' : 'd';
          msgList[i].head = isUser ? hhDoctor.getUserPhoto() : asst.photo;
          msgList[i].name = isUser ? '' : asst.name;
        }
      }

      self._addToMsgList(msgList);
    },
    /** 将收到的消息加入数组 */
    _addToMsgList(msgList, reload) {
      if (!msgList || 0 == msgList.length) {
        return uiUtil.hideLoading();
      }
      var msgId = '';
      var list = this.data.msgList;

      if (reload || !lastMsgTime) {
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
        if (this._isExistMsg(msg, list)) continue
        if ('text' == msg.type && msg.text && !msg.textArr) {
          msg.textArr = common.findLinkFromText(msg.text)
        }
        if (!lastMsgTime || msg.time > lastMsgTime) lastMsgTime = msg.time
        list.push(msg);
        if (!reload) {
          msgId = 'msg' + msgList[i].time;
        } else if (i > 0) {
          msgId = 'msg' + msgList[i - 1].time;
        }
      }
      this.setData({ msgList: list },
        () => {
          if (scrollToBottom) this.setData({ lastMsgId: msgId })
          else scrollToBottom = true
          uiUtil.hideLoading()
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
        if (drugOrderId && msg.body.isSuccess) {
          msg.bodyContent.buttonName = '查看订单';
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
    _isExistMsg(msg, msgList) {
      if (!msgList || !msgList.length) return false
      let list = msgList.filter(item => { return item.id === msg.id && item.type === msg.type })
      return list && list.length
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
        uiUtil.hideLoading();
        bgm.stop();
        voicePlaying = false;
        return;
      }
      var url = e.currentTarget.dataset.url;
      bgm.title = 'bgm' + new Date().getTime();
      bgm.src = url;
      voicePlaying = true;
      uiUtil.toast('播放中...', parseInt(e.currentTarget.dataset.dur), 'loading')
    },

    _onStopAudio() {
      uiUtil.hideLoading();
      voicePlaying = false;
    },
    bindEveryIcon(e) {
      switch (e.detail.type) {
        case 'camera':
        case 'album': self._selectImage(e.detail.type)
          break;
        //陪同咨询
        case 'accompany':
        //挂号服务
        case 'registration':
        //护理服务
        case 'psychological':
        //心理咨询
        case 'offlinenurse':
        //送药上门
        case 'sendmedicine':
          this.selectComponent('.hhcalling')._getCallingList(e.detail.type)
          break
        case 'psycholmeditation':
          this.confrimPsycholMed()
          break;
        default:
          break
      }
    },
    confrimPsycholMed() {
      wx.showModal({
        content: '本服务由北京清心科技有限公司提供',
        confirmColor: '#0592F5',
        confirmText: '继续评测'
      }).then(res => {
        if (!res.confirm) return
        apis.requestGetPsycholMed().then(res => {
          this._openUrl(res.data.forward)
        }).catch(err => console.error(err))
      })
    },
    /** 选择图片或拍照 */
    _selectImage(type) {
      var imgCount = 'camera' == type ? 1 : 9;
      wx.chooseImage({
        count: imgCount,
        sizeType: ['original'],
        sourceType: [type],
        success: function (res) {
          wx.showLoading({ title: '发送中...' })
          self.sendImages(res.tempFilePaths, 0)
          setTimeout(function () {
            uiUtil.hideLoading();
          }, imgCount * 3000);
        },
      })
    },

    /** 发送消息回调 */
    _sendCallback(res) {
      if (res.success && 'unreg' != self.data._request.userToken) {
        self._addToMsgList([res.imMessage]);
      }
      if (res.allDone) {
        uiUtil.hideLoading();
      }
    },
    /** 点击文本消息中的链接 */
    _tapLink(e) {
      console.log('>>> tapLink:', e.currentTarget.dataset.link);
      let link = e.currentTarget.dataset.link
      if (link.toLowerCase().startsWith('http://') || link.toLowerCase().startsWith('https://')) {
        this._openUrl(link)
        return
      }

      if (link.toLowerCase().startsWith('wxapp://')) {
        let wxapp = this._splitWxAppLinkParams(link)
        console.log('>>> wxapp:', wxapp)
        if (!wxapp) return
        if ('self' == wxapp.id) this._naviToPage(wxapp.page)
        else this._naviToMp(wxapp.id, wxapp.profile, wxapp.page)
      }
    },
    /** 解析参数  */
    _splitWxAppLinkParams(link) {
      link = link.substring(8)
      let arr = link.split('/');
      if (arr.length < 2) return null
      let res = {
        id: arr[0],
        profile: arr[1]
      }
      for (let i = 0; i < 2; i++) arr.shift()
      res.page = arr.length > 0 ? arr.join('/') : 'pages/index/index'
      return res
    },
    /** 导航到其他页面 */
    _naviToPage(page) {
      if (!page.startsWith('.') && !page.startsWith('/')) page = '/' + page
      page += (page.indexOf('?') >= 0 ? '&' : '?')
      page += '_=' + new Date().getTime()
      if (page.toLowerCase().indexOf('usertoken=') < 0) page += `&userToken=${this.data.userToken}`
      if (page.toLowerCase().indexOf('sdkProductId=') < 0) page += `&sdkProductId=${this.data.sdkProductId}`
      wx.navigateTo({ url: page })
    },
    /** 跳转到其他小程序 */
    _naviToMp(wxAppId, profile, page) {
      page += (page.indexOf('?') >= 0 ? '&' : '?')
      page += '_=' + new Date().getTime()
      if (page.toLowerCase().indexOf('usertoken=') < 0) page += `&userToken=${this.data.userToken}`
      if (page.toLowerCase().indexOf('sdkProductId=') < 0) page += `&sdkProductId=${this.data.sdkProductId}`
      wx.navigateToMiniProgram({
        appId: wxAppId,
        path: page,
        envVersion: profile
      })
    },
    /** 打开信息流中的url */
    _openUrl(link) {
      link += (link.indexOf('?') >= 0 ? '&' : '?')
      link += '_=' + new Date().getTime()
      if (link.toLowerCase().indexOf('usertoken=') < 0) link += `&userToken=${this.data.userToken}`
      if (link.toLowerCase().indexOf('sdkProductId=') < 0) link += `&sdkProductId=${this.data.sdkProductId}`
      link = `${this.data.basePath}innerpages/view/view?url=${encodeURIComponent(link)}`
      wx.navigateTo({ url: link })
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
          var ss = self._getCustomStyle(style.customStyle[i].style);
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
        self.setData({
          customStyle: cStyle
        })
      }

      if (style.card) {
        var card = self.data.cardOptions;
        if (style.card.medTitle) {
          card.medTitle = style.card.medTitle
        }
        if (style.card.summaryTitle) {
          card.summaryTitle = style.card.summaryTitle
        }
        self.setData({
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
    _buyProduct() {
      var pageUrl = this.data.basePath + 'innerpages/buyProduct/buyProduct?' + this._getPublicRequestParams() + '&payPage=' + this.data._request.payPage;
      wx.navigateTo({ url: pageUrl, })
    },

    //点击药卡
    _buyMedicine(e) {
      console.log('drugOrderId====', e)
      if (!e.currentTarget.dataset.trans) {
        return;
      }
      let dataset = e.currentTarget.dataset;
      console.log('dataset', dataset)

      //中宏-跳转1药网小程序无需实名
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
        return
      }
      //eleme-mini renhe-mini yishu-mini ddky-h5 heye-mini
      if (this.data.sourceList.indexOf(dataset.source) != -1) {
        this._viewMedicIsRxBuy(dataset)
        return
      }
      if (dataset.carturl) {
        //妙药-跳转妙药提供的H5界面
        let carturl = dataset.carturl + '&thirdId=' + getApp().globalData.openId
        this._viewMedicineMiaoHealth(carturl);
        return
      }
      //和缓阿里原始够药
      this._viewMedicine(dataset.drugid, this.data._request.redirectPage);
    },

    // 饿了么和叮当快药够药流程合并判定处方非处方处理方式 包括实名认证
    // 非饿了么不用判定起送价 patientUuid, drugId, informationId, medicRecordId, source
    _viewMedicIsRxBuy(data) {
      lastMsgTime = null//用于返回信息流更新数据
      wx.showToast({
        title: '加载中...',
        icon:'loading',
        duration:500,
        mask:true
      })
      let msg = this._getMsgByDrugId(data.drugid);
      let hasRx = this._checkHasRx(msg)
      console.log(msg)
      //购买成功，跳转各对接方查看详情
      if (1 == msg.body.isSuccess) {
        if (data.source == 'eleme') {
          self._viewOrderListEleme();
          return
        }
        if (data.source == 'yishu') {
          self._viewOrderDetailYishu(data.orderId)
          return
        }
        if(data.source == 'xiaoyaoyao'){
          self._viewOrderDetailXiaoYaoYao(data,hasRx)
          return
        }
        //h5-详情页
        self._viewMedicine(data.drugid, self.data._request.redirectPage);
        return;
      }
      //非处方药特定渠道跳转到默认订单确认页
      if (!hasRx && (data.source == 'renhe' || data.source == 'ddky')) {
        this._viewMedicine(data.drugid, this.data._request.redirectPage);
        return
      }
      this.getMedicUserDetail(data, hasRx, msg)

    },
    //获取药卡用户详情-跳转到个人信息授权
    getMedicUserDetail(data, hasRx, msg) {
      apis.requestGetRxPatientInfo('', data.patientUuid, hasRx)
        .then(res => {
          if (200 != res.status) return this._showModal('', res && res.message || '请稍后再试')
          let url = this.getMedicUserDetailParams(data, hasRx, res, msg)
          if (data.source == 'ddky' || data.source == 'renhe') {
            let _request = this.data._request
            let param = this.data._host.patHost + 'drug/order.html?' +
              'drugOrderId=' + data.drugid +
              '&sdkProductId=' + _request.sdkProductId +
              '&userToken=' + _request.userToken +
              '&openId=' + _request.openId +
              '&payPage=' + encodeURIComponent(this.data.basePath + 'innerpages/pay/pay') +
              '&redirectPage=' + encodeURIComponent(_request.redirectPage ? _request.redirectPage : '/pages/newIndex/newIndex') +
              '&source=wmpSdk' +
              '&version=' + this.data._sdkVersion +
              '&_=' + new Date().getTime();
            let pageUrl = encodeURIComponent(this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(param))
            url += `&pageUrl=${pageUrl}`
          }
          //跳转逻辑在eleme-message里
          wx.navigateTo({
            url: url,
            success() {
              uiUtil.hideLoading()
            }
          })

        })
        .catch(err => {
          uiUtil.hideLoading()
          uiUtil.modal('', err && err.message || '请稍后再试')
        })
    },
    getMedicUserDetailParams(data, hasRx, res, msg) {
      return `${this.data.basePath}innerpages/eleme-message/eleme-message?drugCount=${msg.bodyContent.drugCount}`
        + `&buttonName=${msg.bodyContent.buttonName}`
        + `&name=${res.data.name}`
        + `&isAuth=${res.data.auth}`
        + `&phoneNum=${res.data.phone}`
        + `&hasRx=${hasRx}`
        + `&memberUserToken=${res.data.userToken}`
        + `&medicationList=${encodeURIComponent(JSON.stringify(msg.bodyContent.medicationList))}`
        + `&data=${encodeURIComponent(JSON.stringify(data))}`
    },
    /** 跳转饿了么订单列表 */
    _viewOrderListEleme() {
      wx.hideLoading().then().catch(err => { })
      wx.navigateToMiniProgram({
        appId: 'wxece3a9a4c82f58c9',
        path: '/pages/order/list/order-list',
        envVersion: 'release',
        complete() {
          uiUtil.hideLoading();
        }
      })
    },
    // 跳转壹树的订单详情页
    _viewOrderDetailYishu(orderId) {
      wx.hideLoading().then().catch(err => { })
      wx.navigateToMiniProgram({
        appId: 'wx56923640462b4e69',//'wxd4e5d6c3d86f9760',
        path: `pages/webview/hh/index?orderId=${orderId}`,
        envVersion: 'trial'
      })
    },
    //跳转小药药的订单详情
    _viewOrderDetailXiaoYaoYao(data,hasRx){
      apis.requestGetRxPatientInfo('', data.patientUuid, hasRx)
      .then(res => {
        let path = `pages/channelDocking/channelDocking`
        path+=`?token=${res.data.userToken}&orderId=${data.drugid}&tel=${res.data.phone}&source=hehuan&status=1`
        console.log('path-查看订单',path)
        wx.navigateToMiniProgram({
              appId: 'wx776afedbfae3a228',//'',
              path,
              envVersion: 'release'//trial 体验版  release 正式版
          })
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

    _tapExtendBtn(e) {
      if (!e.currentTarget.dataset.btn) {
        return;
      }
      var btn = e.currentTarget.dataset.btn;
      switch (btn.type) {
        case 'view':
          this._doViewUrl(btn.url);
          break;
        case 'click':
          this._clickExtendBtn(btn.key);
          break;
        default:
          return;
      }
    },

    _clickExtendBtn(key) {
      wx.showLoading({ title: '请稍候...', })
      var url = this._getHost().wmpHost +
        'im/clickExtendBtn?' + this._getPublicRequestParams() +
        '&extendBtnKey=' + key;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function (res) {
          uiUtil.hideLoading();
          if (!res || !res.data || 200 != res.data.status) uiUtil.modal('出错了', res && res.data && res.data.message || '网络开小差了，请稍后再试')
        },
        fail: function () {
          uiUtil.hideLoading();
          uiUtil.modal('出错了', '网络开小差了，请稍后再试')
        }
      })
    },
    _tapViewUrl(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      this._doViewUrl(e.currentTarget.dataset.url)
    },

    //追加公共参数 需实名认证-挂号  重疾通道 护士到家
    _tapAppointmentViewUrl(e) {
      console.log(e.currentTarget.dataset)
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      let dataset = e.currentTarget.dataset;
      //购买成功 查看订单 跳转订单详情
      if (dataset.isSuccess && dataset.isSuccess == 1) {
        return;
      }
      apis.requestGetRxPatientInfo(dataset.realPatientUserToken, '', false).then(res => {
        console.log(res)
        // 如果已实名认证-直接跳转h5
        dataset.url += `&realPatientUserToken=${dataset.realPatientUserToken}&title=${dataset.title}`
        if (res.data.auth) {
          this._doViewUrl(dataset.url)
          return;
        }
        //实名认证是一个组件
        this.setData({
          realNameMsg: {
            name: res.data.name,
            phone: res.data.phone,
            realPatientUserToken: res.data.userToken,
            informationId: dataset.id,
            title: dataset.title,
            url: dataset.url
          },
          isShowRealName: true
        })
      })
    },
    //实名认证成功后
    bindRealNameSuccess(e) {
      this.bindCloseRealName()
      this._doViewUrl(e.detail.url)
    },
    //关闭实名认证
    bindCloseRealName() {
      this.setData({
        isShowRealName: false
      })
    },
    //不追加公共参数-护理报告-挂号详情 绿通详情 护士上门详情
    _viewOriginUrl(e) {
      if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(e.currentTarget.dataset.url);
      wx.navigateTo({
        url: pageUrl
      })
    },
    //药卡活动推送卡片
    _viewDrugCardImage(e) {
      let command = e.currentTarget.dataset.command;
      //药卡活动无套餐用户推送卡片 //药卡活动有套餐老用户推送卡片
      if (command == 'drugNoProductUser' || command == 'drugProductUser') {
        let pageUrl = this.data._request.callPage + '?' + hhDoctor.getPublicParams() + '&dept=' + e.currentTarget.dataset.dept + '&realPatientUuid=' + getApp().globalData.uuid;
        wx.navigateTo({
          url: pageUrl,
        })
      }
      //药卡活动挂断卡片
      if (command == 'drugOrderHangUp') {

      }
    },
    _viewNetHospitalRxDetail(e) {
      let rxUrl = e.currentTarget.dataset.rxUrl
      if (!rxUrl) return
      this._doViewUrl(rxUrl);
    },
    _tapViewDoctorInfo(e) {
      let pageUrl = `${this.data.basePath}innerpages/doctorInfo/doctorInfo?doctorId=${e.currentTarget.dataset.doctorId}`;
      wx.navigateTo({
        url: pageUrl
      })
    },
    /** 发送文本消息 */
    bindSendTextMsg(e) {
      let from = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      msgUtil.sendText(from, asst.uuid, e.detail, self.data._request.appointedOrderId)
        .then(res => {
          console.log('>>> sendTextMsg:', res)
          if (res && res.data && res.data.success) {
            console.log('文本消息发送成功')
            let _msg = {
              type: 'text',
              from: 'c',
              text: e.detail,
              head: hhDoctor.getUserPhoto(),
              name: '',
              time: new Date().getTime()
            }
            this._addToMsgList([_msg])
            if (res.data.responseData) {
              this._parseMsgHis({ data: [res.data.responseData] })
            }
          }
        })
        .catch(err => { console.error('发送消息失败', err) })
    },
    /** 发送语音消息 */
    bindSendAudio(e) {
      let from = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      let fileType = 'audio'
      msgUtil.sendFile(from, asst.uuid, fileType, e.detail.tempFilePath, e.detail.duration, self.data._request.appointedOrderId)
        .then(res => {
          if (res && res.data && res.data.success) {
            console.log('发送语音成功')
            setTimeout(() => { self._getHistoryMsg(false) }, 1000)
          }
        })
        .catch(err => { console.error('发送消息失败', err) })
    },
    /** 发送图片消息  */
    sendImages(images, index) {
      if (!images || !images.length || index == images.length) return uiUtil.hideLoading()
      let from = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      let fileType = 'image'
      msgUtil.sendFile(from, asst.uuid, fileType, images[index], null, self.data._request.appointedOrderId)
        .then(res => {
          if (res && res.data && res.data.success) {
            console.log('发送图片成功')
            setTimeout(() => { self._getHistoryMsg(false) }, 1000)
            this.sendImages(images, index + 1)
          }
        })
        .catch(err => { console.error('发送消息失败', err) })
    },
    //点击屏幕空白处 隐藏工具栏
    bindScrollView() {
      this.selectComponent('#hhBottom')._showUtils(false);
    },
    /** 弹出键盘时重设中部信息流区域高度 */
    bindkeyboardheightchange(e) {
      console.log('>>> bindkeyboardheightchange', e, msgPanelHeightCache)
      if (!msgPanelHeightCache) msgPanelHeightCache = this.data.msgPanelHeight
      if (!e.detail.height) {
        this.setData({ msgPanelHeight: msgPanelHeightCache })
      } else {
        let h = this.data.sysInfo.screenHeight - this.data.msgPanelTop - e.detail.height - 60
        if (h < 0) h = 0
        this.setData({ msgPanelHeight: h, lastMsgId: this.data.lastMsgId })
      }
    },

    _removeSunshineStore() {
      wx.removeStorageSync('rate');
      wx.removeStorageSync('doctor')
    },
    _doViewUrl(url) {
      lastMsgTime = null
      scrollToBottom = false
      this._viewUrl(url);
    }
  }
})