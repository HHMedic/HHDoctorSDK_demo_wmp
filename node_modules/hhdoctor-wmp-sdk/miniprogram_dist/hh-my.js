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
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

/***/ 1:
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
      host.wmpHost = 'http://10.1.0.99:8080/wmp/';
      host.ehrHost = 'http://test.hh-medic.com/ehrweb/';
      host.patHost = 'http://test.hh-medic.com/patient_web/';
      host.wsServer = 'ws://10.1.0.99:8080/wmp/websocket';
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

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var that;
Component({
  behaviors: [__webpack_require__(3)],
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-my',
    primeLevel: 'prime',
    showBeanTip: false,
    user: null,
    product: null,
    productDesc: '',
    vMoney: -1
  },
  lifetimes: {
    attached: function attached() {
      that = this;
    },
    ready: function ready() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 3000);
      var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete: function _requestComplete() {
      this._getProductInfo();
      if (this.data._request.autoAcl) {
        this._getUserAcl();
      }
    },
    _showBeanTip: function _showBeanTip() {
      this.setData({
        showBeanTip: true
      });
    },
    _hideBeanTip: function _hideBeanTip() {
      this.setData({
        showBeanTip: false
      });
    },

    // _viewRight() {
    //   var pageUrl = this.data.basePath + 'innerpages/right?' + this._getPublicRequestParams();
    //   wx.navigateTo({
    //     url: pageUrl,
    //   })
    // },
    _getUserAcl: function _getUserAcl() {
      var url = this._getHost().wmpHost + 'wmp/personalAcl?userToken=' + this.data._request.userToken + '&sdkProductId=' + this.data._request.sdkProductId + '&source=wmpSdk';
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function success(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            var _acl = Object.assign(that.data._request.userAcl, res.data.data);
            var _request = that.data._request;
            _request.userAcl = _acl;
            that.setData({
              _request: _request
            });
          }
        }
      });
    },
    _getProductInfo: function _getProductInfo() {
      var url = this._getHost().wmpHost + 'my/product' + '?userToken=' + this.data._request.userToken + '&sdkProductId=' + this.data._request.sdkProductId;

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function success(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              user: res.data.data.user,
              vMoney: 'undefined' != typeof res.data.data.vMoney ? res.data.data.vMoney : -1
            });
            if (res.data.data.product) {
              that.setData({
                productDesc: res.data.data.product.productStatusDescn
              });
              if ('normal' == res.data.data.product.productStatusEnum) {
                that.setData({
                  product: res.data.data.product,
                  primeLevel: res.data.data.product.canOrderExpert ? 'prime' : ''
                });
              }
            } else {
              that.setData({
                productDesc: '暂未开通会员'
              });
            }
          } else {}
        },
        complete: function complete() {
          wx.hideLoading();
        }
      });
    },
    _changePhone: function _changePhone() {
      wx.showModal({
        title: '',
        content: '请在首页联系您的助理，帮您修改手机号',
        showCancel: false,
        confirmText: '我知道了'
      });
    },
    _viewAbout: function _viewAbout() {
      var url = this._getHost().wmpHost + 'wmp/about?appId=' + this.data._request.sdkProductId;
      this._viewUrl(url);
    },
    _viewAddress: function _viewAddress() {
      //老版本地址管理
      // wx.navigateTo({
      //   url: this.data._request.addressPage + '?' + this._getPublicRequestParams(),
      // })
      //新版本地址管理
      this._viewAddressList();
    },
    _requestInvocie: function _requestInvocie() {
      var url = this._getHost().wmpHost + 'pay/list?' + this._getPublicRequestParams() + '&buyPage=' + encodeURIComponent(this.data.basePath + 'innerpages/buyProduct') + '&payPage=' + encodeURIComponent(this.data._request.payPage);
      this._viewUrl(url);
    },
    _viewInvoice: function _viewInvoice() {
      var url = this._getHost().wmpHost + 'invoice/list?' + this._getPublicRequestParams();
      this._viewUrl(url);
    },
    _userExpertService: function _userExpertService() {
      if (this.data._request.userAcl.expertServiceStatus) {
        wx.showModal({
          title: '提示',
          content: this.data._request.userAcl.expertServiceStatus,
          showCancel: false
        });
        return;
      }
      wx.showLoading({
        title: '处理中...'
      });
      var url = this._getHost().wmpHost + 'wmp/useExpertService?=' + this._getPublicRequestParams();
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function success(res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            wx.navigateBack({
              delta: 1
            });
          } else {
            wx.showModal({
              title: '错误',
              content: res.data.message,
              showCancel: false
            });
          }
        },
        complete: function complete() {
          wx.hideLoading();
        }
      });
    },
    _buyProduct: function _buyProduct() {
      var pageUrl = this.data.basePath + 'innerpages/buyProduct?' + this._getPublicRequestParams() + '&payPage=' + this.data._request.payPage;
      wx.navigateTo({
        url: pageUrl
      });
    },
    _logoutConfirm: function _logoutConfirm() {
      wx.showModal({
        title: '确认',
        content: '是否立即退出登录',
        success: function success(e) {
          if (e.confirm) {
            that._logout();
          }
        }
      });
    },
    _logout: function _logout() {
      var url = this._getHost().wmpHost + 'wmp/logoutWmp?=' + this._getPublicRequestParams();
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function success(res) {
          //if (res && res.data && 200 == res.data.status) {
          //成功
          //清理本地缓存
          if (getApp().globalData._hhim) {
            getApp().globalData._hhim.clearCache();
            if (getApp().globalData._hhim.loginStatus()) {
              getApp().globalData._hhim.logout();
            }
          }
          getApp().globalData._hhim = null;

          that._triggerEvent('logout', res.data.data);
          /*} else {
            wx.showModal({
              title: '错误',
              content: '暂时无法注销，请稍后再试',
              showCancel: false
            })
          }*/
        }
      });
    }
  }
});

/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**HH-MEDIC VideoDoctor IM SDK 1.0.0
 ***ALL RIGHTS RESERVED
 ***Author:HH-MYL
 ***注意：本文件不提交至github
 ***发布前需使用http://www.javascriptobfuscator.com/Javascript-Obfuscator.aspx或对应gui工具进行压缩混淆
 ***将压缩混淆后的文件进行发布
 */

//Private variables
var loginWithHisMsg = true;
var heartBeatInterval;
var imPhoto;
var doctorName, doctorUuid;
var connected = false,
    isLogin = false;

var _options = {
  debug: false,
  wsServer: 'wss://wmp.hh-medic.com/wmp/websocket',
  fileServer: 'https://wmp.hh-medic.com/wmp/im/upload/',
  sdkProductId: '',
  uuid: null,
  token: null,
  openId: null,
  wxAppId: null,
  userToken: null
};

var _asst = {
  uuid: null,
  name: null,
  photo: null
};

var _callbacks = {
  onMsg: null,
  onError: null,
  onClose: null,
  onHistory: null,
  onCallRequest: null,
  onHangupRequest: null,
  onTransferCall: null,
  onUpdateUrl: null,
  onCommand: null,
  login: null,
  sendMsg: [],
  addAttatch: null,
  preCall: null,
  call: null,
  hangup: null
};

var _cacheMsgs = {
  startTime: null,
  endTime: null,
  list: []
};

var socketTask;
var isPrecall = false;
var sendingMsg = [];

//Public methods
//初始化配置
//option.debug:布尔型,是否打开调试开关输出调试信息，默认false
//option.wsServer:字符型,websocket服务器地址
function init(option) {
  if (option) {
    if ('undefined' != typeof option.debug) {
      _options.debug = option.debug;
    }
    if ('undefined' != typeof option.wsServer) {
      _options.wsServer = option.wsServer;
    }
    if ('undefined' != typeof option.fileServer) {
      _options.fileServer = option.fileServer;
    }
  }
  log('init');
};

//登录
//function login(sdkProductId, uuid, token, openId, withHisMsg, callback) {
function login(sdkProductId, userToken, openId, wxAppId, withHisMsg, callback) {
  log('login');
  if ('undefined' != typeof withHisMsg) {
    loginWithHisMsg = withHisMsg;
  }
  if (callback) {
    _callbacks.login = callback;
  }
  _options.sdkProductId = sdkProductId;
  //_options.uuid = uuid;
  //_options.token = token;
  _options.userToken = userToken;
  _options.openId = openId;
  _options.wxAppId = wxAppId;
  connectToWss();
};

//登出
function logout() {
  log('logout');
  if (socketTask) {
    socketTask.close();
    socketTask = null;
  }
  wx.closeSocket();
};

//发送本地日志
function sendLog(logType, logContent) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var msg = {
    action: 'LOG_REQUEST',
    data: {
      type: logType,
      text: logContent
    }
  };
  try {
    sendMessage(JSON.stringify(msg));
  } catch (e) {}
};

function getHisMsg(loadMore) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var endTime = null;
  if (loadMore) {
    endTime = _cacheMsgs.startTime;
  }
  var msg = {
    action: 'HIS_REQUEST',
    data: {
      to: _asst.uuid,
      endTime: endTime
    }
  };
  try {
    sendMessage(JSON.stringify(msg));
  } catch (e) {}
}

//发送文本消息
function sendText(text, callback) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var id = 'sdk' + _options.sdkProductId + '_' + new Date().getTime();
  if (callback) {
    _callbacks.sendMsg[id] = callback;
  }
  var msg = {
    action: 'MSG_REQUEST',
    data: {
      id: id,
      type: 'text',
      text: text,
      to: _asst.uuid,
      from: _options.uuid
    }
  };

  var sendingText = {
    type: 'text',
    from: 'c',
    text: text,
    head: imPhoto,
    name: '',
    time: new Date().getTime()
  };
  sendingMsg[id] = sendingText;
  sendMessage(JSON.stringify(msg));
}

//发送图片消息，支持多张图片
function sendImages(files, callback) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  sendFile(files, 0, 'image', callback, null);
}

//发送音频消息
function sendAudio(file, duration, callback) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  sendFile([file], 0, 'audio', callback, duration);
}

//预呼叫
function preCall(dept, callback, toUuid, appointedDoctorId, appointedOrderId, mrId, patientId, hospitalId) {
  log('preCalling...');
  if (isPrecall) {
    return;
  }

  isPrecall = true;
  sendLog('1', 'preCall dept:' + dept);
  if (callback) {
    _callbacks.preCall = callback;
  }

  var msg = {
    action: 'PRECALL_REQUEST',
    data: {
      dept: dept,
      debug: false
    }
  };
  if (toUuid) {
    msg.data.to = toUuid;
  }
  if (appointedDoctorId) {
    msg.data.appointedDoctorId = appointedDoctorId;
  }
  if (appointedOrderId) {
    msg.data.appointedOrderId = appointedOrderId;
  }
  if (mrId) {
    msg.data.mrId = mrId;
  }
  if (patientId) {
    msg.data.patientId = patientId;
  }
  if (hospitalId) {
    msg.data.hospitalId = hospitalId;
  }

  if (connected) {
    //已连接
    sendMessage(JSON.stringify(msg));
  } else {
    //处理页面打开但是没有连接到wss服务器的情况，尝试重连
    connectToWss();
    setTimeout(function () {
      if (connected) {
        sendMessage(JSON.stringify(msg));
      } else {
        //连接失败
        var res = new Object();
        res.success = false;
        res.message = '网络不给力，请切换网络或稍后再试';
        _callbacks.preCall(res);
      }
    }, 500);
  }
}

//呼叫
function call(callback) {
  log('calling...');
  if (!doctorName || !doctorUuid) {
    log('calling return');
    return;
  }
  sendLog('1', 'call start');
  if (callback) {
    _callbacks.call = callback;
  }

  var msg = {
    action: 'CALL_REQUEST',
    data: {
      from: _options.uuid,
      to: doctorUuid,
      attach: {},
      pushcontent: '',
      debug: false
    }
  };
  sendMessage(JSON.stringify(msg));
}

/** 查询被叫信息 */
function callInfo() {
  var msg = {
    action: 'CALLINFO_REQUEST',
    data: {}
  };
  sendMessage(JSON.stringify(msg));
}

/** 呼叫响应 */
function callResponse(famOrderId, accept) {
  var msg = {
    action: 'CALL_RESPONSE',
    data: {
      orderId: famOrderId,
      accept: accept,
      from: _options.uuid
    }
  };
  sendMessage(JSON.stringify(msg));
}

//挂断视频
function hangup(callback, debug, hangupType, videoTime, hangupSource) {
  log('hangup...');
  if (!doctorName || !doctorUuid) {
    return;
  }
  sendLog('1', 'hangup(' + hangupSource + ')');
  if (callback) {
    _callbacks.hangup = callback;
  }
  _callbacks.call = null;
  var msg = {
    action: 'HANGUP_REQUEST',
    data: {
      from: _options.uuid,
      to: doctorUuid,
      attach: {},
      pushcontent: '',
      debug: debug,
      type: hangupType,
      videoTime: videoTime
    }
  };
  sendMessage(JSON.stringify(msg));
}

/** 回答问题 */
function feedback(orderId, questionId, answer) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var msg = {
    action: 'FEEDBACK_REQUEST',
    data: {
      from: _options.uuid,
      orderId: orderId,
      questionId: questionId,
      answer: answer
    }
  };
  sendMessage(JSON.stringify(msg));
}

/** 打分评价 */
function evaluate(orderId, value, text) {
  if (!isLogin) {
    if (_callbacks.onError) {
      _callbacks.onError('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var msg = {
    action: 'EVALUATE_REQUEST',
    data: {
      from: _options.uuid,
      orderId: orderId,
      value: value,
      text: text
    }
  };
  sendMessage(JSON.stringify(msg));
}

//Public events
//事件统一回调接口，目前支持的事件包括：
//msg:接收消息事件
//error:错误事件
//history:获取历史消息事件
function on(event, callback) {
  switch (event) {
    case 'msg':
      _callbacks.onMsg = callback;
      break;
    case 'error':
      _callbacks.onError = callback;
      break;
    case 'close':
      _callbacks.onClose = callback;
      break;
    case 'history':
      _callbacks.onHistory = callback;
      break;
    case 'call':
      _callbacks.onCallRequest = callback;
      break;
    case 'callinfo':
      _callbacks.onCallInfoCb = callback;
      break;
    case 'hangup':
      _callbacks.onHangupRequest = callback;
      break;
    case 'updateurl':
      _callbacks.onUpdateUrl = callback;
      break;
    case 'transfer':
      _callbacks.onTransferCall = callback;
      break;
    case 'command':
      _callbacks.onCommand = callback;
      break;
    default:
      break;
  }
};

//Private methods
//连接wss服务器
function connectToWss() {
  log('websocket conn...');
  try {
    //if (connected) wx.closeSocket();
    if (socketTask) socketTask.close();
  } catch (e) {
    log(e.toString());
  }
  connected = false;
  wx.onSocketOpen(function (res) {
    log('websocket open');
    connected = true;
    startLogin();
  });

  wx.onSocketMessage(function (res) {
    log('websocket recv:' + res.data);
    parseSocketMessage(res.data);
  });

  wx.onSocketError(function (res) {
    connected = false;
    log('websocket error');
    if (_callbacks.onError) {
      _callbacks.onError('与服务器连接出错，请检查');
    }
  });

  wx.onSocketClose(function (res) {
    connected = false;
    isLogin = false;
    log('websocket close');
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval);
    }
    if (_callbacks.onClose) {
      _callbacks.onClose('与服务器连接断开，请检查');
    }
  });

  socketTask = wx.connectSocket({
    url: _options.wsServer,
    fail: connectWsFailed
  });
};
//开始登录
function startLogin() {
  var msg = {
    action: 'LOGIN_REQUEST',
    data: {
      sdkProductId: _options.sdkProductId,
      userToken: _options.userToken,
      openId: _options.openId,
      wxAppId: _options.wxAppId,
      withHisMsg: loginWithHisMsg
    }
  };
  sendMessage(JSON.stringify(msg));
}
//连接websocket服务器失败回调处理
function connectWsFailed() {
  if (_callbacks.onError) {
    _callbacks.onError('无法与服务器连接，请检查');
  }
}

//发送消息
function sendMessage(message) {
  log('websocket send:' + message);
  if (!connected) {
    log('not connected');
    return;
  }
  if (socketTask) {
    socketTask.send({
      data: message
    });
  } else {
    log('socketTask is null');
  }
  /*wx.sendSocketMessage({
    data: message
  })*/
};

//发送文件
function sendFile(files, index, fileType, callback, duration) {
  if (index >= files.length) {
    log('All file has uploaded');
    return;
  }
  var id = files[index];
  if (callback) {
    _callbacks.sendMsg[id] = callback;
  }

  var sendingFile = {
    type: fileType,
    from: 'c',
    text: '',
    url: files[index],
    thumbnail: files[index],
    dur: duration,
    head: imPhoto,
    name: '',
    time: new Date().getTime()
  };

  sendingMsg[id] = sendingFile;

  getSendFileInfo(files[index], fileType, function (resFile) {
    wx.uploadFile({
      url: _options.fileServer,
      filePath: files[index],
      name: 'uploadFile',
      formData: {
        'sdkProductId': _options.sdkProductId,
        'account': _options.uuid,
        'token': _options.token,
        'fileType': fileType
      },
      success: function success(res) {
        var data = JSON.parse(res.data);
        if (200 == data.statusCode) {
          var fileUrl = data.data;
          log('upload file url:' + fileUrl);
          var msg = {
            action: 'MSG_REQUEST',
            data: {
              id: id,
              type: fileType,
              url: fileUrl,
              size: resFile.size,
              digest: resFile.digest,
              height: resFile.height,
              width: resFile.width,
              dur: duration,
              to: _asst.uuid,
              from: _options.uuid
            }
          };
          sendMessage(JSON.stringify(msg));
          sendFile(files, index + 1, fileType, callback, duration);
        }
      }
    });
  }, function () {
    if (_callbacks.onError) {
      _callbacks.onError('文件上传失败');
    }
  });
}

//上传文件
function uploadFile(file, callback) {
  wx.uploadFile({
    url: _options.fileServer,
    filePath: file,
    name: 'uploadFile',
    formData: {
      'sdkProductId': _options.sdkProductId,
      'account': _options.uuid,
      'token': _options.token
    },
    success: function success(res) {
      if (callback) {
        callback(res.data);
      }
    },
    fail: function fail() {
      if (callback) {
        callback({
          statusCode: 400,
          status: 400
        });
      }
    }
  });
}

//添加附件
function addAttatch(url, callback) {
  console.log('addAttatch');
  if (callback) {
    _callbacks.addAttatch = callback;
  }
  var msg = {
    action: 'ATTATCH_REQUEST',
    data: {
      type: 'attatch',
      to: _asst.uuid,
      from: _options.uuid,
      url: url
    }
  };
  sendMessage(JSON.stringify(msg));
}

//切换通话模式，音频/视频
function switchMode(mode) {
  switch (mode) {
    case 'AUDIO':
      doSwitchMode('SWITCH_TO_AUDIO');
      break;
    case 'VIDEO':
      doSwitchMode('SWITCH_TO_VIDEO');
      break;
    default:
      break;
  }
}

//切换通话模式，音频/视频
function doSwitchMode(mode) {
  sendLog('1', 'switch mode:' + mode);
  var msg = {
    action: 'SWITCHMODE_REQUEST',
    data: {
      type: mode,
      from: _options.uuid,
      to: doctorUuid,
      attach: {},
      pushcontent: ''
    }
  };
  sendMessage(JSON.stringify(msg));
}

//获取待发送文件的信息
function getSendFileInfo(file, fileType, _success, _fail) {
  wx.getFileInfo({
    filePath: file,
    digestAlgorithm: 'md5',
    success: function success(fileResult) {
      if ('image' == fileType) {
        wx.getImageInfo({
          src: file,
          success: function success(imageResult) {
            if (_success) {
              var res = {
                size: fileResult.size,
                digest: fileResult.digest,
                height: imageResult.height,
                width: imageResult.width
              };
              _success(res);
            }
          },
          fail: function fail() {
            if (_fail) {
              _fail('getSendFileInfo fail');
            }
          }
        });
      } else {
        var res = {
          size: fileResult.size,
          digest: fileResult.digest,
          height: 0,
          width: 0
        };
        _success(res);
      }
    },
    fail: function fail() {
      if (_fail) {
        _fail('getSendFileInfo fail');
      }
    }
  });
}

//解析收到的消息内容并进行处理
function parseSocketMessage(data) {
  var msg = JSON.parse(data);
  switch (msg.action.toUpperCase().trim()) {
    case 'LOGIN_RESPONSE':
      parseLoginResponse(msg);
      break;
    case 'MSG_RESPONSE':
      parseMsgResponse(msg);
      break;
    case 'ATTATCH_REQUEST':
      parseAttatchResponse(msg);
      break;
    case 'MSG_RECEIVE':
      parseMsgReceive(msg);
      break;
    case 'HIS_RECEIVE':
      parseHistory(msg);
      break;
    case 'ERR_RECEIVE':
      parseErrorReceive(msg);
      break;
    case 'PRECALL_RESPONSE':
      parsePreCallResponse(msg);
      break;
    case 'HANGUP_RESPONSE':
      parseHangupResponse(msg);
      break;
    case 'CALL_REQUEST':
      if (_callbacks.onCallRequest) {
        _callbacks.onCallRequest(msg);
      }
      break;
    case 'CALLINFO_RESPONSE':
      parseCallInfoResponse(msg);
      break;
    case 'CALL_RESPONSE':
      sendLog('1', 'call response:' + data);
      if (_callbacks.call) {
        _callbacks.call(msg);
      }
      if (0 == msg.data && _callbacks.onHangupRequest) {
        _callbacks.onHangupRequest();
      }
      break;
    case 'HANGUP_REQUEST':
      sendLog('1', 'hangup request:' + data);
      if (_callbacks.onHangupRequest) {
        _callbacks.onHangupRequest(msg);
      }
      break;
    case 'UPDATE_URL':
      if (_callbacks.onUpdateUrl) {
        _callbacks.onUpdateUrl(msg);
      }
      break;
    case 'CALL_TRANSFER':
      sendLog('1', 'call transfer:' + data);
      parseTransfer(msg);
      break;
    case 'COMMAND_REQUEST':
      sendLog('1', 'command:' + data);
      parseCommand(msg);
      break;
    default:
      break;
  }
}

function parseCommand(msg) {
  if (_callbacks.onCommand) {
    _callbacks.onCommand(msg.data);
  }
}

//解析登录响应消息
function parseLoginResponse(msg) {

  if (!msg.data.login) {
    log('login fail');
    if (_callbacks.login) {
      _callbacks.login(msg.data.login);
    }
    if (_callbacks.onError) {
      console.error('登录失败!' + msg.data.message);
      _callbacks.onError('登录失败!' + msg.data.message);
    }
    isLogin = false;
    return;
  }
  //登录成功
  log('login success');
  getCacheMsgs();
  _options.uuid = msg.data.uuid;
  imPhoto = msg.data.photo;
  _asst.uuid = msg.data.asstAccount;
  _asst.name = msg.data.asstName;
  _asst.photo = msg.data.asstPhoto;
  isLogin = true;
  if (_callbacks.login) {
    _callbacks.login(msg.data.login);
  }
  heartbeat();
}
//解析发送消息响应消息
function parseMsgResponse(msg) {
  var id = msg.data.id;
  //添加到消息队列
  if (msg.data.success && sendingMsg[id] && _callbacks.onMsg) {
    _callbacks.onMsg(sendingMsg[id]);
  }
  //添加到缓存
  if (msg.data.success && sendingMsg[id]) {
    var msgData = sendingMsg[id];
    if (msg.data.msgId) {
      msgData.id = msg.data.msgId;
    }
    if (!existMsg(msgData.id)) {
      _cacheMsgs.list.push(msgData);
      setCacheMsgs();
    }
  }
  //发送完成回调
  if (_callbacks.sendMsg[id]) {
    var allDone = 1 == Object.keys(sendingMsg).length;
    msg.data.allDone = allDone;
    _callbacks.sendMsg[id](msg.data);
    delete sendingMsg[id];
  }
}
//解析服务器推送的错误消息
function parseErrorReceive(msg) {
  if (_callbacks.onError) {
    _callbacks.onError(msg.message);
  }
}
//解析服务器推送的实时消息
function parseMsgReceive(msg) {
  var _data;

  var data;
  switch (msg.data.msgType) {
    case 'PICTURE':
      //图片消息
      var attach = JSON.parse(msg.data.attach);
      data = {
        id: msg.data.msgidServer,
        type: 'image',
        from: 'd',
        text: '',
        url: attach.url,
        thumbnail: attach.url + '?x-oss-process=image/resize,m_fixed,w_200',
        head: _asst.photo,
        name: _asst.name,
        time: msg.data.msgTimestamp
      };
      break;
    case 'AUDIO':
      //音频消息
      var attach = JSON.parse(msg.data.attach);
      data = {
        id: msg.data.msgidServer,
        type: 'audio',
        from: 'd',
        text: '',
        url: getAudioMsgUrl(attach.ext, msg.data.fromAccount, msg.data.msgidServer, attach.url),
        dur: attach.dur,
        head: _asst.photo,
        name: _asst.name,
        time: msg.data.msgTimestamp
      };
      break;
    case 'CARD':
      //卡片消息
      var attach = JSON.parse(msg.data.attach);
      var content = JSON.parse(attach.content);
      if ('summaryByFam' != content.command && 'buyDrugInformation' != content.command && 'buyService' != content.command && 'commandProductTips' != content.command) {
        return;
      }

      data = (_data = {
        id: msg.data.msgidServer,
        from: 'd',
        type: 'card'
      }, _data['from'] = attach.talkUuid, _data.head = attach.talkUserPic, _data.name = attach.talkName, _data.time = attach.createTime, _data.patient = attach.patientUuid, _data.body = attach, _data.bodyContent = content, _data);
      break;
    default:
      //默认是文本
      data = {
        id: msg.data.msgidServer,
        type: 'text',
        from: 'd',
        text: msg.data.body,
        head: _asst.photo,
        name: _asst.name,
        time: msg.data.msgTimestamp
      };
      break;
  }
  if (!existMsg(data.id)) {
    _cacheMsgs.list.push(data);
    setCacheMsgs();
  }
  if (_callbacks.onMsg) {
    _callbacks.onMsg(data);
  }
}

//解析服务器推送的历史消息
function parseHistory(msgHis) {
  if (!msgHis.data) return;
  if (0 >= msgHis.data.length) return;
  var msgs = [];
  for (var i = 0; i < msgHis.data.length; i++) {
    var msg = msgHis.data[i];

    var from = msg.from == _options.uuid ? 'c' : 'd';
    var head = msg.from == _options.uuid ? imPhoto : _asst.photo;
    var name = msg.from == _options.uuid ? '' : _asst.name;
    switch (msg.type) {
      case 0:
        //文本消息
        msgs.push({
          id: msg.msgid,
          type: 'text',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          text: msg.body.msg
        });
        break;
      case 1:
        //图片消息
        msgs.push({
          id: msg.msgid,
          type: 'image',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          url: msg.body.url,
          thumbnail: msg.body.url + '?x-oss-process=image/resize,m_fixed,w_200'
        });
        break;
      case 2:
        //音频消息
        msgs.push({
          id: msg.msgid,
          type: 'audio',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          url: getAudioMsgUrl(msg.body.ext, msg.from, msg.msgid, msg.body.url),
          dur: msg.body.dur
        });
        break;
      case 9999:
        //卡片消息
        var content = JSON.parse(msg.body.content);
        if ('summaryByFam' == content.command || 'buyDrugInformation' == content.command || 'buyService' == content.command || 'commandProductTips' == content.command) {
          msgs.push({
            id: msg.msgid,
            type: 'card',
            from: msg.from,
            head: msg.body.talkUserPic,
            name: msg.body.talkName,
            patient: msg.body.patientUuid,
            time: msg.sendtime,
            body: msg.body,
            bodyContent: content
          });
        }
        break;
      default:
        break;
    }
  }

  for (var i = 0; i < msgs.length; i++) {
    if (!existMsg(msgs[i].id)) {
      _cacheMsgs.list.push(msgs[i]);
    }
  }
  setCacheMsgs();
  getCacheMsgs();
  if (_callbacks.onHistory) {
    _callbacks.onHistory(_cacheMsgs.list);
  }
  // if (_callbacks.onHistory) {
  //   _callbacks.onHistory(msgs);
  // }
}

function clearCache() {
  _cacheMsgs = {
    startTime: null,
    endTime: null,
    list: []
  };
  if (_options && _options.uuid) {
    var key = 'msgCache_' + _options.uuid;
    wx.removeStorageSync(key);
  } else {
    wx.clearStorage();
  }
}

function getCacheMsgs() {
  var key = 'msgCache_' + _options.uuid;
  var value = wx.getStorageSync(key);
  if (value) {
    value = JSON.parse(value);
    _cacheMsgs.list = value;
  }

  _cacheMsgs.list.sort(sortMsg);
}

function setCacheMsgs() {
  if (!_cacheMsgs.list || 0 == _cacheMsgs.list.length) {
    return;
  }
  var key = 'msgCache_' + _options.uuid;
  _cacheMsgs.list.sort(sortMsg);
  _cacheMsgs.startTime = _cacheMsgs.list[0].time;
  _cacheMsgs.endTime = _cacheMsgs.list[_cacheMsgs.list.length - 1].time;

  wx.setStorage({
    key: key,
    data: JSON.stringify(_cacheMsgs.list),
    success: function success() {},
    fail: function fail(e) {
      log('setCacheMsgs fail');
    }
  });
}

function sortMsg(a, b) {
  return a.time - b.time;
}

function existMsg(id) {
  var test = function test(item) {
    return parseInt(item.id) == parseInt(id);
  };
  var exist = _cacheMsgs.list.some(test);
  return exist;
}

//获取音频类消息的实际音频文件地址
function getAudioMsgUrl(ext, from, msgId, url) {
  if ('amr' == ext) {
    url = 'https://imgfamily.hh-medic.com/family/' + from + '/audio/' + msgId + '.aac';
  }
  return url;
}

//解析添加附件响应消息
function parseAttatchResponse(msg) {
  if (_callbacks.addAttatch) {
    _callbacks.addAttatch(msg.data);
  }
}

//解析预呼叫消息
function parsePreCallResponse(msg) {
  isPrecall = false;
  if (msg.data && _callbacks.preCall) {
    if (msg.data.success) {
      //已分配

      doctorName = msg.data.doctor.name;
      if (msg.data.destUuid) {
        doctorUuid = msg.data.destUuid;
      } else {
        doctorUuid = msg.data.doctor.login.uuid;
      }
      //doctorUuid = msg.data.doctor.login.uuid;
    } else {
      //分配失败
      doctorName = '';
      doctorUuid = null;
    }
    _callbacks.preCall(msg.data);
  }
}

//解析转呼消息
function parseTransfer(msg) {
  doctorName = msg.data.name;
  doctorUuid = msg.data.dUuid;

  if (_callbacks.onTransferCall) {
    _callbacks.onTransferCall(msg);
  }
}

//解析被叫信息
function parseCallInfoResponse(msg) {
  if (msg.data) {
    if (msg.data.doctorUuid) {
      //destUuid = msg.data.doctorUuid;
      doctorUuid = msg.data.doctorUuid;
    }
    if (msg.data.doctor.name) {
      //destName = msg.data.doctor.name;
      doctorName = msg.data.doctor.name;
    }
  }
  if (_callbacks.onCallInfoCb) {
    _callbacks.onCallInfoCb(msg.data);
  }
}

//解析挂机响应消息
function parseHangupResponse(msg) {
  /*if (200 == msg.data.status && _callbacks.hangup) {
    doctorName = '';
    doctorUuid = null;
    _callbacks.hangup(true, msg.data.data);
  }*/
  doctorName = '';
  doctorUuid = null;
  if (_callbacks.hangup) _callbacks.hangup(true, msg.data.data);
}

//输出日志
function log(content) {
  if (_options.debug) {
    console.log('[' + formatTime() + '][HH_IM_SDK] ' + content);
  }
};

//格式化日期时间
function formatTime(date) {
  if (!date) {
    date = new Date();
  }
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var mSecond = date.getMilliseconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':') + '.' + mSecond;
};

//格式化数字
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

//websocket心跳，防止与服务器断开连接
function heartbeat() {
  if (!connected) {
    return;
  }
  if (heartBeatInterval) {
    clearInterval(heartBeatInterval);
  }
  heartBeatInterval = setInterval(function () {
    var msg = {
      action: 'HEARTBEAT_REQUEST'
    };
    sendMessage(JSON.stringify(msg));
  }, 10000);
}

function loginStatus() {
  return isLogin;
}

//对外公开接口
module.exports = {
  init: init,
  login: login,
  logout: logout,
  getHisMsg: getHisMsg,
  sendLog: sendLog,
  sendText: sendText,
  sendImages: sendImages,
  sendAudio: sendAudio,
  uploadFile: uploadFile,
  addAttatch: addAttatch,
  switchMode: switchMode,
  preCall: preCall,
  call: call,
  callInfo: callInfo,
  callResponse: callResponse,
  hangup: hangup,
  feedback: feedback,
  evaluate: evaluate,
  on: on,
  loginStatus: loginStatus,
  clearCache: clearCache
};

/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var common = __webpack_require__(0);
//var hhim = require('./utils/HH_IM_SDK_DEV.js');
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
    _sdkVersion: '1.0.6',
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
      ehrPage: null,
      personalPage: '',
      personalIconVisible: true,
      medicinePage: null,
      addressPage: '',
      payPage: '',
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
      playTimeoutSeconds: 10,
      playTimeoutMessage: '播放视频失败，请重启微信再呼叫',
      weakNetworkTimeout: 6,
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
        showProductRight: true //查看权益
      },
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
    _logInfo: function _logInfo(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);
    },
    _logError: function _logError(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      console.error('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);
    },
    _triggerEvent: function _triggerEvent(name, detail) {
      this.triggerEvent(name, detail, eventOption);
      //this.triggerEvent(name, detail, eventOption)
    },
    _getUserToken: function _getUserToken() {
      var url = this.data._host.wmpHost + 'im/getUserToken?sdkProductId=' + this.data._request.sdkProductId + '&uuid=' + this.data._request.uuid + '&token=' + this.data._request.token;
      console.log(url);
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
            that._logInfo('>>>>>>_getUserToken failed!');
          }
          that._checkRequest();
        }
      });
    },
    _checkRequest: function _checkRequest() {
      if (!this.data._request.sdkProductId || !this.data._request.userToken || !this.data._request.openId) {
        return;
      }
      //this._logInfo('当前组件:' + this.data._name);
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
      this._logInfo('检查request参数完成');
      var sdkOptions = {
        _host: this.data._host
      };
      getApp().globalData._hhSdkOptions = sdkOptions;

      this._requestComplete();
    },
    _getPublicRequestParams: function _getPublicRequestParams() {
      var params = 'profileName=' + this.data._request.profileName + '&subDomain=' + this.data._request.subDomain + '&sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      return params;
    },
    _initHhImSdk: function _initHhImSdk(requestHis, hhImCallbacks, initCallback) {
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
          });
        }
        return;
      }

      this._logInfo(this.data._name + '初始化...');
      var hhim = __webpack_require__(2);
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
      hhim.login(this.data._request.sdkProductId, this.data._request.userToken, this.data._request.openId, account.miniProgram.appId, requestHis, function (res) {
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
            });
          }
        } else {
          //登录失败
          that._logError('登录失败，请检查request中的公共参数，注意区分测试、生产环境');
          if (initCallback) {
            initCallback({
              status: 400
            });
          }
        }
      });
    },
    _sendLog: function _sendLog(logType, logContent) {
      var im = getApp().globalData._hhim;
      if (!im || !im.loginStatus()) {
        return;
      }
      im.sendLog(logType, logContent);
    },
    _viewMedicine: function _viewMedicine(drugOrderId, redirectPage) {
      getApp().globalData._hhSdkOptions.drugOrderId = drugOrderId;
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;

      var vParam = this.data._host.patHost + 'drug/order.html?' + 'drugOrderId=' + drugOrderId + '&sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&payPage=' + encodeURIComponent(this.data.basePath + 'innerpages/pay') + '&redirectPage=' + encodeURIComponent(redirectPage ? redirectPage : '/pages/newIndex/newIndex') + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      var pageUrl = this.data.basePath + 'innerpages/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewMedicineOrderList: function _viewMedicineOrderList(redirectPage) {
      getApp().globalData._hhSdkOptions.redirectPage = redirectPage;

      var url = this.data._host.patHost + 'drug/order-list.html?' + 'sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      this._viewUrl(url);
    },
    _viewAddressList: function _viewAddressList() {
      var url = this.data._host.patHost + 'drug/addr-list.html?' + 'sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      this._viewUrl(url);
    },
    _viewPersonal: function _viewPersonal(personalModule) {
      var vParam = this.data._host.wmpHost + 'view/?' + 'module=' + (personalModule ? personalModule : this.data._request.personalModule) + '&appId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion;

      var pageUrl = this.data.basePath + 'innerpages/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewRight: function _viewRight() {
      var pageUrl = this.data.basePath + 'innerpages/right?' + this._getPublicRequestParams();
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewEhr: function _viewEhr(options) {
      var _options = Object.assign({
        viewModule: 'memberList',
        addMember: true,
        patient: null,
        medicRecordId: null,
        appointedDoctorId: null,
        appointedOrderId: null
      }, options);

      var vParam = 'module=' + _options.viewModule + '&appId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId;

      if (_options.appointedOrderId) {
        vParam += '&orderId=' + _options.appointedOrderId;
      }
      if (_options.appointedDoctorId) {
        vParam += '&doctorId=' + _options.appointedDoctorId;
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

      var pageUrl = this.data.basePath + 'innerpages/view?url=' + encodeURIComponent(s);
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewBeanList: function _viewBeanList() {
      var vParam = this.data._host.patHost + 'drug/account.html?' + 'sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      var pageUrl = this.data.basePath + 'innerpages/view?url=' + encodeURIComponent(vParam);
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewUrl: function _viewUrl(url) {
      console.log(url);
      var pageUrl = this.data.basePath + 'innerpages/view?url=' + encodeURIComponent(url);
      wx.navigateTo({
        url: pageUrl
      });
    },
    _buyProduct: function _buyProduct(productId) {
      if (!this.data._request.payPage) {
        return;
      }
      var pageUrl = this.data._request.payPage + '?' + this._getPublicRequestParams() + '&name=购买套餐&price=9999&pid=' + productId;
      wx.navigateTo({
        url: pageUrl
      });
    },
    _viewActiveCode: function _viewActiveCode() {
      var url = this.data._host.wmpHost + 'wmp/activationCode?' + 'sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      this._viewUrl(url);
    }
  }
});

/***/ })

/******/ });