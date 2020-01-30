module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var list = '安哥拉,+244;阿富汗,+93;阿尔巴尼亚,+355;阿尔及利亚,+213;安道尔共和国,+376;安圭拉岛,+1264;安提瓜和巴布达,+1268;阿根廷,+54;亚美尼亚,+374;阿森松,+247;澳大利亚,+61;奥地利,+43;阿塞拜疆,+994;巴哈马,+1242;巴林,+973;孟加拉国,+880;巴巴多斯,+1246;白俄罗斯,+375;比利时,+32;伯利兹,+501;贝宁,+229;百慕大群岛,+1441;玻利维亚,+591;博茨瓦纳,+267;巴西,+55;文莱,+673;保加利亚,+359;布基纳法索,+226;缅甸,+95;布隆迪,+257;喀麦隆,+237;加拿大,+1;开曼群岛,+1345;中非共和国,+236;乍得,+235;智利,+56;中国,+86;哥伦比亚,+57;刚果,+242;库克群岛,+682;哥斯达黎加,+506;古巴,+53;塞浦路斯,+357;捷克,+420;丹麦,+45;吉布提,+253;多米尼加共和国,+1890;厄瓜多尔,+593;埃及,+20;萨尔瓦多,+503;爱沙尼亚,+372;埃塞俄比亚,+251;斐济,+679;芬兰,+358;法国,+33;法属圭亚那,+594;加蓬,+241;冈比亚,+220;格鲁吉亚,+995;德国,+49;加纳,+233;直布罗陀,+350;希腊,+30;格林纳达,+1809;关岛,+1671;危地马拉,+502;几内亚,+224;圭亚那,+592;海地,+509;洪都拉斯,+504;香港,+852;匈牙利,+36;冰岛,+354;印度,+91;印度尼西亚,+62;伊朗,+98;伊拉克,+964;爱尔兰,+353;以色列,+972;意大利,+39;科特迪瓦,+225;牙买加,+1876;日本,+81;约旦,+962;柬埔寨,+855;哈萨克斯坦,+327;肯尼亚,+254;韩国,+82;科威特,+965;吉尔吉斯坦,+331;老挝,+856;拉脱维亚,+371;黎巴嫩,+961;莱索托,+266;利比里亚,+231;利比亚,+218;列支敦士登,+423;立陶宛,+370;卢森堡,+352;澳门,+853;马达加斯加,+261;马拉维,+265;马来西亚,+60;马尔代夫,+960;马里,+223;马耳他,+356;马里亚那群岛,+1670;马提尼克,+596;毛里求斯,+230;墨西哥,+52;摩尔多瓦,+373;摩纳哥,+377;蒙古,+976;蒙特塞拉特岛,+1664;摩洛哥,+212;莫桑比克,+258;纳米比亚,+264;瑙鲁,+674;尼泊尔,+977;荷属安的列斯,+599;荷兰,+31;新西兰,+64;尼加拉瓜,+505;尼日尔,+227;尼日利亚,+234;朝鲜,+850;挪威,+47;阿曼,+968;巴基斯坦,+92;巴拿马,+507;巴布亚新几内亚,+675;巴拉圭,+595;秘鲁,+51;菲律宾,+63;波兰,+48;法属玻利尼西亚,+689;葡萄牙,+351;波多黎各,+1787;卡塔尔,+974;留尼旺,+262;罗马尼亚,+40;俄罗斯,+7;圣卢西亚,+1758;圣文森特岛,+1784;东萨摩亚(美),+684;西萨摩亚,+685;圣马力诺,+378;圣多美和普林西比,+239;沙特阿拉伯,+966;塞内加尔,+221;塞舌尔,+248;塞拉利昂,+232;新加坡,+65;斯洛伐克,+421;斯洛文尼亚,+386;所罗门群岛,+677;索马里,+252;南非,+27;西班牙,+34;斯里兰卡,+94;圣卢西亚,+1758;圣文森特,+1784;苏丹,+249;苏里南,+597;斯威士兰,+268;瑞典,+46;瑞士,+41;叙利亚,+963;台湾省,+886;塔吉克斯坦,+992;坦桑尼亚,+255;泰国,+66;多哥,+228;汤加,+676;特立尼达和多巴哥,+1809;突尼斯,+216;土耳其,+90;土库曼斯坦,+993;乌干达,+256;乌克兰,+380;阿拉伯联合酋长国,+971;英国,+44;美国,+1;乌拉圭,+598;乌兹别克斯坦,+233;委内瑞拉,+58;越南,+84;也门,+967;南斯拉夫,+381;津巴布韦,+263;扎伊尔,+243;赞比亚,+260';
var nationList;

function convertCurrency(money) {
  //汉字的数字
  var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  //基本单位
  var cnIntRadice = new Array('', '拾', '佰', '仟');
  //对应整数部分扩展单位
  var cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  var cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  var cnInteger = '整';
  //整型完以后的单位
  var cnIntLast = '元';
  //最大处理的数字
  var maxNum = 999999999999999.9999;
  //金额整数部分
  var integerNum;
  //金额小数部分
  var decimalNum;
  //输出的中文金额字符串
  var chineseStr = '';
  //分离金额后用的数组，预定义
  var parts;
  if (money == '') {
    return '';
  }
  money = parseFloat(money);
  if (money >= maxNum) {
    //超出最大处理数字
    return '';
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  //转换为字符串
  money = money.toString();
  if (money.indexOf('.') == -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    var zeroCount = 0;
    var IntLen = integerNum.length;
    for (var i = 0; i < IntLen; i++) {
      var n = integerNum.substr(i, 1);
      var p = IntLen - i - 1;
      var q = p / 4;
      var m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        //归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  //小数部分
  if (decimalNum != '') {
    var decLen = decimalNum.length;
    for (var i = 0; i < decLen; i++) {
      var n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
}

function isInteger(obj) {
  return (obj | 0) === obj;
}

/**是否为手机号码 */
function isMobilePhone(phone) {
  /**
   * 支持13*，15*，16*，17*，18*，198和199号段
   */
  if (11 != phone.length) {
    return false;
  }
  var phoneReg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})||(17[0-9]{1})|(18[0-9]{1})|(19[89]{1}))+\d{8})$/;
  return phoneReg.test(phone);
}

/**是否为电子邮箱地址 */
function isEmail(email) {
  var emailReg = new RegExp(/^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
  return emailReg.test(email);
}

function getRequestParams(url) {
  var arr = new Array();
  url = decodeURIComponent(url);
  if (url.indexOf('?') >= 0) {
    url = url.substr(url.indexOf('?') + 1);
  } else {
    return arr;
  }

  var params = url.split('&');
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=');
    if (2 == param.length) {
      arr[param[0]] = param[1];
    }
  }
  return arr;
}

function getNationList() {
  if (!nationList) {
    initNationList();
  }
  return nationList;
}

function getNationCode(nation) {
  if (!nationList) {
    initNationList();
  }
  return nationList[nation];
}

function initNationList() {
  nationList = new Array();
  var arr = list.split(';');
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i].split(',');
    nationList[item[0]] = item[1];
  }
}

/** 输出格式化日志 */
function log(content) {
  console.log('[' + formatDate('yyyy-MM-dd hh:mm:ss.S') + '][HH_IM_DEMO] ' + content);
};

/** 格式化数字 */
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

/** 格式化数字到指定长度，不足前面补0 */
function formatNumber2(num, n) {
  return (Array(n).join(0) + num).slice(-n);
};

/** 格式化时间 */
function formatDate(fmt, d) {
  var date = new Date();
  if (d) {
    date = new Date(d);
  }
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": formatNumber2(date.getMilliseconds(), 3) //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return fmt;
};

function formatTimeLength(s) {
  var h = parseInt(s / 3600);
  var m1 = s % 3600;
  var m = parseInt(m1 / 60);
  s = m1 % 60;
  if (h > 0) {
    return formatNumber(h) + ':' + formatNumber(m) + ':' + formatNumber(s);
  } else {
    return formatNumber(m) + ':' + formatNumber(s);
  }
};

//对外公开接口
module.exports = {
  convertCurrency: convertCurrency,
  isInteger: isInteger,
  isMobilePhone: isMobilePhone,
  isEmail: isEmail,
  getRequestParams: getRequestParams,
  getNationList: getNationList,
  getNationCode: getNationCode,
  log: log,
  formatNumber: formatNumber,
  formatNumber2: formatNumber2,
  formatDate: formatDate,
  formatTimeLength: formatTimeLength
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getHost(profileName, subDomain) {
  var host = {};
  switch (profileName) {
    case 'prod':
      if (subDomain) {
        host.wmpHost = 'https://' + subDomain + '.hh-medic.com/wmp/';
        host.ehrHost = 'https://' + subDomain + '.hh-medic.com/ehrweb/';
        host.patHost = 'https://' + subDomain + '.hh-medic.com/patient_web/';
        host.wsServer = 'wss://' + subDomain + '.hh-medic.com/wmp/websocket';
      } else {
        host.wmpHost = 'https://wmp.hh-medic.com/wmp/';
        host.ehrHost = 'https://e.hh-medic.com/ehrweb/';
        host.patHost = 'https://sec.hh-medic.com/patient_web/';
        host.wsServer = 'wss://wmp.hh-medic.com/wmp/websocket';
      }
      break;
    case 'test':
      host.wmpHost = 'https://test.hh-medic.com/wmp/';
      host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
      host.patHost = 'https://test.hh-medic.com/patient_web/';
      host.wsServer = 'wss://test.hh-medic.com/wmp/websocket';
      break;
    case 'dev':
      host.wmpHost = 'http://192.168.8.180:8080/wmp/';
      host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
      host.patHost = 'https://test.hh-medic.com/patient_web/';
      host.wsServer = 'ws://192.168.8.180:8080/wmp/websocket';
      break;
    default:
      break;
  }
  return host;
}

module.exports = {
  getHost: getHost
};

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var common = __webpack_require__(0);
var hostUtil = __webpack_require__(1);
var eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {
    request: {
      type: Object,
      value: {},
      observer: function observer(newVal, oldVal, changedPath) {
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
      enableLiveShare: true, // 是否允许分享
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

  attached: function attached() {
    that = this;
    app = getApp();
  },

  methods: {
    propertyChanged: function propertyChanged(newVal, oldVal, changedPath) {
      if (!newVal) {
        return;
      }
      var _req = Object.assign(this.data._request, newVal);
      this.setData({
        _request: _req
      });

      var _host = this._getHost();
      this.setData({
        _host: _host
      });

      if (!this.data._request.userToken && this.data._request.uuid && this.data._request.token) {
        this._getUserToken();
      } else {
        this._checkRequest();
      }
    },
    _getHost: function _getHost() {
      return hostUtil.getHost(this.data._request.profileName, this.data._request.subDomain);
    },
    _getUserToken: function _getUserToken() {
      var url = this.data._host.wmpHost + 'im/getUserToken?sdkProductId=' + this.data._request.sdkProductId + '&uuid=' + this.data._request.uuid + '&token=' + this.data._request.token;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function success(res) {
          if (res && res.data && 200 == res.data.status) {
            var _req = that.data._request;
            _req.userToken = res.data.data;
            that.setData({
              _request: _req
            });
          } else {
            that._logError('初始化失败！请检查uuid和token参数');
            return;
          }
          that._checkRequest();
        }
      });
    },
    _checkRequest: function _checkRequest() {
      if (!this.data._request.sdkProductId || !this.data._request.userToken || !this.data._request.openId) {
        this._logError('缺少必要参数：sdkProductId、userToken或openId，无法使用组件:' + this.data._name);
        return;
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
          if (!this.data._request.dept && (this.data._request.appointedDoctorId || this.data._request.appointedOrderId) && !this.data._request.medicRecordId) {
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
});

/***/ })
/******/ ]);