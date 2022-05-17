const common = require('../utils/commonUtil.js');
const bgm = wx.getBackgroundAudioManager();
const hhDoctor = require('../hhDoctor.js');
const uiUtil = require('../utils/uiUtil')
const msgUtil = require('../utils/msgUtil.js');
const apis = require("../utils/api.js");
const customApis = require("../utils/customApi.js")
const md5 = require('../utils/md5.min.js');
const { getOptions } = require('../hhDoctor.js');
const { naviToMed, navigateToMiniOrderList } = require('../utils/medicUtil')
const envVersion = __wxConfig.envVersion == 'release' ? 'release' : 'trial';
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
let msgPanelHeightCache = 0, getHisMsgTryCount = 0
let acceptAuth = false, authHandler = null
let wxAppId = wx.getAccountInfoSync().miniProgram.appId

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
      authHandler && clearInterval(authHandler)
    }
  },
  pageLifetimes: {
    show() {
      pageIsShowing = true;
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      self._layoutResize()
      this._addMonitor();
      this.getLoginUserInfo();
      this.checkNetStatus();
      if (wx.getStorageSync('needReloadMsg')) {
        firstShow = true
        lastMsgTime = null
        wx.removeStorageSync('needReloadMsg')
        this._getHistoryMsg(true)
      }
      if (!firstShow) this._getHistoryMsg(false)

      setTimeout(() => { this._layoutResize() }, 100);
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
    msgPanelHeight: 0, //中部消息列表高度
    livePanelHeight: 0,//直播区域的高度
    authHeight: 0,
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
    sourceList: ['ddky', '"ddkyB2C"', 'renhe', 'eleme', 'elemeB2C', 'yishu', 'xiaoyaoyao'],
    isAuth: true,
    isShowAuth: false,
  },
  methods: {
    _requestComplete() {
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
      getHisMsgTryCount = 0
      let healthUtil = require('../utils/healthUtil')
      healthUtil.getWxRunData()

      // setTimeout(() => {
      //   common.getViewSize('#hhRealName', this).then(res => { console.log('>>> ', res) }).catch(err => console.error('>>> err:', err))
      // }, 2000);
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
          shareCard: res.data.loadCfg && 'undefined' != typeof res.data.loadCfg.share_card_config ? parseInt(res.data.loadCfg.share_card_config) : 0,
          product: res.data.user.product,
          isAuth: res.data.user && res.data.user.is_auth || false
        })
        this.getIsSunshineDoctor();
        common.getViewSize('#hhRealName', this).then(res => { res && this.setData({ authHeight: res.height }) }).catch(err => { })
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
      getHisMsgTryCount++
      let asst = hhDoctor.getAsstInfo();
      if (!asst || !asst.uuid)
        return setTimeout(() => {
          if (getHisMsgTryCount <= 10) self._getHistoryMsg(isFirst)
        }, 500)
      //let lastTime = self.data.msgList.length ? self.data.msgList[self.data.msgList.length - 1].time : ''
      if (isFirst) uiUtil.loading('获取消息...', 5000)
      apiUtil.getHistoryMsg(asst.uuid, isFirst, lastMsgTime)
        .then((res) => {
          //self.data.msgList = [];
          self._parseMsgHis(res);
          if (this.data._request.drugOrderId) this._buyMedicineById()
          firstShow = false
          uiUtil.hideLoading()
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
      console.log('获取历史消息结果:', res.data)
      let msgList = msgUtil.parseMsgHistory(res);
      let uuid = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      if (!msgList || !msgList.length) return;
      for (let i = 0; i < msgList.length; i++) {
        if (!msgList[i].head || !msgList[i].name) {
          let isUser = parseInt(msgList[i].from) == uuid;
          //console.log(msgList[i], uuid)
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
      console.log('list', list)

      this.setData({ msgList: list },
        () => {
          if (scrollToBottom) this.setData({ lastMsgId: msgId })
          else scrollToBottom = true
          uiUtil.hideLoading()
          console.log('>>> msgList:', this.data.msgList)
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
        if (drugOrderId && 'undefined' != typeof msg.body.isSuccess && 1 == msg.body.isSuccess) {
          msg.bodyContent.buttonName = '查看订单';
          msg.bodyContent.buttonClass = 'view-order'
          //侯三春要求显示  https://hh-medic.feishu.cn/sheets/shtcnD9mZ9iRqExw9JdwdFpQhte?sheet=o4snfJ
          msg.bodyContent.tips = '如有用药疑问，请呼叫医生'
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
      switch (e.detail.serviceType) {
        //拍照&相机
        case 'camera':
        case 'album': self._selectImage(e.detail.serviceType)
          break;
        case 'share_card':
          //用户无套餐或套餐过期的情况下，点击【给家人用】
          if (!this.data.product || 'exp' == this.data.product.productStatusEnum) wx.showToast({ title: '成为会员后才能使用', icon: 'none', duration: 2500 })
          //拉起订阅消息
          if ('wx15e414719996d59f' == wxAppId) {
            wx.requestSubscribeMessage({
              tmplIds: ['N--vX7p3O7HeJp4FS9Yr7l8fUkKcdX8ZnPEhgO1A8xA'],
              success: res => hhDoctor.addLog('1', '点击就诊提醒订阅消息成功:' + JSON.stringify(res)),
              fail: err => hhDoctor.addLog('1', '点击就诊提醒订阅消息错误:' + JSON.stringify(err))
            })
          }
          break
        default:
          this.selectComponent('.hhcalling')._getCallingList(e)
          break
      }
      this.triggerEvent('tapBottomIcon', e.detail)
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
      if (!link) return
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
      if (page.toLowerCase().indexOf('openId=') < 0) page += `&openId=${this.data._request.openId}`
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
      if (link.toLowerCase().indexOf('openId=') < 0) link += `&openId=${this.data._request.openId}`
      link = `${this.data.basePath}innerpages/view/view?url=${encodeURIComponent(link)}`
      wx.navigateTo({ url: link })
    },

    /** 点击查看视频咨询总结卡片 */
    _viewSummary(e) {
      let medicRecordId = e.currentTarget.dataset.mrid;
      let patient = e.currentTarget.dataset.patient;
      hhDoctor.addLog('1', `点击查看咨询总结。medicRecordId：${medicRecordId},patient:${patient}`)
      wx.navigateTo({
        url: `${this.data.basePath}innerpages/ehr-filingdetail/ehr-filingdetail?id=${medicRecordId}&memberUuid=${patient}`
      })
    },

    _applyStyle() {
      if (!this.data._request.style) {
        return;
      }
      var style = this.data._request.style;
      console.log(style)
      // if (style.extendBtns) {
      //   this.setData({
      //     extendBtns: style.extendBtns
      //   })
      // }
      // if (this.data.extendBtns.length > 0) {
      //   this.setData({
      //     msgPanelHeight: this.data.msgPanelHeight - 40
      //   })
      // }
      this._setNavigationBar();

      if (style.customStyle && style.customStyle.length > 0) {
        var cStyle = {};
        for (var i = 0; i < style.customStyle.length; i++) {
          var ss = self._getCustomStyle(style.customStyle[i].style);
          console.log(ss)
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

    _buyMedicineById() {
      let id = this.data._request.drugOrderId
      this.setData({ ['_request.drugOrderId']: '' })
      let msg = this._getMsgByDrugId(id)
      let e = {
        currentTarget: {
          dataset: {
            carturl: msg.bodyContent.cartUrl || '',
            drugId: msg.body.orderid,
            id: msg.body.id,
            medicRecordId: msg.body.medicRecordId,
            patientUuid: msg.body.patientUuid,
            source: msg.bodyContent.source || '',
            trans: msg.bodyContent.trans
          }
        }
      }
      this._buyMedicine(e)
    },
    /** 点击药卡下方的链接 */
    _tapTipsLink(e) {
      console.log(e)
      let dataset = e.currentTarget.dataset
      switch (dataset.tipslink) {
        case '点此实名认证':
          this._doRealName({ realPatientUuid: dataset.patientUuid, mode: dataset.mode, informationId: dataset.informationId })
          break;
        case '呼叫医生上传':
          this._doCallDoctor(dataset.patientUuid)
          break;
        default:
          return
      }
    },
    _tapMedicine() {
      //拉起订阅消息
      if ('wx15e414719996d59f' == wxAppId) {
        wx.requestSubscribeMessage({
          tmplIds: ['RhJ_Y15m-dL6CNqVzm0U1PRbR1ADOAXjxjT1ACWF_Xo', 'eejHAX6psLzA7ktxDYHR79nlnzA1_C6Um7LxXv7_R0Q'],
          success: res => hhDoctor.addLog('1', '点击药卡订阅消息成功:' + JSON.stringify(res)),
          fail: err => hhDoctor.addLog('1', '点击药卡订阅消息错误:' + JSON.stringify(err))
        })
      }
    },
    //点击药卡
    _buyMedicine(e) {
      console.log('drugOrderId====', e)
      //拉起订阅消息
      if ('wx15e414719996d59f' == wxAppId) {
        wx.requestSubscribeMessage({
          tmplIds: ['RhJ_Y15m-dL6CNqVzm0U1PRbR1ADOAXjxjT1ACWF_Xo', 'eejHAX6psLzA7ktxDYHR79nlnzA1_C6Um7LxXv7_R0Q'],
          success: res => hhDoctor.addLog('1', '点击药卡订阅消息成功:' + JSON.stringify(res)),
          fail: err => hhDoctor.addLog('1', '点击药卡订阅消息错误:' + JSON.stringify(err))
        })
      }
      if (!e.currentTarget.dataset.trans) {
        return;
      }
      let dataset = e.currentTarget.dataset;
      hhDoctor.addLog('1', '点击药卡:' + JSON.stringify(dataset))
      console.log('dataset', dataset)
      //中宏-跳转1药网小程序无需实名
      if (this.data._request.sdkProductId == 10182) {
        lastMsgTime = null//用于返回信息流更新数据
        let channelName = 'zhbx';//渠道名称 必传 固定值 不能修改
        let orderId = e.currentTarget.dataset.drugId; //订单ID 必传
        let appId = 'wxa090add7f8c97f94';
        let appKey = '756c550269b379b35fc6a5de7912fe99';
        let sign = md5(appKey + channelName + orderId); //签名 必传
        let path = `pages/zhbx/pages/index/index?channelName=${channelName}&orderId=${orderId}&sign=${sign}`;
        navigateToMiniOrderList('yiYao', path)
        return
      }
      this._viewMedicIsRxBuy(dataset)
    },
    /** 显示个人信息授权 */
    _showLicense() {
      return new Promise((resolve, reject) => {
        acceptAuth = false
        this.setData({ isShowAuth: true })
        authHandler && clearInterval(authHandler)
        authHandler = setInterval(() => {
          if (this.data.isShowAuth) return
          clearInterval(authHandler)
          authHandler = null
          if (acceptAuth) resolve()
          else reject()
        }, 100)
      })
    },
    _tapLicense(e) {
      acceptAuth = e.currentTarget.dataset.accept
      this.setData({ isShowAuth: false })
    },
    //非饿了么不用判定起送价 
    _viewMedicIsRxBuy(data) {
      lastMsgTime = null//用于返回信息流更新数据
      wx.showToast({
        title: '加载中...',
        icon: 'loading',
        duration: 500,
        mask: true
      })
      if (!data.drugId) return uiUtil.toast('找不到购药订单ID')
      let msg = this._getMsgByDrugId(data.drugId);
      let hasRx = this._checkHasRx(msg)
      //购买成功，跳转各对接方查看详情
      if (1 == msg.body.isSuccess) {
        // 饿了么调饿了么 饿了么直付跳和缓
        if ((data.source == 'eleme' || data.source == 'elemeB2C') && !data.isEleJumpHh) {
          self._viewOrderListEleme();
          return
        }
        if (data.source == 'yishu') {
          self._viewOrderDetailYishu(data.orderId)
          return
        }
        if (data.source == 'xiaoyaoyao') {
          self._viewOrderDetailXiaoYaoYao(data, hasRx)
          return
        }
        //h5-详情页 ddky ddkyB2C renhe hehuan ringnex ringnexB2C
        self._viewMedicine(data.drugId, self.data._request.redirectPage);
        return;
      }
      this._showLicense().then(() => {
        this.getMedicUserDetail(data, hasRx, msg)
      }).catch(err => { })
    },
    //获取药卡用户详情-跳转到个人信息授权
    getMedicUserDetail(data, hasRx, msg) {
      apis.requestGetRxPatientInfo('', data.patientUuid, hasRx)
        .then(res => {
          if (200 != res.status) return this._showModal('', res && res.message || '请稍后再试')
          if ('undefined' != typeof msg.bodyContent.drugCount && msg.bodyContent.drugCount > 1) {
            let url = this.getMedicUserDetailParams(data, hasRx, res, msg)
            return wx.navigateTo({ url })
          }
          let options = this.getMedicUserDetailOptions(data, hasRx, res, msg)
          naviToMed(options)
        })
        .catch(err => uiUtil.modal('', err && err.message || '请稍后再试'))
    },
    //跳转授权页携带参数
    getMedicUserDetailParams(data, hasRx, res, msg) {
      let _request = this.data._request
      console.log(_request)
      return `${this.data.basePath}innerpages/medic-realname/medic-realname?drugCount=${msg.bodyContent.drugCount}`
        + `&buttonName=${msg.bodyContent.buttonName}`
        + `&name=${res.data.name}`
        + `&isAuth=${res.data.auth}`
        + `&phoneNum=${res.data.phone}`
        + `&hasRx=${hasRx}`
        + `&memberUserToken=${res.data.userToken}`
        + `&medicationList=${encodeURIComponent(JSON.stringify(msg.bodyContent.medicationList))}`
        + `&data=${encodeURIComponent(JSON.stringify(data))}`
        + `&sdkProductId=${_request.sdkProductId}`
        + `&userToken=${_request.userToken}`
        + `&openId=${_request.openId}`
        + `&basePath=${this.data.basePath}`
        + `&redirectPage=${_request.redirectPage || '/pages/newIndex/newIndex'}`
    },
    //跳转授权页携带参数
    getMedicUserDetailOptions(data, hasRx, res, msg) {
      let _request = this.data._request
      console.log('>>> getMedicUserDetailOptions:', _request, msg)
      return {
        drugCount: msg.bodyContent.drugCount,
        buttonName: msg.bodyContent.buttonName,
        name: res.data.name,
        isAuth: res.data.auth,
        phoneNum: res.data.phone,
        hasRx,
        memberUserToken: res.data.userToken,
        medicationList: msg.bodyContent.medicationList,
        data,
        sdkProductId: _request.sdkProductId,
        userToken: _request.userToken,
        openId: _request.openId,
        basePath: this.data.basePath,
        redirectPage: _request.redirectPage || '/pages/newIndex/newIndex'
      }
    },
    /** 跳转饿了么订单列表 */
    _viewOrderListEleme() {
      wx.hideLoading().then().catch(err => { })
      let path = '/pages/order/list/order-list'
      navigateToMiniOrderList('eleme', path).then(() => {
        uiUtil.hideLoading();
      })

    },
    // 跳转壹树的订单详情页
    _viewOrderDetailYishu(orderId) {
      wx.hideLoading().then().catch(err => { })
      let path = `pages/webview/hh/index?orderId=${orderId}`
      navigateToMiniOrderList('yiShu', path, envVersion)
    },
    //跳转小药药的订单详情
    _viewOrderDetailXiaoYaoYao(data, hasRx) {
      apis.requestGetRxPatientInfo('', data.patientUuid, hasRx)
        .then(res => {
          let path = `pages/channelDocking/channelDocking`
          path += `?token=${res.data.userToken}&orderId=${data.drugId}&tel=${res.data.phone}&source=hehuan&status=1`
          console.log('path-查看订单', path)
          navigateToMiniOrderList('xiaoYaoYao', path, envVersion)
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

    // _tapExtendBtn(e) {
    //   if (!e.currentTarget.dataset.btn) {
    //     return;
    //   }
    //   var btn = e.currentTarget.dataset.btn;
    //   switch (btn.type) {
    //     case 'view':
    //       this._doViewUrl(btn.url);
    //       break;
    //     case 'click':
    //       this._clickExtendBtn(btn.key);
    //       break;
    //     default:
    //       return;
    //   }
    // },

    // _clickExtendBtn(key) {
    //   wx.showLoading({ title: '请稍候...', })
    //   var url = this._getHost().wmpHost +
    //     'im/clickExtendBtn?' + this._getPublicRequestParams() +
    //     '&extendBtnKey=' + key;
    //   wx.request({
    //     url: url,
    //     data: {},
    //     method: 'POST',
    //     success: function (res) {
    //       uiUtil.hideLoading();
    //       if (!res || !res.data || 200 != res.data.status) uiUtil.modal('出错了', res && res.data && res.data.message || '网络开小差了，请稍后再试')
    //     },
    //     fail: function () {
    //       uiUtil.hideLoading();
    //       uiUtil.modal('出错了', '网络开小差了，请稍后再试')
    //     }
    //   })
    // },
    //卡片待优化整理合并为一个事件
    //19. fastchannel  重疾绿通 、nurse_home  医护到家 、hao 挂号服务 coopOrderCommon 三方订单(手术 陪诊)
    //20.hao_detail 挂号详情、fastchannel_detail 重疾绿通详情 、nurse_home_detail 医护上门详情 expert_service coopOrderCommonDetail
    _bindCardUrl(e) {
      let data = e.currentTarget.dataset;
      let { command, realPatientUserToken } = data
      console.log('bindCardData', data)
      if (data.isSuccess && data.isSuccess == 1) {
        return;
      }
      //fastchannel  重疾绿通 、nurse_home  医护到家 、hao 挂号服务 coopOrderCommon 三方订单(手术 陪诊)
      if (realPatientUserToken) {
        wx.showLoading({ mask: true })
        apis.requestGetRxPatientInfo(realPatientUserToken, '', false).then(res => {
          uiUtil.hideLoading()
          if (res.data.auth) {
            this._isServerDoViewUrl(data)
            return;
          }
          this._doRealName({ realPatientUserToken: res.data.userToken, name: res.data.name })
        })
        return
      }
      this._isServerDoViewUrl(data)
    },

    _isServerDoViewUrl(data) {
      let { realPatientUserToken, isLinkServer, url, title } = data
      if (isLinkServer) {
        wx.showLoading({ mask: true })
        customApis.REQUESTPOSTCUS(getApp().globalData._hhSdkOptions._host.wmpHost, customApis.APIURLS.informationFlow, data.id).then(res => {
          uiUtil.hideLoading()
          this._doViewUrl(res.data.forwardUrl)
        })
        return
      }
      if (realPatientUserToken) {
        url += `&realPatientUserToken=${realPatientUserToken}&title=${title || ''}`
      }
      this._doViewUrl(url)

    },
    //心理咨询 
    // _tapViewUrl(e) {
    //   if (!e || !e.currentTarget || !e.currentTarget.dataset || !e.currentTarget.dataset.url) return
    //   this._doViewUrl(e.currentTarget.dataset.url)
    // },


    //追加公共参数 需实名认证-挂号  重疾通道 护士到家
    // _tapAppointmentViewUrl(e) {
    //   console.log(e.currentTarget.dataset)
    //   let data = e.currentTarget.dataset;
    //   let {command} = data
    //   //购买成功 查看订单 跳转订单详情
    //   if (data.isSuccess && data.isSuccess == 1) {
    //     return;
    //   }
    //   apis.requestGetRxPatientInfo(data.realPatientUserToken, '', false).then(res => {
    //     // 如果已实名认证-直接跳转h5
    //     data.url += `&realPatientUserToken=${data.realPatientUserToken}&title=${data.title}`
    //     if (res.data.auth) {
    //       this._doViewUrl(data.url)
    //       return;
    //     }
    //     this._doRealName({ realPatientUserToken: res.data.userToken, name: res.data.name })
    //     console.error('尚未实名认证')
    //   })
    // },
    //不追加公共参数-护理报告-挂号详情 绿通详情 护士上门详情
    // _viewOriginUrl(e) {
    //   let data = e.currentTarget.dataset
    //   //重疾二诊须实名认证用此模板
    //   if (data.command == 'expert_service') {
    //     this._tapAppointmentViewUrl(e)
    //     return
    //   }
    //   var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(data.url);
    //   wx.navigateTo({
    //     url: pageUrl
    //   })
    // },

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
      //拉起订阅消息
      if ('wx15e414719996d59f' == wxAppId) {
        wx.requestSubscribeMessage({
          tmplIds: ['BnqBFfGzKJNeWnRRSzA9LHmv6O1QqH0JoOrwyEveK4A'],
          success: res => hhDoctor.addLog('1', '点击专家卡片订阅消息成功:' + JSON.stringify(res)),
          fail: err => hhDoctor.addLog('1', '点击专家卡片订阅消息错误:' + JSON.stringify(err))
        })
      }
      let pageUrl = `${this.data.basePath}innerpages/doctorInfo/doctorInfo?doctorId=${e.currentTarget.dataset.doctorId}`;
      wx.navigateTo({
        url: pageUrl
      })
    },
    /** 发送文本消息 */
    bindSendTextMsg(e) {
      let from = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      uiUtil.loading('发送中...')
      msgUtil.sendText(from, asst.uuid, e.detail, self.data._request.appointedOrderId)
        .then(res => {
          console.log('>>> sendTextMsg:', res, e)
          if (res && res.data && res.data.success) {
            console.log('文本消息发送成功')
            setTimeout(() => { this._getHistoryMsg(false) }, 1000)
          }
        })
        .catch(err => {
          uiUtil.hideLoading()
          uiUtil.toast('消息发送失败')
          console.error('发送消息失败', err)
        })
    },
    /** 发送语音消息 */
    bindSendAudio(e) {
      let from = parseInt(hhDoctor.getUserId());
      let asst = hhDoctor.getAsstInfo();
      let fileType = 'audio'
      uiUtil.loading('发送中...')
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
      uiUtil.loading('发送中...')
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
    },
    /** 点此实名 */
    //type == drug 信息流药卡进入要显示呼叫视频医生按钮以及相关提示
    _doRealName(data) {
      let userToken = data['realPatientUserToken'] || this.data.memberList[0].userToken
      let memberName = data['name'] || this.data.memberList[0].name
      let realPatientUuid = data['realPatientUuid'] || null
      let informationId = data['informationId'] || ''
      if (!realPatientUuid) return wx.navigateTo({ url: `${this.data.basePath}innerpages/realName/realName?userToken=${userToken}&memberName=${memberName}&mode=${data['mode'] || ''}` })
      apis.requestGetBaseUserInfo(realPatientUuid).then(res => {
        if (res.data.isAuth) return uiUtil.toast('实名认证成功，请呼叫医生重新开药')
        wx.navigateTo({ url: `${this.data.basePath}innerpages/realName/realName?userToken=${res.data.userToken}&memberName=${res.data.name}&mode=${data['mode'] || ''}&realPatientUuid=${realPatientUuid}&informationId=${informationId}` })
      }).catch(err => uiUtil.error(err, '实名服务异常，请稍后再试'))
    },
    /** 点击药卡中的呼叫医生 */
    _doCallDoctor(uuid) {
      let url = this.data._request.callPage + '?' + this._getPublicRequestParams() + '&dept=600002' + '&realPatientUuid=' + uuid + '&realPatientUserToken=undefined&localVideoStatus=' + this.data.loadcfg.localVideoStatus
      wx.navigateTo({ url })
    },
    /** 点击预约视频咨询中的等待专家按钮，提前进房等待专家 */
    _waitForDoctor(e) {
      let orderId = e.currentTarget.dataset.orderId, doctorId = e.currentTarget.dataset.doctorId
      hhDoctor.waitForDoctor(doctorId, orderId)
    },
    _viewHealthReport(e) {
      let url = e.currentTarget.dataset.url
      if (!url) return
      this._doViewUrl(url);
    },

    bindcallasst(e) {
      this.triggerEvent('callasst', e.detail)
    },
    bindcontactasst(e) {
      this.triggerEvent('contactasst', {})
    },
    showSummaryActionsheet(e) {
      console.log('>>> showSummaryActionsheet', e)
      let id = e.currentTarget.dataset.id, patient = e.currentTarget.dataset.patient
      wx.showActionSheet({
        itemList: ['删除']
      }).then(res => {
        switch (res.tapIndex) {
          case 0:
            //删除病历
            wx.showModal({
              title: '',
              content: '确定删除消息，删除后不可恢复',
              confirmText: '删除'
            }).then(res => {
              if (res.cancel) return
              //删除
              uiUtil.loading('删除中...')
              customApis.REQUESTPOSTCUS(getApp().globalData._hhSdkOptions._host.wmpHost, customApis.APIURLS.delInformationFlow,
                id, patient, this.data.sdkProductId).then(res => {
                  this.data.msgList
                  for (let i = 0; i < this.data.msgList.length; i++) {
                    if (this.data.msgList[i] && this.data.msgList[i].id && id == this.data.msgList[i].id) {
                      this.data.msgList.splice(i--, 1);
                      break
                    }
                  }
                  this.setData({ msgList: this.data.msgList })
                  uiUtil.hideLoading()
                })
            }).catch(err => { })
            break;
          default: return
        }
      }).catch(err => { })
    }
  }
})