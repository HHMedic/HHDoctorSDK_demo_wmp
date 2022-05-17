const hhDoctor = require('../hhDoctor.js');
const apis = require("../utils/api.js");
const customApis = require('../utils/customApi.js')
var calling = false;
let that;
let apiUtil;
let liveListInterval = null;
let infoTip = '检测到信息不全，需补充姓名、年龄、电话等信息后，可使用该服务'
let callType = ""
Component({
  behaviors: [
    require('../behaviors/hhStarter'),
    require('../behaviors/hhCommon'),
  ],
  properties: {
    msgPanelTop: Number,//顶部高度
    navigationBar: Object,
    wxMbb: Object,
    navStyle: String,
    customStyle: Object,
    disConnected: Boolean,
    manyVideo: Boolean,
    product: Object,
    isAuth: Boolean,
    loadcfg: {
      type: Object,
      value: {},
      observer(val) {
        if (!val) return
        let localVideoStatus = 'undefined' != typeof val.localVideoStatus ? val.localVideoStatus : 2
        this.setData({ localVideoStatus })
      }
    },
    demoStatusInit: {
      type: Number,
      value: -1,
      observer(val) {
        this.setData({
          demoStatus: val
        })
      }
    }
  },
  data: {
    _name: 'hh-calling',
    memberCallTop: -1200,
    sysInfo: {},
    isAgreeExplain: true,//呼叫协议,
    callBtnsVisible: false,
    animationMemberData: null,
    liveList: [],
    livePanelHeight: 0,
    isLoading: false,
    memberList: [],
    patient: null,
    parent: null,
    demoStatus: -1,
    modalMsgData: { source: 'member', content: infoTip, confirmText: '立即补充' },//disclaimer member 目前只有补充成员信息和免责声明用到该组件
    deleteCount: 0,//删除成员的个数 
    isShowModal: false,//补全信息的弹窗开关
    sceneNum: '',
    isEnterFace: false,//是否打开人脸识别
    callPageUrl: '',
    showAddBtn: false,
    dept: '600002',
    isInvite: 0,//1 邀请成员（多人视频模式）0单人视频（默认值）
    manyVideo: false,//是否显示多人视频入口 根据渠道动态配置
    isOpenAccount: false,
    authList: null,
    isShowAuthTip: false,
    callingVisible: false,
    title: '',
    test: null,
    localVideoStatus: 1,
  },
  lifetimes: {
    attached() {
      that = this;
      this.setData({ sysInfo: wx.getSystemInfoSync() })
      console.log('系统信息', this.data.sysInfo, this.data.msgPanelTop)
    },
    detached() {
      that._clearIntervalHandler(liveListInterval);
    }

  },
  pageLifetimes: {
    show() {
      that.getMember();
    },
    hide() {
      that._clearIntervalHandler(liveListInterval);
    }
  },
  methods: {
    _requestComplete() {
      console.log('calling-request', this.data._request)
      that._getLiveListCycle();
      apiUtil = require('../utils/apiUtil.js');
      that._checkSceneNum();
      that.getMember();
    },
    _naviToApp() {
      //从小程序跳转过来的      
      if (this.data.sceneNum == 1037) {
        wx.navigateBackMiniProgram();
      }
      //从上一个页面进来的
      wx.navigateBack();
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

    getMember() {
      this.setData({
        sceneNum: wx.getLaunchOptionsSync().scene
      })
      if (!this.data._request.userToken || this.data._request.userToken == 'unreg') {
        return;
      }
      apis.requestGetMember().then(res => {
        if (res.status == 200) {
          let memberList = res.data.memberList;
          let patient = res.data.patient;
          wx.setStorageSync('patient', patient)
          memberList.unshift(patient)
          this.setData({
            memberList,
            showAddBtn: res.data.showAddBtn,
            showAccount: res.data.showAccount,
            relationList: JSON.stringify(res.data.relationList),
            deleteCount: res.data.deleteCount,
            isLoading: true,
            patient: res.data.patient,
            parent: res.data.parent ? res.data.parent : null
          })
          wx.setStorageSync('relationList', this.data.relationList)
          this.triggerEvent('memberList', this.data.memberList)
          if (hhDoctor && hhDoctor.getUserId()) {
            hhDoctor.getUserInfo()
              .then(() => {
                this.setData({
                  userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0
                })
              })
          }
          //与@wangyuanyuan讨论后确定将启动后检查信息不全功能暂时去掉
          //首次是否弹出信息不全提示
          /*let loginUser = getApp().globalData.loginUser
          let integrityCheck = true
          if (loginUser && loginUser.loadcfg && 'undefined' != typeof loginUser.loadcfg.integrityCheck) integrityCheck = loginUser.loadcfg.integrityCheck
          if (!this.checkMemberMessage(patient.name, patient.sex, patient.birthday, patient.needUpdateInfo, patient.uuid) && integrityCheck) {
            this.setData({
              modalMsgData: { source: 'member', content: infoTip, confirmText: '立即补充' },
              isShowModal: true,
              memberUuid: this.data.memberList[0].uuid
            })
          }*/
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      }).catch(err => { wx.hideLoading() })
    },
    _changeLocalVideoStatus() {
      this.setData({ localVideoStatus: 1 - this.data.localVideoStatus })
    },
    _jumpAsseUrl(dataset, iconEventData) {
      calling = false;
      that._hideBtn()
      that._callingVisible(false)
      let item = dataset.item
      let forwardUrl = iconEventData.forwardUrl
      let pageUrl = forwardUrl + `${forwardUrl.indexOf('?') > 0 ? '&' : '?'}` +
        `comeFrom=default` +
        `&userToken=${this.data.memberList[0].userToken}` +
        `&sdkProductId=${item.sdk_product_id}` +
        `&openId=${that.data._request.openId}` +
        `&realPatientUserToken=${item.userToken}` +
        `&wxAppId=${getApp().globalData.wxAppId}` +
        `&type=${iconEventData.serviceType}` + this._getRightsJumpParams(item)
      if (iconEventData.rule && typeof iconEventData.rule.isNeedCheck != 'undefined') {
        pageUrl += `&isNeedCheck=${iconEventData.rule.isNeedCheck}`
      }
      console.log()
      console.log('page', pageUrl)
      wx.navigateTo({
        url: `${this.data.basePath}innerpages/view/view?url=${encodeURIComponent(pageUrl)}`,
      })
    },
    _getRightsJumpParams(item) {
      let serviceType = this.data.iconEventData.serviceType
      // 新华保险四个评估的type是以asse结尾
      if (serviceType.match(/asse$/g)) {
        return `&sex=${item.sex}&birthday=${item.birthdayStr}&name=${item.name}&uuid=${item.uuid}`
      }
      return ''
    },

    /** 单人套餐呼叫时，以主账号身份直接呼叫 */
    _callDoctorAsPrimaryAccount() {
      let dataset = {
        call: 'call',
        dept: '600002',
        isAccount: false,
        item: this.data.patient,
        name: this.data.patient.name,
        needUpdateInfo: this.data.patient.needUpdateInfo,
        birthday: this.data.patient.birthday,
        sex: this.data.patient.sex,
        uuid: this.data.patient.uuid
      }
      let e = { currentTarget: { dataset } }
      this._callDoctor(e)
    },

    /** 点击选择成员项呼叫医生 唤起成员列表 */
    _callDoctor(e) {
      console.log(e)
      if (!this.data._request.callPage || !this.data._request.callBtnVisible) {
        return;
      }
      if (calling) {
        return;
      }
      calling = true;
      callType = this.properties.loadcfg && this.properties.loadcfg.defaultCallType || ''
      let dataset = e.currentTarget.dataset
      console.log('选择成员的dataset', dataset)
      //如果是底部权益列表选择的成员
      if (!dataset.call) {
        let iconEventData = this.data.iconEventData || {}
        let rule = iconEventData.rule || {}
        let isCall = typeof (rule.isCall) != 'undefined' ? rule.isCall : false
        let forwardUrl = iconEventData.forwardUrl
        callType = iconEventData.serviceType
        //点击评估权益调起成员list->H5 产品说后期发展成呼叫视频医生 暂在此执行
        if (forwardUrl && !isCall && iconEventData.serviceType != 'drug') {
          // 需要实名&&当前成员未实名
          if (rule.isNeedAuth && !dataset.item.is_auth) {
            calling = false;
            that._callingVisible(false)
            wx.navigateTo({ url: `${this.data.basePath}innerpages/realName/realName?userToken=${dataset.item.userToken}&memberName=${dataset.name}` })
            return
          }
          if (!that._checkMessage(dataset.name, dataset.sex, dataset.birthday, dataset.needUpdateInfo, dataset.uuid)) return
          // || iconEventData.serviceType == 'medical_shop'
          if (iconEventData.serviceType == 'drug_shop') {
            that.getJumpToMiniGH(iconEventData.serviceType)
            return
          }
          this._jumpAsseUrl(dataset, iconEventData)
          return
        }
      }
      wx.showLoading({
        title: '连接中...',
      })
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
            confirmText: '我知道了',
            confirmColor: '#0592f5',
            success: function () {
              that.triggerEvent('onWsClose')
            }
          })
          return;
        }
        if (!that.data.disConnected && hhDoctor.getUserId() && hhDoctor.getUserSig()) {
          //登录成功，可以呼叫
          wx.hideLoading();
          clearInterval(callInterval);
          //检查是否是黑名单
          that._checkBlackList()
            .then(() => {
              //检查主账号信息是否完整
              // let patient = that.data.memberList[0]
              // if(!that._checkMessage(patient.name,patient.sex,patient.birthday,patient.needUpdateInfo))return
              //检查成员信息是否补全 ———— 如果是多人视频则同时展示独立子账号入口 必须填写
              // console.log(that._checkMessage(dataset.name, dataset.sex, dataset.birthday,dataset.needUpdateInfo,dataset.uuid),dataset)

              if (!that._checkMessage(dataset.name, dataset.sex, dataset.birthday, dataset.needUpdateInfo, dataset.uuid)) return
              //节流
              if (that._getThrottle()) return;
              //正式呼叫 如果是选择成员 就传成员id 否则就传自己的 以供评价使用
              //let pageUrl = that.data._request.callPage + '?' + that._getPublicRequestParams() + '&dept=' + e.currentTarget.dataset.dept + '&uuid=' + uuid;
              let pageUrl = that.data._request.callPage + '?' + that._getPublicRequestParams() + '&dept=' + dataset.dept + '&realPatientUuid=' + dataset.uuid + '&realPatientUserToken=undefined&localVideoStatus=' + that.data.localVideoStatus;
              //底部权益弹出 -  根据rightList-serviceType
              if (callType) pageUrl += ('&callType=' + callType)
              pageUrl += ('&ext=' + that.data._request.ext || '')
              if (that.data.isInvite == 1) {
                if (!dataset.isAccount) {
                  console.log('成员未开通', dataset)
                  //成员未开通独立登录功能
                  that.setData({
                    modalMsgData: { source: 'member', content: ' 您需要将该成员编辑成独立登录， 再发起邀请', confirmText: '去编辑', uuid: dataset.uuid },
                    isShowModal: true,
                    memberUuid: dataset.uuid
                  })
                  calling = false;
                  that._callingVisible(false)
                  return
                }
                pageUrl += '&orderType=many_video&isInvite=' + that.data.isInvite
              }

              console.log('pageurl', pageUrl)
              // support_face_oauth 人脸识别 中宏 人保 单人套餐
              // const needFaceSdkId = [10182, 10327]
              // if (needFaceSdkId.indexOf(that.data._request.sdkProductId) != -1) {
              if (that.data._request.loadcfg['support_face_oauth']) {
                that._hideBtn()
                calling = false;
                //刷脸之前需实名认证
                if (!that.data.isAuth) {
                  //去实名
                  that.triggerEvent('doRealName')
                  return
                }
                if (dataset.item.cardType != 1 && dataset.item.cardType != 8) {
                  wx.navigateTo({
                    url: pageUrl
                  })
                  return
                }
                //证件类型为不为身份证或户口本
                that.setData({
                  isEnterFace: true,
                  callPageUrl: pageUrl
                })
                return
              }
              wx.navigateTo({
                url: pageUrl
              })
              calling = false;
              that._hideBtn();
            }).catch(err => {
              //进入演示模式
              that._callDemo(dataset.dept, 5, dataset.uuid);
              calling = false;
            })

          return;
        }
        callTimeout += 100;
      }, 100)
    },
    _checkMessage(name, sex, birthday, needUpdateInfo, uuid) {
      console.log('>>> _checkMessage', name, sex, birthday, needUpdateInfo, uuid)
      //检查账号信息是否完整
      if (!that.checkMemberMessage(name, sex, birthday, needUpdateInfo, uuid || that.data.memberList[0].uuid)) {
        that.setData({
          modalMsgData: { source: 'member', content: infoTip, confirmText: '立即补充' },
          isShowModal: true,
          memberUuid: uuid || that.data.memberList[0].uuid
        })
        calling = false;
        return false
      }
      return true
    },
    //外部调用显示呼叫列表 set展示信息
    _getCallingList(e) {
      console.log('外部调用传入信息', e.detail)
      this.setData({ forwardUrl: e.detail.forwardUrl || '', iconEventData: e.detail || '' })
      let product = that.data.product || {}
      if (!product) {
        that.setData({
          isShowModal: true,
          modalMsgData: { source: 'single', content: '您需要开通会员才能享受该服务', ishidecancel: true, confirmText: '我知道了' }
        })
        return
      }

      if (product.productStatusEnum == 'unpay' || product.productStatusEnum == 'exp') {
        that.setData({
          isShowModal: true,
          modalMsgData: { source: 'single', content: '您需要开通会员才能享受该服务', ishidecancel: true, confirmText: '我知道了' }
        })
        return
      }
      if (product.productStatusEnum == 'unbegin') {
        that.setData({
          isShowModal: true,
          modalMsgData: { source: 'single', content: '您的套餐还未到生效时间', ishidecancel: true, confirmText: '我知道了' }
        })
        return
      }
      switch (e.detail.serviceType) {
        //陪同咨询
        case 'many_video':
          that.setData({
            isInvite: 1,
            title: e.detail.title
          })
          if (product.productStatusEnum == 'per' && product.userCnt == 0) {
            that.setData({
              isShowModal: true,
              modalMsgData: { source: 'single', content: '您的会员是单人套餐，需要开通多人套餐才可使用该功能', ishidecancel: true, confirmText: '我知道了' }
            })
            return
          }
          if (that.data.userCnt == 0 && that.data.memberList.length < 2) {
            that.setData({
              isShowModal: true,
              modalMsgData: { source: 'single', content: '您的会员是单人套餐，需要开通多人套餐才可使用该功能', ishidecancel: true, confirmText: '我知道了' }
            })
            return
          }
          //检查主账号信息是否完整
          let patient = that.data.memberList[0]
          if (!that._checkMessage(patient.name, patient.sex, patient.birthday, patient.needUpdateInfo)) return
          if (that.data.memberList.length < 2) {
            that.setData({
              modalMsgData: { source: 'many_video', content: '您需要添加成员并允许该成员独立登录， 再发起邀请', confirmText: '去添加' },
              isShowModal: true,
            })
            return;
          }
          break;
        //return
        default:
          that.setData({
            title: e.detail.title,
            isInvite: 0
          })
          break;
      }

      //成员不共享权益 直接进行跳转不唤起成员列表@侯
      let iconEventData = this.data.iconEventData || {}
      if (iconEventData.rule && iconEventData.rule.isChooseMember == false) {
        let user = this.data.memberList[0]
        let dataset = {
          name: user.name,
          birthday: user.birthday,
          dept: '600002',
          isAccount: user.isAccount,
          uuid: user.uuid,
          needUpdateInfo: user.needUpdateInfo,
          sex: user.sex,
          item: user
        }
        let data = { currentTarget: { dataset } }
        this._callDoctor(data)
        return
      }
      this._callingVisible(true)
    },
    _getThrottle() {
      let timestamp = Date.parse(new Date());
      let preTimeStamp = wx.getStorageSync('preTimeStamp') || 0;
      let seconds = parseInt((timestamp - preTimeStamp) / 1000)
      let t = getApp().globalData.wxAppId == 'wx86eb65c4b44aae39' ? 1 : 8
      if (seconds < t) {
        wx.showToast({
          title: '操作太频繁啦，稍后再试',
          icon: 'none',
          mask: true,
          duration: 3000
        })
        calling = false;
        return true;
      }
      wx.setStorageSync('preTimeStamp', timestamp)
    },
    // 点击呼叫医生按钮 弹出动画 
    _showHideBtn() {
      this._showBtn(!this.data.callBtnsVisible);
      this.setData({ isInvite: 0 })
    },
    //点击呼叫医生按钮 先检查是否授权
    _bindCheckAuthList() {
      this.getMember()
      let authArr = ['scope.userLocation', 'scope.record', 'scope.camera']
      wx.getSetting({
        success(res) {
          console.log('getsetting', res.authSetting, that.data.isShowAuthTip)
          // 如果列表里有一个授权没有 就进行授权前提示 几连弹
          for (var i = 0; i < authArr.length; i++) {
            //console.log(res.authSetting.hasOwnProperty(authArr[i]))
            if (!res.authSetting.hasOwnProperty(authArr[i])) {
              //提示用户去授权
              that.setData({
                authList: null,
                isShowAuthTip: !that.data.isShowAuthTip
              })
              return;
            }
          }
          // 反之 提示未授权项 进入授权列表手动授权
          that.data.authList = {};
          that.data.authList['userLocation'] = res.authSetting['scope.userLocation'];
          that.data.authList['record'] = res.authSetting['scope.record'];
          that.data.authList['camera'] = res.authSetting['scope.camera']
          let isEveryAuth = Object.values(that.data.authList).every(that.getIsAuthAll);
          that.setData({
            authList: that.data.authList,
            isShowAuthTip: !isEveryAuth
          })

          if (isEveryAuth) {
            that._callingVisible(false)
            //如果是单人卡或体验成员，直接呼叫
            console.log('>>> memberList:', that.data.product, that.data.memberList)
            if (that.directCall()) that._callDoctorAsPrimaryAccount()
            else that._showHideBtn();
          }
        }
      })
    },
    /**是否直接呼叫 */
    directCall() {
      //单人套餐卡
      if (that.data.product && 0 == that.data.product.userCnt) return true
      //独立子账号
      if (that.data.product && 1 == that.data.memberList.length && that.data.memberList[0].isAccount) return true;
      return false
    },
    //检查是否全部授权
    getIsAuthAll(item) {
      return item == true
    },
    //暂不授权
    bindNoAuth(e) {
      that.setData({ isShowAuthTip: e.detail })
      if (that.data.authList.record && that.data.authList.camera) {
        this._showHideBtn();
      }
    },
    //hh-auth 子组件返回是否显示授权弹窗
    bindIsShowAuthTip(e) {
      that.setData({ isShowAuthTip: e.detail })
    },

    //隐藏呼叫医生弹出层 
    _hideBtn() {
      this._showBtn(false);
      // this._showUtils(false);
      this._callingVisible(false)
    },

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
      var topPx = visible ? this.data.memberCallTop - 2 : -(this.data.memberList.length * 98 + 178);
      animation.top(topPx).step();
      this.setData({
        callBtnsVisible: visible,
        animationMemberData: animation.export(),
      })
    },
    //检查是否为黑名单
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
    //检查成员信息是否补全
    checkMemberMessage(name, sex, birthday, needUpdateInfo, memberUuid) {
      if (needUpdateInfo) return false
      let obj = {}
      obj['birthday'] = birthday || '';
      obj['name'] = name || '';
      obj['sex'] = sex || '';
      this.setData({ storeMsg: obj })
      for (var key in obj) {
        if (!obj[key] || obj[key] == '请完善信息以发起呼叫') {
          return false;
        }
      }
      //检查主账号手机号是否为空。如果可约专家、手机号为空，则需补充信息
      if (this.data.patient.uuid == memberUuid) {
        let _product = hhDoctor.getProduct()
        if (_product && _product.canOrderExpert && !this.data.patient) return false
      }
      return true;
    },
    // 进入演示模式
    _callDemo() {
      var pageUrl = that.data._request.demoPage + '?' + that._getPublicRequestParams() + '&dept=' + that.data.dept + '&openType=4' + '&uuid=' + that.data.patient.uuid;
      wx.navigateTo({
        url: pageUrl
      })
      this._hideBtn();
      calling = false;
    },
    //是否同意呼叫协议点击
    _bindIsAgreeExplain() {
      that.setData({
        isAgreeExplain: !that.data.isAgreeExplain
      })
    },
    _bindExplainBook() {
      let app = getApp()
      if (!app.globalData._hhSdkOptions || !app.globalData._hhSdkOptions._host || !app.globalData._hhSdkOptions._host.wmpHost) return
      wx.navigateTo({
        url: that.data.basePath + `innerpages/view/view?url=${encodeURIComponent(app.globalData._hhSdkOptions._host.wmpHost + 'wmp/license?type=2000')}`,
      })
    },

    //loadConfig
    _checkSceneNum() {
      let self = this;
      let app = getApp()
      let forbiddenScene = app.globalData.loginUser && app.globalData.loginUser.loadcfg && app.globalData.loginUser.loadcfg.forbiddenScene || [],
        allowScene = app.globalData.loginUser && app.globalData.loginUser.loadcfg && app.globalData.loginUser.loadcfg.allowScene || [],
        allowSceneExceptionMsg = app.globalData.loginUser && app.globalData.loginUser.loadcfg && app.globalData.loginUser.loadcfg.allowSceneExceptionMsg || '不支持从当前场景打开小程序';
      //增加启动场景白名单功能 mayonglei @wangyuanyuan
      if (allowScene && allowScene.length) {
        let allow = false
        for (let i = 0; i < allowScene.length; i++) {
          if (parseInt(allowScene[i]) == self.data.sceneNum) {
            allow = true
            break
          }
        }
        if (!allow) {
          return wx.reLaunch({ url: '/pages/error/error?msg=' + allowSceneExceptionMsg })
        }
      }
      if (!forbiddenScene && !forbiddenScene.length) {
        return;
      }
      for (let i = 0; i < forbiddenScene.length; i++) {
        if (forbiddenScene[i].scene == self.data.sceneNum) {
          return wx.reLaunch({ url: '/pages/error/error?msg=' + (forbiddenScene[i].msg || '不支持从当前场景打开小程序') })
        }
      }
    },
    getJumpToMiniGH(serviceType) {
      wx.showLoading({
        mask: true
      })
      customApis.REQUESTPOSTCUS(that._getHost().wmpHost, customApis.APIURLS.getJumpGHParam, serviceType).then(res => {
        wx.hideLoading()
        if (res.status == 200) {
          calling = false;
          that._callingVisible(false)
          let sdkProductId = that.data._request.sdkProductId
          if (this.data._request.profileName == 'test') {
            // 测试环境
            let path = {
              'drug_shop': `/pages/portal/portal?id=7&jumpType=server_url&needLocation=true&source=hehuan&sdkProductId=${sdkProductId}&`,
              'medical_shop': `/pages/portal/portal?source=hehuan&needLocation=true&jumpUrl=https%3A%2F%2Fhmp-test.hh-medic.com%2Fphysical%2Fphysical-gh%2Findex.html&sdkProductId=${sdkProductId}&`
            }
            this._navMiniGH(path[serviceType] + res.data, 'trial')
          } else {
            //生产环境
            let path = {
              'drug_shop': `/pages/portal/portal?id=7&jumpType=server_url&needLocation=true&source=hehuan&sdkProductId=${sdkProductId}&`,
              'medical_shop': `/pages/portal/portal?source=hehuan&needLocation=true&jumpUrl=https%3A%2F%2Fhmp.hh-medic.com%2Fphysical%2Fphysical-gh%2Findex.html&sdkProductId=${sdkProductId}&`
            }
            this._navMiniGH(path[serviceType] + res.data, 'release')
          }
        }
      }).catch(err => {
        wx.hideLoading()
        calling = false;
        that._callingVisible(false)
      })
    },
    _navMiniGH(path, env) {
      console.log('光和path', path)
      wx.navigateToMiniProgram({
        appId: 'wxe344feac39166c1f',
        path,
        envVersion: env// 'release',//'trial'
      })
    },

    //添加家庭成员
    bindAddFimily(e) {
      callType = ''
      if (!e || !e.currentTarget.dataset.call) {
        callType = this.data.iconEventData.serviceType
      }
      //检查自己信息是否补全
      if (!that.checkMemberMessage(that.data.memberList[0].name, that.data.memberList[0].sex, that.data.memberList[0].birthday, that.data.memberList[0].needUpdateInfo, that.data.memberList[0].uuid)) {
        that.setData({
          modalMsgData: {
            source: 'member',
            content: infoTip,
            confirmText: '立即补充'
          },
          isShowModal: true,
          memberUuid: that.data.memberList[0].uuid
        })
        calling = false;
        return;
      }
      if (this.data.userCnt == -1) {
        this.navAddMemberPage(2)
        return;
      }
      wx.showLoading({ title: '加载中...' })
      hhDoctor.getUserInfo(true)
        .then(() => {
          wx.hideLoading()
          this.setData({ userCnt: hhDoctor.getProduct() ? hhDoctor.getProduct().userCnt : 0 })
          if (0 == this.data.userCnt) return wx.showToast({ title: '无法添加新成员', icon: 'none' })
          let userNum = this.data.userCnt - (this.data.memberList.length - 1) - this.data.deleteCount
          let modalCon = this.data.deleteCount > 0 ? `还可添加${userNum}成员（删除已添加成员后仍占用名额，已删除${this.data.deleteCount}成员），确定添加吗？` : `还可添加${userNum}成员（删除已添加成员后仍占用名额），确定添加吗？`
          this.setData({
            isShowModal: true,
            modalMsgData: { source: 'addmember', content: modalCon, confirmText: '确定添加' }
          })
        }).catch(err => {
          wx.hideLoading()
          return wx.showToast({ title: err && err.message || '服务器错误，请稍后再试', icon: 'none' })
        })
    },

    //跳转编辑成员信息页（添加成员+补全信息）
    navAddMemberPage(type, memberUuid, isHideCallBtn) {
      let pageUrl = `${this.data.basePath}innerpages/ehr-addmember/ehr-addmember?isInvite=${this.data.isInvite}`
      if (type) { pageUrl += `&type=${type}` }
      if (memberUuid) { pageUrl += `&memberUuid=${memberUuid}` }
      //callType 底部权益入口进入则都会有callType 均隐藏呼叫视频医生按钮
      if (callType) { isHideCallBtn = true }
      if (isHideCallBtn) { pageUrl += `&isHideCallBtn=${isHideCallBtn}` }
      that._callingVisible(false)
      this._showBtn(false);
      wx.navigateTo({ url: pageUrl })
    },
    //弹窗确定
    _bindMyConfirm(e) {
      console.log(e)
      that.setData({
        isShowModal: false
      })
      switch (e.currentTarget.dataset.type) {
        // 补全信息 & 邀请成员视频其 成员不是独立登录
        case 'member':
          that.navAddMemberPage(4, this.data.memberUuid)
          break;
        case 'addmember': that.navAddMemberPage(2)
          break;
        //免责声明
        case 'disclaimer':
          that._viewMedixcine(that.data.modalMsgData.params.drugId, this.data.modalMsgData.params.redirectPage)
          break;
        //点击陪同咨询没有成员去添加
        case 'many_video': that.bindAddFimily()
          break;

      }
    },
    //进入直播
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

    _getLiveListCycle() {
      that._clearIntervalHandler(liveListInterval);
      that._getLiveList();
      liveListInterval = setInterval(function () {
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
        that.triggerEvent('livePanelHeight', { livePanelHeight: that.data.livePanelHeight })
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
          that.triggerEvent('livePanelHeight', { livePanelHeight: that.data.livePanelHeight })

        }
      })
    },
    _filterLiveList(list) {
      let liveList = [];
      if (list && list.length) {
        for (var i = 0; i < list.length; i++) {
          if (0 == list[i].liveStatus || 1 == list[i].liveStatus) {
            liveList.push(list[i]);
          }
          if (2 == liveList.length) {
            break;
          }
        }
      }
      that.setData({
        liveList: liveList,
        livePanelHeight: liveList.length > 0 ? 130 : 0
      })
      that.triggerEvent('livePanelHeight', { livePanelHeight: that.data.livePanelHeight })

    },
    bindContinue() {
      that.setData({
        isEnterFace: false
      })
      wx.navigateTo({
        url: that.data.callPageUrl
      })
    },
    bindBeginFaceVerify(e) {
      let self = this;
      hhDoctor.addLog('1', '人脸验证-' + JSON.stringify(e.detail), '');
      hhDoctor.addLog('1', '人脸验证parent-' + JSON.stringify(self.data.parent), '');
      wx.startFacialRecognitionVerify({
        name: e.detail.username,
        idCardNumber: e.detail.idCard,
        checkAliveType: 2,
        success(res) {
          hhDoctor.addLog('1', '人脸验证success-' + JSON.stringify(res), '');
          console.log('success', res)
          that.setData({
            isEnterFace: false
          })
          wx.navigateTo({
            url: self.data.callPageUrl
          })
        },
        fail(err) {
          console.log('fail', err)
          console.log(self.data)
          hhDoctor.addLog('1', '人脸验证fail-' + JSON.stringify(err), '');
          //如果是被投保人刷脸失败 => 显示让投保人协助认证
          //如果是投保人协助认证刷脸失败 =>显示为被投保人自己刷脸 err.errCode==90100
          let patient = self.data.patient;
          let helpName = self.data.parent ? self.data.parent.realName : patient.userExtra.guardianName ? patient.userExtra.guardianName : ''
          let content = (helpName && e.detail.username == self.data.patient.realName) ? '，可让关系人 ' + self.getStarName(helpName) + ' 刷脸帮助认证' : '';
          wx.showModal({
            content: '人脸识别未通过' + content,
            confirmText: '我知道了',
            confirmColor: '#0592f5',
            cancelColor: '#666',
            showCancel: false
          })
        }
      })
    },
    getStarName(str) {
      let len = str.length
      let newStr = ''
      for (let i = 0; i < len - 1; i++) {
        newStr += '*'
      }
      return newStr + str.substring(len - 1, len)
    },
    //关闭人脸认证界面
    bindCloseFaceVerify() {
      this.setData({ isEnterFace: false })
    },

    //关闭底部呼叫列表
    bindCallingVisible() {
      this._callingVisible(false);
    },
    _callingVisible(callingVisible) {
      this.setData({ callingVisible })
    }
  }
})
