const common = require('./utils/commonUtil.js');
//var hhim = require('./utils/HH_IM_SDK_DEV.js');
const hostUtil = require('./utils/hostUtil.js');

const eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {
    request: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    basePath: {
      type: String,
      value: '/miniprogram_npm/hhdoctor-wmp-sdk/'
    }
  },
  data: {
    _sdkVersion: '1.0.9',
    _request: {
      //公共属性
      subDomain: '',
      profileName: 'test',
      sdkProductId: null,
      userToken: null,
      openId: null,
      style: null,
      //hh-im属性
      callPage: '',
      demoPage: null,
      ehrPage: null,
      personalPage: '',
      personalIconVisible: true,
      naviToAppIconVisible: false,
      medicinePage: null,
      addressPage: '',
      payPage: '',
      redirectPage: '',
      serviceType: 'asst',
      callBtnVisible: true,
      //hh-ehr属性
      viewModule: 'memberList',
      addMember: true,
      patient: '',
      medicRecordId: '',
      appointedDoctorId: '',
      appointedOrderId: '',
      //hh-call属性
      dept: '',
      logoImage: 'https://imgs.hh-medic.com/icon/wmp/logo-default.png',
      waittingText: '预计接通时间',
      cameraTimeoutSeconds: 6,
      cameraTimeoutMessage: '打开摄像头失败，请重启微信再呼叫',
      playTimeoutSeconds: 15,
      playTimeoutMessage: '播放视频失败，请重启微信再呼叫',
      weakNetworkTimeout: 6,
      ringtone: 'https://imgs.hh-medic.com/icon/ring.mp3',
      //hh-personal属性
      personalModule: 'personal',
      //hh-addresslist属性
      enableDelete: true,
      //hh-addressedit属性
      editType: 'create',
      addressId: null,
      //hh-medicine属性
      drugOrderId: null,
      //hh-productright属性
      productId: null,
      //hh-my属性
      autoAcl: false,
      userAcl: {
        showActiveCode: true, //激活码菜单
        changePhone: true, //修改手机号
        showEhr: true, //显示病历档案
        showExpertService: false, //是否显示专家宝菜单
        showLogout: false, //注销菜单
        showInvoice: false, //发票管理菜单
        orderList: false, //订单列表
        showBuyProduct: false, //购买会员菜单
        showAddress: false, //地址管理菜单
        requestInvoice: false, //开发票菜单
        expertServiceStatus: '', //专家宝服务状态,
        showAbout: true, //关于
        showClearCache: true, //清理缓存
        showProductRight: true //查看权益
      },
      regPage: '',
      enableLiveShare: false,
      //其他属性
      hospitalId: null
    }
  },

  attached() {
    that = this;
    app = getApp();
  },
  methods: {

    propertyChanged(newVal, oldVal, changedPath) {
      if (!newVal) {
        return;
      }

      var _req = Object.assign(this.data._request, newVal);
      this.setData({
        _request: _req
      })

      var _host = this._getHost();
      this.setData({
        _host: _host
      })

      if (!this.data._request.userToken && this.data._request.uuid && this.data._request.token) {
        this._getUserToken();
      } else {
        this._checkRequest();
      }
    },

    _getHost() {
      return hostUtil.getHost(this.data._request.profileName, this.data._request.subDomain)
    },

    _logInfo(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);
    },

    _logError(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      console.error('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);
    },

    _triggerEvent(name, detail) {
      this.triggerEvent(name, detail, eventOption)
      //this.triggerEvent(name, detail, eventOption)
    },
    _getUserToken() {
      var url = this.data._host.wmpHost +
        'im/getUserToken?sdkProductId=' + this.data._request.sdkProductId +
        '&uuid=' + this.data._request.uuid +
        '&token=' + this.data._request.token;
      console.log(url);
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          if (res && res.data && 200 == res.data.status) {
            var _req = that.data._request;
            _req.userToken = res.data.data;
            that.setData({
              _request: _req
            })
          } else {
            that._logInfo('>>>>>>_getUserToken failed!');
          }
          that._checkRequest();
        }
      })
    },

    _checkRequest() {
      if (!this.data._request.sdkProductId ||
        !this.data._request.userToken ||
        !this.data._request.openId) {
        return;
      }
      //this._logInfo('当前组件:' + this.data._name);
      switch (this.data._name) {
        case 'hh-im':
        case 'hh-top':
        case 'hh-head':
        case 'hh-ehr':
        case 'hh-personal':
        case 'hh-my':
        case 'hh-addresslist':
        case 'hh-addresssearch':
        case 'hh-right':
        case 'hh-buyproduct':
        case 'hh-sdkcontext':

          break;
        case 'hh-rtc':
		    case 'hh-trtc':
        case 'hh-call':
          if (!this.data._request.dept &&
            (this.data._request.appointedDoctorId || this.data._request.appointedOrderId) &&
            !this.data._request.medicRecordId) {
            this._logError('缺少必要参数:dept');
            return;
          }
          break;
        case 'hh-addressedit':
          if ('update' == this.data._request.editType && !this.data._request.addressId) {
            this._logError('editType为update时，需传入addressId');
            return;
          }
          break;
        case 'hh-medicine':
          if (!this.data._request.drugOrderId) {
            this._logError('缺少必要参数:drugOrderId');
            return;
          }
          break;
        case 'hh-productright':
          if (!this.data._request.productId) {
            this._logError('缺少必要参数:productId');
            return;
          }
          break;
        default:
          return;
      }
      this._logInfo('检查request参数完成');
      var sdkOptions = {
        _host: this.data._host,
        _sdkProductId: this.data._request.sdkProductId,
        _userToken: this.data._request.userToken,
        _openId: this.data._request.openId,
        _profileName: this.data._request.profileName,
        _subDomain: this.data._request.subDomain
      };
      getApp().globalData._hhSdkOptions = sdkOptions;

      this._requestComplete();
    },

    _getPublicRequestParams() {
      var params = 'profileName=' + this.data._request.profileName +
        '&subDomain=' + this.data._request.subDomain +
        '&sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      return params
    },

    _initHhImSdk(requestHis, hhImCallbacks, initCallback) {
      if (getApp().globalData._hhim) {
        if (hhImCallbacks.onHistory) {
          getApp().globalData._hhim.on('history', hhImCallbacks.onHistory);
        }
        if (hhImCallbacks.onMsg) {
          getApp().globalData._hhim.on('msg', hhImCallbacks.onMsg);
        }
        if (hhImCallbacks.onCall) {
          getApp().globalData._hhim.on('call', hhImCallbacks.onCall);
        }
        if (hhImCallbacks.onError) {
          getApp().globalData._hhim.on('error', hhImCallbacks.onError);
        }
        if (hhImCallbacks.onClose) {
          getApp().globalData._hhim.on('close', hhImCallbacks.onClose);
        }
        if (hhImCallbacks.onCommand) {
          getApp().globalData._hhim.on('command', hhImCallbacks.onCommand);
        }
        if (requestHis) {
          getApp().globalData._hhim.getHisMsg();
        }
        if (initCallback) {
          initCallback({
            status: 200
          })
        }
        return;
      }

      this._logInfo(this.data._name + '初始化...');
      var hhim = require('./utils/HH_WMP_SDK.js');
      hhim.init({
        debug: false,
        wsServer: this.data._host.wsServer,
        fileServer: this.data._host.wmpHost + 'im/upload/'
      });

      //注册消息回调
      if (hhImCallbacks.onHistory) {
        hhim.on('history', hhImCallbacks.onHistory);
      }
      if (hhImCallbacks.onMsg) {
        hhim.on('msg', hhImCallbacks.onMsg);
      }
      if (hhImCallbacks.onCall) {
        hhim.on('call', hhImCallbacks.onCall);
      }
      if (hhImCallbacks.onError) {
        hhim.on('error', hhImCallbacks.onError);
      }
      if (hhImCallbacks.onClose) {
        hhim.on('close', hhImCallbacks.onClose);
      }
      if (hhImCallbacks.onCommand) {
        hhim.on('command', hhImCallbacks.onCommand);
      }

      var account = wx.getAccountInfoSync();

      //hhim登录
      this._logInfo('开始登录...');
      hhim.login(
        this.data._request.sdkProductId,
        'ai' == this.data._request.serviceType ? 'unreg' : this.data._request.userToken,
        this.data._request.openId,
        account.miniProgram.appId,
        requestHis,
        function (res) {
          if (res) {
            that._logInfo('登录成功');
            //登录成功
            hhim.sendLog('1', 'login success');
            if (that.data.sysInfo) {
              hhim.sendLog('1', JSON.stringify(that.data.sysInfo));
            }
            getApp().globalData._hhim = hhim;
            if (initCallback) {
              initCallback({
                status: 200
              })
            }
          } else {
            //登录失败
            that._logError('登录失败，请检查request中的公共参数，注意区分测试、生产环境');
            if (initCallback) {
              initCallback({
                status: 400
              })
            }
          }
        });
    },

    _sendLog(logType, logContent) {
      var im = getApp().globalData._hhim;
      if (!im || !im.loginStatus()) {
        return;
      }
      im.sendLog(logType, logContent);
    },

    _viewMedicine(drugOrderId, redirectPage) {
      getApp().globalData._hhSdkOptions.drugOrderId = drugOrderId;
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;

      var vParam = this.data._host.patHost + 'drug/order.html?' +
        'drugOrderId=' + drugOrderId +
        '&sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&payPage=' + encodeURIComponent(this.data.basePath + 'innerpages/pay/pay') +
        '&redirectPage=' + encodeURIComponent(redirectPage ? redirectPage : '/pages/newIndex/newIndex') +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      })
    },

    _viewMedicineMiaoHealth(cartUrl) {
      console.log('cartUrl', cartUrl)
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(cartUrl)
      wx.navigateTo({
        url: pageUrl
      })
    },

    _viewMedicineOrderList(redirectPage) {
      if (this._isUnReg(true)) return;
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;

      var url = this.data._host.patHost + 'drug/order-list.html?' +
        'sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      this._viewUrl(url);
    },
    //查看更多权益
    _viewMoreRightList(){
      let host = this.data._host.secHost;
      let url = host+'hhmy/quanyi/quanyi.html?'+
      'UserToken=' + this.data._request.userToken 
      console.log(url)
      this._viewUrl(url)

    },

    _viewAddressList() {
      if (this._isUnReg(true)) return;
      var url = this.data._host.patHost + 'drug/addr-list.html?' +
        'sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      this._viewUrl(url);
    },

    _viewPersonal(personalModule) {
      var vParam = this.data._host.wmpHost + 'view/?' +
        'module=' + (personalModule ? personalModule : this.data._request.personalModule) +
        '&appId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion;

      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      })
    },

    _viewRight() {
      var pageUrl = this.data.basePath + 'innerpages/right/right?' + this._getPublicRequestParams();
      wx.navigateTo({
        url: pageUrl,
      })
    },

    _viewEhr(options) {
      if (this._isUnReg(true)) {
        return;
      }
      var _options = Object.assign({
        viewModule: 'memberList',
        addMember: true,
        patient: null,
        medicRecordId: null,
        appointedDoctorId: null,
        appointedOrderId: null,
      }, options);

      var vParam = 'module=' + _options.viewModule +
        '&appId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId;

      if (_options.appointedOrderId) {
        vParam += ('&orderId=' + _options.appointedOrderId);
      }
      if (_options.appointedDoctorId) {
        vParam += ('&doctorId=' + _options.appointedDoctorId);
      }
      if ('false' == _options.addMember) {
        vParam += '&hideAddBtn=true';
      }

      if (_options.patient) {
        var p = Number(_options.patient);
        if (isNaN(p)) {
          vParam += '&patientUserToken=';
        } else {
          vParam += '&patient=';
        }
        vParam += _options.patient;
      }
      if (_options.medicRecordId) {
        vParam += '&mrid=' + _options.medicRecordId;
      }
      vParam + '&source=wmpSdk&version=' + this.data._sdkVersion;
      var s = this.data._host.ehrHost + 'view/?' + vParam;
      console.log(s)
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(s);
      wx.navigateTo({
        url: pageUrl
      })
    },


    /*_viewEhr(options) {
      if (this._isUnReg(true)) {
        return;
      }
      var _options = Object.assign({
        viewModule: 'memberList',
        addMember: true,
        patient: null,
        medicRecordId: null,
        appointedDoctorId: null,
        appointedOrderId: null,
      }, options);
      let vParam = '';

      if (_options.patient) {
        var p = Number(_options.patient);
        if (isNaN(p)) {
          vParam += 'memberUserToken=';
        } else {
          vParam += 'memberUuid=';
        }
        vParam += _options.patient;
      }
      if (_options.medicRecordId) {
        vParam += '&id=' + _options.medicRecordId;
      }
      vParam + '&source=wmpSdk&version=' + this.data._sdkVersion;

      var pageUrl = this.data.basePath;
      switch (_options.viewModule) {
        case 'memberList':
          pageUrl += 'innerpages/hh-ehr/ehr-index/ehr-index';
          break;
        case 'ehrList':
          pageUrl += 'innerpages/hh-ehr/ehr-filing-list/ehr-filing-list';
          break;
        case 'detail':
          pageUrl += 'innerpages/hh-ehr/ehr-filing-detail/ehr-filing-detail';
          break;
        default:
          return;
      }

      pageUrl += '?' + vParam;

      wx.navigateTo({
        url: pageUrl
      })
    },*/

    _viewBeanList() {
      var vParam = this.data._host.patHost + 'drug/account.html?' +
        'sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      })
    },

    _viewUrl(url) {
      console.log(this.data.basePath)
      url = this._appendUrlParams(url);
      var pageUrl = this.data.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url);
      wx.navigateTo({
        url: pageUrl
      })
    },


    _buyProduct(productId) {
      if (!this.data._request.payPage) {
        return;
      }
      var pageUrl = this.data._request.payPage + '?' + this._getPublicRequestParams() + '&name=购买套餐&price=9999&pid=' + productId;
      wx.navigateTo({
        url: pageUrl
      })
    },

    _viewActiveCode(e) {
      if (this._isUnReg(true)) return;
      console.log('>>> _viewActiveCode:', e)
      let msg = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.msg || ''
      let param = 'sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&profileName=' + this.data._request.profileName +
        '&subDomain=' + this.data._request.subDomain +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&activeCodeMsg=' + msg;
      let pageUrl = this.data.basePath + 'innerpages/invitationcode/invitationcode?' + param;
      wx.navigateTo({
        url: pageUrl
      })
    },
    _isUnReg(alert) {
      if ('unreg' == this.data._request.userToken) {
        if (alert) {
          wx.showToast({
            title: '请注册登录后再试',
            icon: 'none'
          })
        }
        return true;

      }
      return false;
    },

    _appendUrlParams(url) {
      if (url.indexOf('?') >= 0) {
        url += '&';
      } else {
        url += '?';
      }
      url += ('_=' + new Date().getTime() + '&source=wmpSdk');

      if (url.indexOf('openId=') < 0 && this.data._request.openId) {
        url += ('&openId=' + this.data._request.openId);
      }
      if (url.indexOf('wmpVersion=') < 0 && getApp().globalData.wmpVersion) {
        url += ('&wmpVersion=' + getApp().globalData.wmpVersion);
      }
      if (url.indexOf('sdkVersion=') < 0) {
        url += ('&sdkVersion=' + this.data._sdkVersion);
      }
      if (url.indexOf('sdkProductId=') < 0 && this.data._request.sdkProductId) {
        url += ('&sdkProductId=' + this.data._request.sdkProductId);
      }
      if (url.indexOf('wxAppId=') < 0 && getApp().globalData.wxAppId) {
        url += ('&wxAppId=' + getApp().globalData.wxAppId);
      }
      return url;
    },
    _clearIntervalHandler(handler) {
      if (handler) {
        clearInterval(handler);
        handler = null;
      }
    }
  }
})