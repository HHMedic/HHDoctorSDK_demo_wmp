const common = require('../utils/commonUtil.js');
const hostUtil = require('../utils/hostUtil.js');
const cStyle = require('../utils/consoleStyle')
const eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {
    request: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        console.log(this)
        this.paramRequestChange(newVal, oldVal, changedPath);
      }
    },
    basePath: {
      type: String,
      value: '/miniprogram_npm/hhdoctor-wmp-sdk/'
    }
  },
  data: {
    _sdkVersion: '3.1.0',
    _request: {
      //公共属性
      subDomain: '',
      profileName: getApp().globalData.profile || 'test',
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
      bottomToolsVisible: true,
      bottomExtToolsVisible: false,
      bottomRightsVisible: true,
      inputPlaceHolder: '联系医助',
      //hh-ehr属性
      viewModule: 'memberList',
      addMember: true,
      patient: '',
      medicRecordId: '',
      appointedDoctorId: '',
      appointedOrderId: '',
      //hh-call属性
      dept: '',
      caller: '',
      logoImage: 'https://imgs.hh-medic.com/icon/wmp/logo-default.png',
      waittingText: '预计接通时间',
      cameraTimeoutSeconds: 6,
      cameraTimeoutMessage: '打开摄像头失败，请重启微信再呼叫',
      playTimeoutSeconds: 15,
      playTimeoutMessage: '播放视频失败，请重启微信再呼叫',
      weakNetworkTimeout: 6,
      ringtone: 'https://imgs.hh-medic.com/icon/ring.mp3',
      evaluateTemplate: 1,
      enableChangeDoctor: true,
      enableComplain: true,
      enableInputEvaluate: false,
      localVideoStatus: 2,   //视频右上角本地视频的状态。-1:永远关闭,0:默认关闭，用户可开启,1:默认开启，用户可关闭,2:永远开启
      joinRoom: 0,
      inviteInVideo: 0,    //视频中显示邀请家人图标。0：隐藏；1：显示
      orderId:'',
      doctorId:'',
      //hh-personal属性
      personalModule: 'personal',
      //hh-addresslist属性
      enableDelete: true,
      //hh-addressedit属性
      editType: 'create',
      addressId: null,
      //hh-medicine属性
      drugOrderId: null,
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
      equityTitle: '会员权益',
      //其他属性
      hospitalId: null,
      ext: ''
    },
    _requestCheck: false
  },

  attached() {
    that = this;
    app = getApp();
  },
  methods: {
    paramRequestChange(newVal, oldVal, changedPath) {
      console.log('paramRequestChange', newVal)
      if (!newVal) return
      this.setData({ _request: Object.assign(this.data._request, newVal), _host: this._getHost() })
      if (!this.data._request.userToken && this.data._request.uuid && this.data._request.token) {
        this._getUserToken();
      } else {
        this._checkRequest();
      }
    },

    _getHost() {
      return hostUtil.getHost(this.data._request.profileName, this.data._request.subDomain)
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
            console.log('>>> _getUserToken failed!');
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
      if ('undefined' === this.data._request.sdkProductId ||
        'undefined' === this.data._request.userToken ||
        'undefined' === this.data._request.openId) {
        console.error('请勿将字符串“undefined”赋值给request参数的sdkProductId、userToken或openId', this.data._request)
        return;
      }
      console.log('%c 初始化组件:' + this.is, cStyle.info);
      switch (this.data._name) {
        case 'hh-im':
        case 'hh-bottom':
        case 'hh-calling':
        case 'hh-head':
        case 'hh-ehr':
        case 'hh-personal':
        case 'hh-my':
        case 'hh-addresslist':
        case 'hh-addresssearch':
        case 'hh-right':
        case 'hh-buyproduct':
        case 'hh-live':
          break;
        case 'hh-rtc':
        case 'hh-trtc':
        case 'hh-call':
          if (!this.data._request.dept &&
            (this.data._request.appointedDoctorId || this.data._request.appointedOrderId) &&
            !this.data._request.medicRecordId) {
            console.error('缺少必要参数:dept');
            return;
          }
          break;
        case 'hh-addressedit':
          if ('update' == this.data._request.editType && !this.data._request.addressId) {
            console.error('editType为update时，需传入addressId');
            return;
          }
          break;
        case 'hh-medicine':
          if (!this.data._request.drugOrderId) {
            console.error('缺少必要参数:drugOrderId');
            return;
          }
          break;
        default:
          return;
      }
      //console.log( '检查request参数完成');
      var sdkOptions = {
        _host: this.data._host,
        _sdkProductId: this.data._request.sdkProductId,
        _userToken: this.data._request.userToken,
        _openId: this.data._request.openId,
        _profileName: this.data._request.profileName,
        _subDomain: this.data._request.subDomain
      };
      getApp().globalData._hhSdkOptions = sdkOptions;
      this.setData({ _requestCheck: true })
      this._requestComplete();
    }
  }
})