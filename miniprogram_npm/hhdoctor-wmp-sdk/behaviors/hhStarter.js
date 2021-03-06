const common = require('../utils/commonUtil.js');
const hostUtil = require('../utils/hostUtil.js');
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
      medicinePage: null,
      addressPage: '',
      payPage: '',
      serviceType: 'asst',
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
      //hh-live属性
      enableInputComment: true, //是否允许输入评论
      enableLiveShare: false, // 是否允许分享
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

    _getUserToken() {
      var url = this.data._host.wmpHost +
        'im/getUserToken?sdkProductId=' + this.data._request.sdkProductId +
        '&uuid=' + this.data._request.uuid +
        '&token=' + this.data._request.token;
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
            that._logError('初始化失败！请检查uuid和token参数');
            return;
          }
          that._checkRequest();
        }
      })
    },

    _checkRequest() {
      if (!this.data._request.sdkProductId ||
        !this.data._request.userToken ||
        !this.data._request.openId) {
        this._logError('缺少必要参数：sdkProductId、userToken或openId，无法使用组件:' + this.data._name);
        return;
      }
      if ('string' == typeof(this.data._request.enableLiveShare)) {
        this.setData({
          "_request.enableLiveShare": 'true' == this.data._request.enableLiveShare
        })
      }
      switch (this.data._name) {
        case 'hh-im':
        case 'hh-head':
        case 'hh-ehr':
        case 'hh-personal':
        case 'hh-my':
        case 'hh-addresslist':
        case 'hh-addresssearch':
        case 'hh-right':
        case 'hh-buyproduct':
        case 'hh-sdkcontext':
        case 'hh-live':
          break;
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
      var sdkOptions = {
        _host: this.data._host,
        _sdkProductId: this.data._request.sdkProductId,
        _userToken: this.data._request.userToken,
        _openId: this.data._request.openId,
        _profileName: this.data._request.profileName,
        _subDomain: this.data._request.subDomain
      };
      this._logInfo('检查request参数完成,sdkOptions:', sdkOptions);
      getApp().globalData._hhSdkOptions = sdkOptions;

      this._requestComplete();
    }
  }
})