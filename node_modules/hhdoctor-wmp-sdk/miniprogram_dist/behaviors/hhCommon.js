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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
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

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var common = __webpack_require__(0);
var eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},

  attached: function attached() {
    that = this;
    app = getApp();
  },

  methods: {
    propertyChanged: function propertyChanged(newVal, oldVal, changedPath) {},
    _logInfo: function _logInfo(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      //console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content, args);
    },
    _logError: function _logError(content) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      console.error('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content, args);
    },
    _ttt: function _ttt() {
      console.log(123);
    },
    _triggerEvent: function _triggerEvent(name, detail) {
      this.triggerEvent(name, detail, eventOption);
      //this.triggerEvent(name, detail, eventOption)
    },
    _getPublicRequestParams: function _getPublicRequestParams() {
      var params = 'profileName=' + this.data._request.profileName + '&subDomain=' + this.data._request.subDomain + '&sdkProductId=' + this.data._request.sdkProductId + '&userToken=' + this.data._request.userToken + '&openId=' + this.data._request.openId + '&source=wmpSdk' + '&version=' + this.data._sdkVersion + '&_=' + new Date().getTime();
      return params;
    },
    _appendUrlParams: function _appendUrlParams(url) {
      if (url.indexOf('?') >= 0) {
        url += '&';
      } else {
        url += '?';
      }
      url += '_=' + new Date().getTime() + '&source=wmpSdk';

      if (url.indexOf('openId=') < 0 && this.data._request.openId) {
        url += '&openId=' + this.data._request.openId;
      }
      if (url.indexOf('wmpVersion=') < 0 && getApp().globalData.wmpVersion) {
        url += '&wmpVersion=' + getApp().globalData.wmpVersion;
      }
      if (url.indexOf('sdkVersion=') < 0) {
        url += '&sdkVersion=' + this.data._sdkVersion;
      }
      if (url.indexOf('sdkProductId=') < 0 && this.data._request.sdkProductId) {
        url += '&sdkProductId=' + this.data._request.sdkProductId;
      }
      if (url.indexOf('wxAppId=') < 0 && getApp().globalData.wxAppId) {
        url += '&wxAppId=' + getApp().globalData.wxAppId;
      }
      return url;
    }
  }
});

/***/ })

/******/ });