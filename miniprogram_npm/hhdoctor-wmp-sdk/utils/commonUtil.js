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
/** 解析文本中的超链接 */
function findLinkFromText(text) {
  let linkArr = []
  let reg = /[http|https|wxapp]+:\/\/[\w|\-|_|.|~|!|\*|'|\(|\)|;|:|@|&|=|+|\$|,|\/|\?|#|\[|\]|%]*/g
  let link = reg.exec(text)
  while (link) {
    linkArr.push(link[0]);
    link = reg.exec(text)
  }
  let txtArr = text.split(reg)
  let arr = []
  for (let i = 0; i < txtArr.length; i++) {
    arr.push({ type: 'text', value: txtArr[i] })
    if (i < linkArr.length)
      arr.push({ type: 'link', value: linkArr[i], name: getLinkName(linkArr[i]) })
  }
  return arr
}
function getLinkName(link) {
  if (link.toLowerCase().startsWith('wxapp://')) return '点此打开'
  return '点此前往'
}

/**是否为手机号码 */
function isMobilePhone(phone) {
  /**
   * 支持13*，15*，16*，17*，18*，198和199号段
   */
  if (11 != phone.length) {
    return false;
  }
  var phoneReg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})||(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
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

/** 输出格式化日志 */
function log(content) {
  console.log('[' + formatDate('yyyy-MM-dd hh:mm:ss.S') + '][HH_IM_DEMO] ' + content);
};

/** 格式化数字 */
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
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
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
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

function phoneNumMask(phoneNum) {
  if (!phoneNum) return '';
  if (phoneNum.length <= 3) {
    return phoneNum.substr(0, 1) + getStrStars(phoneNum.length - 1);
  } else if (phoneNum.length <= 7) {
    return phoneNum.substr(0, 2) + getStrStars(phoneNum.length - 4) + phoneNum.substr(phoneNum.length - 2, 2);
  } else {
    return phoneNum.substr(0, 3) + getStrStars(phoneNum.length - 7) + phoneNum.substr(phoneNum.length - 4, 4);
  }
}
function getStrStars(count) {
  if (count <= 0) return '';
  let s = ''
  for (let i = 0; i < count; i++) {
    s += '*'
  }
  return s
}

function getCurrentPageUrl() {
  let pages = getCurrentPages()
  if (!pages || !pages.length) return ''
  return pages[0] && pages[0].route || ''
}

function getLogTagName() {
  if (this && this.is) return this.is
  let pages = getCurrentPages()
  if (!pages || !pages.length) return ''
  return pages[0] && pages[0].route || ''
}

//简易节流函数防双击 
function throttle(btn, wait) {
  let nowTime = Date.parse(new Date());
  let preTime = wx.getStorageSync(btn) || 0;
  let seconds = parseInt(nowTime - preTime)
  wx.setStorageSync(btn, nowTime);
  return seconds < (wait ? wait : 2000)
}

//对外公开接口
module.exports = {
  throttle,
  convertCurrency: convertCurrency,
  isInteger: isInteger,
  isMobilePhone: isMobilePhone,
  isEmail: isEmail,
  getRequestParams: getRequestParams,
  log: log,
  phoneNumMask,
  findLinkFromText,
  formatNumber: formatNumber,
  formatNumber2: formatNumber2,
  formatDate: formatDate,
  formatTimeLength: formatTimeLength,
  getCurrentPageUrl,
  getLogTagName
}