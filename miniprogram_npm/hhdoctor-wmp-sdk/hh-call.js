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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Behavior({
  behaviors: [],
  properties: {
    profileName: {
      type: String,
      value: 'prod'
    },

    sdkProductId: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    appKey: {
      type: String,
      value: ''
    },
    userUuid: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    userToken: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    },
    openId: {
      type: String,
      observer: function observer(newVal, oldVal, changedPath) {
        this.propertyChanged(newVal, oldVal, changedPath);
      }
    }
  },
  data: {},
  attached: function attached() {},

  methods: {
    propertyChanged: function propertyChanged(newVal, oldVal, changedPath) {},
    getHost: function getHost() {
      //wsServer: 'wss://wmp.hh-medic.com/wmp/websocket',
      //fileServer: 'https://dev.hh-medic.com/miniprogramweb_master/wmp/im/upload/'
      var host = {};
      switch (this.data.profileName) {
        case 'prod':
          host.wmpHost = 'https://wmp.hh-medic.com/wmp/';
          host.ehrHost = 'https://e.hh-medic.com/ehrweb/';
          host.wsServer = 'wss://wmp.hh-medic.com/wmp/websocket';
          break;
        case 'test':
          host.wmpHost = 'https://test.hh-medic.com/wmp/';
          host.ehrHost = 'https://test.hh-medic.com/ehrweb/';
          host.wsServer = 'wss://test.hh-medic.com/wmp/websocket';
          break;
        default:
          break;
      }
      return host;
    }
  }
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**HH-MEDIC VideoDoctor IM SDK 1.0.0
 ***ALL RIGHTS RESERVED
 ***Author:HH-MYL
 */

//Private variables
var debug = false;
var wsServer = 'wss://wmp.hh-medic.com/wmp/websocket';
var fileServer = 'https://wmp.hh-medic.com/wmp/im/upload/';
var loginWithHisMsg = true;
var heartBeatInterval;
var appid, appkey, imAccount, imToken, imPhoto;
var asstAccount, asstName, asstPhoto;
var destName, destUuid;
var isLogin = false;
var onMsgCallback, onErrorCallback, onHistoryCallback, onCallRequestCallback, onHangupRequestCallback;
var onUpdateUrlCb, onTransferCallCb, onCallInfoCb;
var preCallCallback, callCallback, hangupCallback;
var sendMsgCallback = [],
    addAttatchCallback;
var socketTask;
var isPrecall = false;
var isLogging = false;

//Public methods
//初始化配置
//option.debug:布尔型,是否打开调试开关输出调试信息，默认false
//option.wsServer:字符型,websocket服务器地址
function init(option) {
  if (option) {
    if ('undefined' != typeof option.debug) {
      debug = option.debug;
    }
    if ('undefined' != typeof option.wsServer) {
      wsServer = option.wsServer;
    }
    if ('undefined' != typeof option.fileServer) {
      fileServer = option.fileServer;
    }
  }
  log('init');
};

//使用appkey和用户账户登录
function login(appId, appKey, account, token, withHisMsg) {
  log('login');
  if ('undefined' != typeof withHisMsg) {
    loginWithHisMsg = withHisMsg;
  }
  appid = appId;
  appkey = appKey;
  imAccount = account;
  imToken = token;
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
    if (onErrorCallback) {
      onErrorCallback('尚未登录或登录失败，请先调用login()方法');
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
  sendMessage(JSON.stringify(msg));
};

//发送文本消息
function sendText(text, callback) {
  if (!isLogin) {
    if (onErrorCallback) {
      onErrorCallback('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var id = appKey + '_' + new Date().getTime();
  if (callback) {
    sendMsgCallback[id] = callback;
  }
  var msg = {
    action: 'MSG_REQUEST',
    data: {
      id: id,
      type: 'text',
      text: text,
      to: asstAccount,
      from: imAccount
    }
  };
  sendMessage(JSON.stringify(msg));
}

//发送图片消息，支持多张图片
function sendImages(files, callback) {
  if (!isLogin) {
    if (onErrorCallback) {
      onErrorCallback('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }

  sendFile(files, 0, 'image', callback);
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
    preCallCallback = callback;
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

  if (isConnected()) {
    //已连接
    sendMessage(JSON.stringify(msg));
  } else {
    //处理页面打开但是没有连接到wss服务器的情况，尝试重连
    connectToWss();
    setTimeout(function () {
      if (isConnected()) {
        sendMessage(JSON.stringify(msg));
      } else {
        //连接失败
        var res = new Object();
        res.success = false;
        res.message = 'connectToWss连接到服务器失败';
        preCallCallback(res);
      }
    }, 500);
  }
}

//呼叫
function call(callback, debug) {
  log('calling...');
  if (!destName || !destUuid) {
    log('calling return');
    return;
  }
  sendLog('1', 'call start');
  if (callback) {
    callCallback = callback;
  }
  if (debug) {
    log('calling debug return');
    return;
  }
  var msg = {
    action: 'CALL_REQUEST',
    data: {
      from: imAccount,
      to: destUuid,
      attach: {},
      pushcontent: '',
      debug: debug
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
      from: imAccount
    }
  };
  sendMessage(JSON.stringify(msg));
}

//挂断视频
function hangup(callback, debug, hangupType, videoTime) {
  log('hangup...');
  if (!destName || !destUuid) {
    return;
  }
  sendLog('1', 'hangup');
  if (callback) {
    hangupCallback = callback;
  }
  callCallback = null;
  var msg = {
    action: 'HANGUP_REQUEST',
    data: {
      from: imAccount,
      to: destUuid,
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
    if (onErrorCallback) {
      onErrorCallback('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var msg = {
    action: 'FEEDBACK_REQUEST',
    data: {
      from: imAccount,
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
    if (onErrorCallback) {
      onErrorCallback('尚未登录或登录失败，请先调用login()方法');
    }
    return;
  }
  var msg = {
    action: 'EVALUATE_REQUEST',
    data: {
      from: imAccount,
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
      onMsgCallback = callback;
      break;
    case 'error':
      onErrorCallback = callback;
      break;
    case 'history':
      onHistoryCallback = callback;
      break;
    case 'call':
      onCallRequestCallback = callback;
      break;
    case 'callinfo':
      onCallInfoCb = callback;
      break;
    case 'hangup':
      onHangupRequestCallback = callback;
      break;
    case 'updateurl':
      onUpdateUrlCb = callback;
      break;
    case 'transfer':
      onTransferCallCb = callback;
      break;
    default:
      break;
  }
};

//Private methods
//连接wss服务器
function connectToWss() {
  log('websocket conn...');

  wx.onSocketOpen(function (res) {
    log('websocket open');
    startLogin();
  });

  wx.onSocketMessage(function (res) {
    log('websocket recv:' + res.data);
    parseSocketMessage(res.data);
  });

  wx.onSocketError(function (res) {
    log('websocket error');
    if (onErrorCallback) {
      onErrorCallback('与服务器连接出错，请检查');
    }
  });

  wx.onSocketClose(function (res) {
    log('websocket close');
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval);
    }
    if (onErrorCallback) {
      onErrorCallback('与服务器连接断开，请检查');
    }
  });

  socketTask = wx.connectSocket({
    url: wsServer,
    fail: connectWsFailed
  });
};
//开始登录
function startLogin() {
  //setTimeout(function() {
  var msg = {
    action: 'LOGIN_REQUEST',
    data: {
      sourceAppId: appid,
      appkey: appkey,
      account: imAccount,
      token: imToken,
      withHisMsg: loginWithHisMsg
    }
  };
  sendMessage(JSON.stringify(msg));
  //}, 1000);
  //sendMessage(JSON.stringify(msg));
}
//连接websocket服务器失败回调处理
function connectWsFailed() {
  isLogging = false;
  if (onErrorCallback) {
    onErrorCallback('无法与服务器连接，请检查');
  }
}

//发送消息
function sendMessage(message) {
  log('websocket send:' + message);
  if (!isConnected()) {
    log('not connected');
    /*if (!isLogging) {
      connectToWss();
    }*/
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

function sendFile(files, index, fileType, callback) {
  if (index >= files.length) {
    log('All file has uploaded');
    return;
  }
  var id = files[index];
  if (callback) {
    sendMsgCallback[id] = callback;
  }
  getImageInfo(files[index], function (imageResult) {
    wx.uploadFile({
      url: fileServer,
      filePath: files[index],
      name: 'uploadFile',
      formData: {
        'appKey': appKey,
        'account': imAccount,
        'token': imToken
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
              size: imageResult.size,
              digest: imageResult.digest,
              height: imageResult.height,
              width: imageResult.width,
              to: asstAccount,
              from: imAccount
            }
          };
          sendMessage(JSON.stringify(msg));
          sendFile(files, index + 1, 'image', callback);
        }
      }
    });
  }, function () {
    if (onErrorCallback) {
      onErrorCallback('文件上传失败');
    }
  });
}

function uploadFile(file, callback) {
  wx.uploadFile({
    url: fileServer,
    filePath: file,
    name: 'uploadFile',
    formData: {
      'appKey': appkey,
      'account': imAccount,
      'token': imToken
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

function addAttatch(url, callback) {
  console.log('addAttatch');
  if (callback) {
    addAttatchCallback = callback;
  }
  var msg = {
    action: 'ATTATCH_REQUEST',
    data: {
      type: 'attatch',
      to: asstAccount,
      from: imAccount,
      url: url
    }
  };
  sendMessage(JSON.stringify(msg));
}

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

function doSwitchMode(mode) {
  sendLog('1', 'switch mode:' + mode);
  var msg = {
    action: 'SWITCHMODE_REQUEST',
    data: {
      type: mode,
      from: imAccount,
      to: destUuid,
      attach: {},
      pushcontent: ''
    }
  };
  sendMessage(JSON.stringify(msg));
}

function getImageInfo(file, _success, _fail) {
  wx.getFileInfo({
    filePath: file,
    digestAlgorithm: 'md5',
    success: function success(fileResult) {
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
            _fail('getImageInfo fail');
          }
        }
      });
    },
    fail: function fail() {
      if (_fail) {
        _fail('getImageInfo fail');
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
      if (onCallRequestCallback) {
        onCallRequestCallback(msg);
      }
      break;
    case 'CALLINFO_RESPONSE':
      parseCallInfoResponse(msg);
      break;
    case 'CALL_RESPONSE':
      sendLog('1', 'call response:' + data);
      if (callCallback) {
        callCallback(msg);
      }
      if (0 == parseInt(msg.data) && onHangupRequestCallback) {
        onHangupRequestCallback(msg);
      }
      break;
    case 'HANGUP_REQUEST':
      sendLog('1', 'hangup request:' + data);
      if (onHangupRequestCallback) {
        onHangupRequestCallback(msg);
      }
      break;
    case 'UPDATE_URL':
      if (onUpdateUrlCb) {
        onUpdateUrlCb(msg);
      }
      break;
    case 'CALL_TRANSFER':
      sendLog('1', 'call transfer:' + data);
      parseTransfer(msg);
      break;
    default:
      break;
  }
}

//解析登录响应消息
function parseLoginResponse(msg) {
  if (!msg.data.login) {
    log('login fail');
    if (onErrorCallback) {
      console.error('登录失败!' + msg.data.message);
      onErrorCallback('登录失败!' + msg.data.message);
    }
    isLogin = false;
    isLogging = false;
    return;
  }
  //登录成功
  log('login success');
  imPhoto = msg.data.photo;
  asstAccount = msg.data.asstAccount;
  asstName = msg.data.asstName;
  asstPhoto = msg.data.asstPhoto;
  isLogin = true;
  isLogging = false;
  heartbeat();
}
//解析发送消息响应消息
function parseMsgResponse(msg) {
  var id = msg.data.id;
  if (sendMsgCallback[id]) {
    sendMsgCallback[id](msg.data);
  }
}
//解析服务器推送的错误消息
function parseErrorReceive(msg) {
  if (onErrorCallback) {
    onErrorCallback(msg.message);
  }
}
//解析服务器推送的实时消息
function parseMsgReceive(msg) {
  var data = {
    type: 'text',
    from: 'd',
    text: msg.data.body,
    head: asstPhoto,
    name: asstName,
    time: msg.data.msgTimestamp
  };
  if (onMsgCallback) {
    onMsgCallback(data);
  }
}
//解析服务器推送的历史消息
function parseHistory(msgHis) {
  if (!msgHis.data) return;
  if (200 != msgHis.data.code || 0 >= msgHis.data.size) return;
  var msgs = [];
  for (var i = 0; i < msgHis.data.size; i++) {
    var msg = msgHis.data.msgs[i];
    var from = msg.from == imAccount ? 'c' : 'd';
    var head = msg.from == imAccount ? imPhoto : asstPhoto;
    var name = msg.from == imAccount ? '' : asstName;

    switch (msg.type) {
      case 0:
        //文本消息
        msgs.push({
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
          type: 'image',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          url: msg.body.url
        });
        break;
      case 2:
        //语音消息
        break;
      default:
        break;
    }
  }
  if (onHistoryCallback) {
    onHistoryCallback(msgs);
  }
}

function parseAttatchResponse(msg) {
  if (addAttatchCallback) {
    addAttatchCallback(msg);
  }
}

//解析预呼叫消息
function parsePreCallResponse(msg) {
  isPrecall = false;
  if (msg.data && preCallCallback) {
    if (msg.data.success) {
      //已分配
      destName = msg.data.doctor.name;
      if (msg.data.destUuid) {
        destUuid = msg.data.destUuid;
      } else {
        destUuid = msg.data.doctor.login.uuid;
      }
    } else {
      //分配失败
      destName = '';
      destUuid = null;
    }
    preCallCallback(msg.data);
  }
}

function parseTransfer(msg) {
  destName = msg.data.name;
  destUuid = msg.data.dUuid;

  if (onTransferCallCb) {
    onTransferCallCb(msg);
  }
}

function parseCallInfoResponse(msg) {
  if (msg.data) {
    if (msg.data.doctorUuid) {
      destUuid = msg.data.doctorUuid;
    }
    if (msg.data.doctor.name) {
      destName = msg.data.doctor.name;
    }
  }
  if (onCallInfoCb) {
    onCallInfoCb(msg.data);
  }
}

function parseHangupResponse(msg) {
  //console.dir(msg);
  if (200 == msg.data.status && hangupCallback) {
    destName = '';
    destUuid = null;
    hangupCallback(true, msg.data.data);
  }
}

//输出日志
function log(content) {
  if (debug) {
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
  if (!isConnected()) {
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
  if (!isConnected()) {
    isLogin = false;
    return false;
  }
  return isLogin;
}

function isConnected() {
  if (!socketTask) {
    return false;
  }
  return 1 == socketTask.readyState;
}

//对外公开接口
module.exports = {
  init: init,
  login: login,
  logout: logout,
  sendLog: sendLog,
  sendText: sendText,
  sendImages: sendImages,
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
  loginStatus: loginStatus
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getHommizationTime(time) {
  //var d = new Date(time);
  if (!time) return '';
  var timeText = getTimeRegion(time) + ' ' + getHourMinute(time);

  if (isToday(time)) {

    return timeText;
  } else if (isYestoday(time)) {
    return '昨天' + timeText;
  } else {
    return getYearMonthDate(time) + timeText;
  }
};

function isToday(time) {
  var d = getDayStart();
  return time >= d;
};

function isYestoday(time) {
  var d = getDayStart();
  var y = getDayStart() - 24 * 3600 * 1000;
  return time >= y && time < d;
};

function getTimeRegion(time) {
  var date = new Date(time);
  var hour = date.getHours();
  if (hour < 6) {
    return '凌晨';
  } else if (hour >= 6 && hour < 11) {
    return '上午';
  } else if (hour >= 11 && hour < 13) {
    return '中午';
  } else if (hour >= 13 && hour < 18) {
    return '下午';
  } else {
    return '晚上';
  }
};

function getHourMinute(time) {
  var date = new Date(time);
  var hour = date.getHours();
  var minute = date.getMinutes();
  if (hour >= 13) {
    hour -= 12;
  }
  return hour + ':' + formatNumber(minute);
}

function getYearMonthDate(time) {
  var date = new Date(time);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '-' + month + '-' + day;
}

function getDayStart(date) {
  if (!date) {
    date = new Date();
  }
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var start = new Date(year, month, day, 0, 0, 0);
  return start.getTime();
};

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
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

function format(d, fmt) {
  var o = {
    "M+": d.getMonth() + 1, //月份 
    "d+": d.getDate(), //日 
    "h+": d.getHours(), //小时 
    "m+": d.getMinutes(), //分 
    "s+": d.getSeconds(), //秒 
    "q+": Math.floor((d.getMonth() + 3) / 3), //季度 
    "S": d.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  }return fmt;
};

//对外公开接口
module.exports = {
  getHommizationTime: getHommizationTime,
  getDayStart: getDayStart,
  formatTimeLength: formatTimeLength,
  format: format
};

/***/ }),
/* 3 */
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

//对外公开接口
module.exports = {
  convertCurrency: convertCurrency,
  isInteger: isInteger,
  isMobilePhone: isMobilePhone,
  isEmail: isEmail,
  getRequestParams: getRequestParams,
  getNationList: getNationList,
  getNationCode: getNationCode
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//输出日志
function info(content) {
  console.log('[' + formatTime() + '][HH_IM_SDK] ' + content);
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
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

//格式化数字
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

module.exports = {
  info: info
};

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hhim = __webpack_require__(1);
var eventOption = {};
var dateUtil = __webpack_require__(2);
var commonUtil = __webpack_require__(3);
var log = __webpack_require__(4);
var ring = wx.createInnerAudioContext();
var that = undefined;
var livePlayUrl;
var playStart = false,
    pushStart = false;
var onLoading = true;
var code1101 = 0,
    code1308 = 0;
var secondes = 0;
var pageIsShowing = true;
var famOrderId = '';
var _attached = false;
var callStatus = {
  openCamera: false
};

Component({
  behaviors: [__webpack_require__(0)],
  /**
   * 组件的属性列表
   */
  properties: {
    dept: {
      type: String,
      value: ''
      // observer(newVal, oldVal, changedPath) {
      //   this.propertyChanged(newVal, oldVal, changedPath);
      // }
    },
    logoImage: {
      type: String,
      value: 'https://imgs.hh-medic.com/icon/wmp/online-logo-hh.png'
    },
    waittingText: {
      type: String,
      value: '预计接通时间:'
    },
    appointedDoctorId: {
      type: String,
      value: ''
    },
    appointedOrderId: {
      type: String,
      value: ''
    },
    medicRecordId: {
      type: String,
      value: ''
    },
    patient: {
      type: String,
      value: ''
    },
    hospitalId: {
      type: String,
      value: ''
    },
    cameraTimeoutSeconds: {
      type: String,
      value: '10'
    },
    cameraTimeoutMessage: {
      type: String,
      value: '打开摄像头失败，请重启微信再呼叫'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    callImmediate: false,
    status: 0, //状态码。1:接入中，显示logo，2:显示视频画面
    pushUrl: '', //本地视频推流地址
    playUrl: '', //播放地址
    pusher: null, //推流对象
    player: null, //播放对象
    photoUrl: '', //照片url
    license: '',
    name: '', //姓名
    videoTime: '', //已视频时长
    videoTimeStart: null, //开始时间
    timeout: 60, //当前超时倒计时
    enableCamera: true, //是否启用本地推流摄像头
    showExtControls: false, //是否显示扩展按纽
    extControlHeight: 35, //扩展信息栏高度
    extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/up.png', //图片地址
    pusherVisible: 'hidden', //是否显示本地推流画面
    playerVisible: 'hidden', //是否显示本地推流画面
    t301: null, //振铃计时器
    t301Timeout: 60, //振铃时长
    demo: 0,
    playMode: "HD",
    uiStyle: {
      objFit: 'fillCrop',
      muted: false,
      waittingText: '',
      extBtns: true,
      license: '执业资格证'
    },
    animationData: {},
    showDemoTip: false,
    callBtnsVisible: false,
    playerFullscreen: false,
    logoWidth: 235,
    pusherHeight: 167,
    pusherWidth: 120,
    isBackCamera: false,
    flashIcon: 'https://imgs.hh-medic.com/icon/wmp/flash-off.png',
    showSettingBtn: false,
    showCancelBtn: false,
    showCalledPanel: false,
    question: null,
    feedbackVisible: 'hidden'
  },

  lifetimes: {
    attached: function attached() {
      that = this;
      var pusher = wx.createLivePusherContext(this);
      that.setData({
        pusher: pusher
      });

      var player = wx.createLivePlayerContext('livePlayer', this);
      that.setData({
        player: player
      });

      if (2 == that.data.status) {
        that._startVideo();
        that._showPlayer();
        that._showPusher();
      }

      ring.autoplay = false;
      ring.loop = true;
      ring.volume = 1;
      ring.src = 'https://imgs.hh-medic.com/icon/ring.mp3';
      // wx.setInnerAudioOption({
      //   mixWithOther: true,
      //   obeyMuteSwitch: false
      // })
      _attached = true;
      onLoading = true;
    },
    ready: function ready() {
      that._initHhWmp();
    },
    detached: function detached() {
      hhim.logout();
      ring.stop();
    }
  },

  pageLifetimes: {
    show: function show() {
      // 页面被展示
      pageIsShowing = true;
      wx.setKeepScreenOn({
        keepScreenOn: true
      });
      code1101 = 0;
      if (!onLoading) {
        if (hhim.loginStatus()) {
          hhim.sendLog('1', 'hh-call onShow');
          if (1 == that.data.status) {
            setTimeout(function () {
              ring.play();
            }, 500);
          } else {
            ring.stop();
          }
        } else {
          ring.stop();
          wx.navigateBack({
            delta: 1
          });
        }
      }
    },
    hide: function hide() {
      // 页面被隐藏
      pageIsShowing = false;
      ring.stop();
      if (hhim.loginStatus()) {
        hhim.sendLog('1', 'hh-call onHide');
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // propertyChanged(newVal, oldVal, changedPath) {
    //   if ('dept' == changedPath) {
    //     if (newVal && oldVal) {
    //       that._initHhWmp();
    //     }
    //   }
    // },

    _triggerEvent: function _triggerEvent(name, detail) {
      that.triggerEvent(name, detail, eventOption);
    },
    _initHhWmp: function _initHhWmp() {
      if (!that.data.userUuid || !that.data.userToken || !that.data.sdkProductId || !that.data.openId || !that.data.dept && (this.data.appointedDoctorId || this.data.appointedOrderId) && !that.data.medicRecordId) {
        console.error('呼叫信息不全');
        return;
      }
      var host = this.getHost();
      hhim.init({
        debug: false,
        wsServer: host.wsServer,
        fileServer: host.wmpHost + 'im/upload/'
      });

      hhim.login(that.data.sdkProductId, '', that.data.userUuid, that.data.userToken, false);
      var count = 30;
      var eventDetai = {};
      var loginInterval = setInterval(function () {
        if (hhim.loginStatus()) {
          onLoading = false;
          clearInterval(loginInterval);
          eventDetai.login = true;
          that._triggerEvent('login', eventDetai);
          that._addMonitorLog();
          that._getStyle();
        }
        count--;
        if (count <= 0) {
          onLoading = false;
          clearInterval(loginInterval);
          eventDetai.login = false;
          that._triggerEvent('login', eventDetai);
        }
      }, 100);
    },
    _addMonitorLog: function _addMonitorLog() {
      wx.getSystemInfo({
        success: function success(res) {
          hhim.sendLog('1', JSON.stringify(res));
        }
      });
      wx.getNetworkType({
        success: function success(res) {
          hhim.sendLog('1', 'networkType:' + res.networkType);
        }
      });
      wx.onNetworkStatusChange(function (res) {
        if (!res.isConnected) {
          //that.hangup(false, 'HANGUP', false);
        }
        hhim.sendLog('1', 'networkStatusChange:' + JSON.stringify(res));
      });
      wx.onMemoryWarning(function () {
        hhim.sendLog('1', 'onMemoryWarning');
      });
    },


    /**
     * 播放监控
     */
    _playerMonitor: function _playerMonitor() {
      setTimeout(function () {
        if (!playStart) {
          that.data.player.play();
          that._playerMonitor();
        }
      }, 2000);
    },


    /**
     * 推流监控
     */
    _pusherMonitor: function _pusherMonitor() {
      setTimeout(function () {
        if (!pushStart) {
          that.data.pusher.start();
          that._pusherMonitor();
        }
      }, 3000);
    },


    /**
     * 显示推流画面
     */
    _showPusher: function _showPusher() {
      that.setData({
        pusherVisible: ''
      });
    },


    /**
     * 隐藏推流画面
     */
    _hidePusher: function _hidePusher() {
      that.setData({
        pusherVisible: 'hidden'
      });
    },


    /**
     * 显示播放画面
     */
    _showPlayer: function _showPlayer() {
      that.setData({
        playerVisible: ''
      });
    },


    /**
     * 隐藏播放画面
     */
    _hidePlayer: function _hidePlayer() {
      that.setData({
        playerVisible: 'hidden'
      });
    },


    /** 启动推流和播放 */
    _startVideo: function _startVideo() {
      ring.stop();
      if (!that.data.pushUrl || !that.data.playUrl) {
        return;
      }

      that.setData({
        pusherHeight: 167,
        pusherWidth: 120
      });

      that._showPusher();
      that._showPlayer();
      playStart = false;
      that.data.player.play();
      that._playerMonitor();
      if (that.data.playerFullscreen) {
        that.data.player.requestFullScreen();
      }
      that._startVideoTimer();
    },


    /** 停止推流和播放 */
    _stopVideo: function _stopVideo() {
      ring.stop();
      if (that.data.pusher) {
        that.data.pusher.stop();
      }
      if (that.data.player) {
        that.data.player.stop();
        that.data.player.exitFullScreen();
      }
      that._hidePusher();
      that._hidePlayer();
      that.setData({
        videoTimeStart: null,
        showExtControls: true,
        demoVideoVisible: 'hidden'
      });
      that._tapFolding();
    },


    /** 点击显示隐藏扩展控制按纽 */
    _tapFolding: function _tapFolding() {
      if (that.data.showExtControls) {
        that.setData({
          showExtControls: false,
          extControlHeight: 35,
          extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/up.png'
        });
      } else {
        that.setData({
          showExtControls: true,
          extControlHeight: 185,
          extControlImgSrc: 'https://imgs.hh-medic.com/icon/wmp/down.png'
        });
      }
    },
    _statechangePlayer: function _statechangePlayer(e) {
      if (2004 == e.detail.code) {
        playStart = true;
      }
      if (e.detail.code < 0) {
        //出错之后尝试重启播放
        that.data.player.stop();
        playStart = false;
        that._playerMonitor();
      }
      hhim.sendLog('3', 'status:' + e.detail.code);
      that._triggerEvent('playerstatechange', e);
    },
    _netChangedPlayer: function _netChangedPlayer(e) {
      var nInfo = {
        vbr: e.detail.info.videoBitrate,
        abr: e.detail.info.audioBitrate,
        fps: parseInt(e.detail.info.videoFPS),
        spd: e.detail.info.netSpeed,
        jit: e.detail.info.netJitter,
        vw: e.detail.info.videoWidth,
        vh: e.detail.info.videoHeight
      };
      hhim.sendLog('3', 'netinfo:' + JSON.stringify(nInfo));
    },
    _errorPlayer: function _errorPlayer(e) {
      hhim.sendLog('3', 'error:' + e.detail.errCode);
    },


    _onLivePusherError: function _onLivePusherError(e) {
      hhim.sendLog('2', 'error:' + e.detail.errCode);
      if (10001 == e.detail.errCode || 10002 == e.detail.errCode) {
        //启动摄像头或麦克风失败
        that._hangup(true, 'HANGUP', false);
      }
    },

    _onLivePusherNetInfo: function _onLivePusherNetInfo(e) {
      var nInfo = {
        vbr: e.detail.info.videoBitrate,
        abr: e.detail.info.audioBitrate,
        fps: parseInt(e.detail.info.videoFPS),
        spd: e.detail.info.netSpeed,
        jit: e.detail.info.netJitter,
        vw: e.detail.info.videoWidth,
        vh: e.detail.info.videoHeight
      };
      hhim.sendLog('2', 'netinfo:' + JSON.stringify(nInfo));
    },


    _onLivePusherChange: function _onLivePusherChange(e) {
      if (1002 == e.detail.code) {
        pushStart = true;
      }
      hhim.sendLog('2', 'status:' + e.detail.code);
      that._processPusherCode(e.detail.code);
      that._triggerEvent('pusherstatechange', e);
    },

    /** 处理推流状态码 */
    _processPusherCode: function _processPusherCode(code) {
      code = parseInt(code);
      if (1003 == code) {
        //打开摄像头成功
        callStatus.openCamera = true;
        return;
      }
      if (-1308 == code) {
        code1308++;
      }
      if (3 == code1308) {
        code1308++;
        wx.showToast({
          title: '网络错误请重拨',
          icon: 'none',
          duration: 2000
        });
        setTimeout(function () {
          that._hangup(true, 'HANGUP', false);
        }, 2000);
        return;
      }

      if (1101 == code) {
        code1101++;
      }
      if (3 == code1101) {
        code1101++;
        wx.showToast({
          title: '网络卡顿...',
          icon: 'loading',
          duration: 2000
        });
      }
    },


    /** 封装wx.showLoading */
    _showLoading: function _showLoading(obj) {
      if (pageIsShowing) {
        wx.showLoading({
          title: obj.title
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 30 * 1000);
      }
    },


    /** 检查用户授权 */
    _checkAuthorize: function _checkAuthorize(callback) {
      wx.authorize({
        scope: "scope.record",
        success: function success() {
          wx.authorize({
            scope: "scope.camera",
            success: function success() {
              if (callback) {
                callback(true);
              }
            },
            fail: function fail() {
              hhim.sendLog('1', 'authorize failed:camera');
              if (callback) {
                callback(false);
              }
            }
          });
        },
        fail: function fail() {
          hhim.sendLog('1', 'authorize failed:record');
          if (callback) {
            callback(false);
          }
        }
      });
    },

    _getStyle: function _getStyle() {
      that._applyStyle();
    },
    _applyStyle: function _applyStyle() {
      that._doCall(that._preCallCb, that.data.dept);
    },
    _doCall: function _doCall(callback, dept) {
      hhim.sendLog('1', 'authorize check start');
      //检查用户麦克风和摄像头是否已授权
      that._checkAuthorize(function (success) {
        if (!success) {
          //麦克风或摄像头未授权 
          that.setData({
            showSettingBtn: true
          });
          return;
        }
        hhim.sendLog('1', 'authorize successs ');
        hhim.preCall(dept, callback, null, that.data.appointedDoctorId, that.data.appointedOrderId, that.data.medicRecordId, that.data.patient, that.data.hospitalId);
      });
    },
    _preCallCb: function _preCallCb(data) {
      //判断当前页面是否已卸载
      if (!pageIsShowing) {
        that._hangup(true, 'CANCEL', true);
        return;
      }

      var eventDetail = Object.assign({}, data);
      eventDetail.livePlayUrl = '';
      eventDetail.livePushUrl = '';
      that._triggerEvent('precallstatechange', eventDetail);

      hhim.sendLog('1', 'push:' + data.livePushUrl);
      hhim.sendLog('1', 'play:' + data.livePlayUrl);
      if (!data.success) {
        that.setData({
          status: 0,
          pushUrl: '',
          playUrl: ''
        });
        var msg = data.message ? data.message : '医生繁忙，请稍后再拨';
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: msg,
          showCancel: false,
          success: function success() {
            wx.navigateBack({
              delta: 1
            });
          }
        });
        return;
      }
      callStatus.openCamera = false;
      that._showPusher();

      //图片
      var photoUrl = 'https://imgs.hh-medic.com/photo/D2017081615094714624/98A8RC.jpg?x-oss-process=image/resize,m_fixed,w_750';
      if (data.doctor.photourl) {
        photoUrl = data.doctor.photourl;
      }

      var license = '';
      if (data.doctor.license) {
        if (data.doctor.license.indexOf('?x-oss-process') < 0) {
          license = data.doctor.license + '?x-oss-process=image/resize,m_fixed,w_400';
        } else {
          license = data.doctor.license;
        }
      }

      if (data.orderId) {
        famOrderId = data.orderId;
      }
      //显示详情
      that.setData({
        countdown: that.data.t301Timeout,
        photoUrl: photoUrl,
        license: license,
        name: data.doctor.name,
        pushUrl: data.livePushUrl,
        pusherHeight: 140,
        pusherWidth: 100,
        showCancelBtn: true,
        showCalledPanel: false
      });
      livePlayUrl = data.livePlayUrl;

      that._countDown();
      hhim.call(that._callCb, false);
      hhim.on('transfer', that.transfer);
      hhim.on('error', that.hhImError);

      pushStart = false;
      that.data.pusher.start();

      ring.play();
      ring.onTimeUpdate(function () {
        ring.offTimeUpdate();
        pushStart = false;
        that.data.pusher.start();
        that._pusherMonitor();
      });

      setTimeout(function () {
        that.setData({
          status: 1
        });
      }, 1000);
      that._checkCameraIsOpen();
    },
    _callCb: function _callCb(data) {
      ring.stop();
      that.data.pusher.stopBGM();
      if (that.data.t301) {
        clearInterval(that.data.t301);
        that.setData({
          t301: null
        });
      }
      if (1 == data.data) {
        wx.setNavigationBarTitle({
          title: '通话中'
        });
        that.setData({
          playUrl: livePlayUrl,
          status: 2
        });
        wx.vibrateLong();
        //接听，开始推流。重要！！！必须加延时，否则可能导致无规律的拉流失败
        setTimeout(function () {
          that._startVideo();
        }, 500);
      } else {
        //拒绝或错误
        that._hangup(false);
      }
    },


    /** 检查推流摄像头是否已打开 */
    _checkCameraIsOpen: function _checkCameraIsOpen() {
      setTimeout(function () {
        if (callStatus.openCamera) {
          //摄像头已打开
          return;
        }
        if (1 != that.data.status && 2 != that.data.status) {
          //不是处于呼叫等待或视频中
          return;
        }
        if (!pageIsShowing) {
          //当前页面没有显示
          return;
        }
        hhim.sendLog('1', 'can not open camera');
        that._hangup(true, 'HANGUP', false);
        wx.showModal({
          title: '错误',
          content: that.data.cameraTimeoutMessage,
          showCancel: false,
          success: function success() {
            wx.navigateBack({
              delta: 1
            });
          }
        });
      }, parseInt(this.data.cameraTimeoutSeconds) * 1000);
    },

    /**
     * 显示图片
     */
    _tapShowLicense: function _tapShowLicense() {
      if (!that.data.license) {
        return;
      }
      hhim.sendLog('1', 'tapShowLicense');
      wx.previewImage({
        urls: [that.data.license]
      });
    },


    /**
     * 开关闪光灯
     */
    _tapToggleFlash: function _tapToggleFlash() {
      hhim.sendLog('1', 'tapToggleFlash');
      if (!that.data.isBackCamera) {
        //如果不是后置摄像头
        wx.showToast({
          title: '请切换至后摄像头',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (that.data.pusher) {
        that.data.pusher.toggleTorch({
          success: function success() {
            that.setData({
              flashIcon: that._toggleFlashIcon()
            });
          }
        });
      }
    },

    /**
     * 开关闪光灯后获取相应的icon
     */
    _toggleFlashIcon: function _toggleFlashIcon() {
      if ('https://imgs.hh-medic.com/icon/wmp/flash-off.png' == that.data.flashIcon) {
        return 'https://imgs.hh-medic.com/icon/wmp/flash-on.png';
      }
      return 'https://imgs.hh-medic.com/icon/wmp/flash-off.png';
    },


    /**
     * 切换前后摄像头
     */
    _switchCamera: function _switchCamera() {
      if (that.data.pusher) {
        hhim.sendLog('1', 'switchCamera');
        that.data.pusher.switchCamera({
          success: function success() {
            that.setData({
              isBackCamera: !that.data.isBackCamera
            });
          }
        });
      }
    },


    /**
     * 选择图片资料，从相册还是拍照
     */
    _selectImage: function _selectImage() {
      hhim.sendLog('1', 'selectImage start');
      hhim.switchMode('AUDIO');
      wx.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album', 'camera'],
        success: function success(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          hhim.uploadFile(tempFilePaths[0], function (e) {
            console.log(e);
            e = JSON.parse(e);

            if (200 == e.status) {
              //成功
              var fileUrl = e.data;
              hhim.addAttatch(fileUrl, function (e) {
                console.log(e);
              });
            } else {
              wx.showToast({
                title: '发送失败！'
              });
            }
          });
        },
        complete: function complete() {
          hhim.sendLog('1', 'selectImage complete');
          hhim.switchMode('VIDEO');
          that._resumeVideo();
        }
      });
    },
    _cancelInitiative: function _cancelInitiative(e) {
      ring.stop();
      wx.vibrateLong();
      hhim.sendLog('1', 'cancelInitiative type:' + e.target.dataset.hanguptype);
      that._hangup(true, e.target.dataset.hanguptype);
    },
    _hangup: function _hangup(initiative, hangupType, stayInpage) {
      that._showLoading({
        title: '正在结束...'
      });
      if (!hangupType) {
        hangupType = 'HANGUP';
      }
      var videoTimeSeconds = parseInt((new Date().getTime() - that.data.videoTimeStart) / 1000);
      //清除计时器
      that._clearCountDown();
      that._stopVideo();
      hhim.on('transfer', null);
      hhim.on('error', null);

      that.setData({
        countdown: that.data.t301Timeout,
        status: 0,
        pushUrl: '',
        playUrl: ''
      });

      if (initiative) {
        hhim.hangup(function (success, data) {
          if (success) {
            //do sth. 
          }
          that._feedback(stayInpage, data);
        }, false, hangupType, videoTimeSeconds);
      } else {
        that._feedback(stayInpage);
        // wx.hideLoading();
        // //是否留在当前页面
        // if (!stayInpage) {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }
      }
    },


    /** 评价 */
    _feedback: function _feedback(stayInpage, data) {
      wx.hideLoading();
      if (data && data.question) {
        wx.setNavigationBarTitle({
          title: '评价'
        });
        this.setData({
          question: data.question,
          feedbackVisible: ''
        });
      } else {
        //是否留在当前页面
        if (!stayInpage) {
          console.log('navigateBack...');
          wx.navigateBack({
            delta: 1
          });
        }
      }
    },


    /** 评价窗口关闭事件 */
    _evaClose: function _evaClose() {
      this.setData({
        feedbackVisible: 'hidden'
      });
      wx.navigateBack({
        delta: 1
      });
    },

    /** 用户回答调研问题事件 */
    _evaAsk: function _evaAsk(e) {
      hhim.feedback(famOrderId, that.data.question.id, e.detail.answerText);
    },


    /** 用户打分评价事件 */
    _evaluate: function _evaluate(e) {
      hhim.evaluate(famOrderId, e.detail.evaValue, e.detail.evaText);
    },


    /** 倒计时 */
    _countDown: function _countDown() {
      if (that.data.t301) {
        clearInterval(that.data.t301);
      }

      that.setData({
        t301: null,
        timeout: that.data.t301Timeout
      });

      secondes = that.data.t301Timeout;
      var t = setInterval(function () {
        if (2 == that.data.status) {
          //视频进行中
          that._clearCountDown();
          return;
        }
        secondes--;
        that.setData({
          timeout: secondes
        });
        if (secondes < 0) {
          that._clearCountDown();
          that._hangup(true, 'TIMEOUT');
        }
      }, 1000);
      that.setData({
        t301: t
      });
    },


    /** 开始计时器 */
    _startVideoTimer: function _startVideoTimer() {
      that.setData({
        videoTimeStart: new Date().getTime()
      });
      var interval = setInterval(function () {
        if (!that.data.videoTimeStart) {
          clearInterval(interval);
          return;
        }
        var vt = parseInt((new Date().getTime() - that.data.videoTimeStart) / 1000);
        that.setData({
          videoTime: dateUtil.formatTimeLength(vt)
        });
      }, 1000);
    },


    /**清除倒计时 */
    _clearCountDown: function _clearCountDown() {
      if (!that.data.t301) {
        return;
      }
      secondes = that.data.t301Timeout;
      ring.stop();
      clearInterval(that.data.t301);
      that.setData({
        t301: null,
        countdown: that.data.t301Timeout
      });
    },
    _transfer: function _transfer(res) {
      hhim.sendLog('1', 'transfe play:' + res.data.livePlayUrl);
      that.setData({
        countdown: that.data.t301Timeout,
        photoUrl: res.data.photoUrl,
        license: res.data.license,
        name: res.data.name,
        pusherHeight: 140,
        pusherWidth: 100,
        showCancelBtn: true,
        showCalledPanel: false
      });
      livePlayUrl = res.data.livePlayUrl;

      that._stopVideo();
      that.setData({
        status: 1
      });

      that._showPusher();
      that._countDown();
      hhim.call(that._callCb, false);
      ring.play();
      ring.onPlay(function () {
        ring.offPlay();
        pushStart = false;
        that.data.pusher.start();
        that._pusherMonitor();
      });
    },
    _resumeVideo: function _resumeVideo() {
      playStart = false;
      pushStart = false;
      that.data.player.play();
      that.data.pusher.start();
      that._playerMonitor();
      that._pusherMonitor();
    },
    _queryCallInfo: function _queryCallInfo() {
      hhim.on('transfer', that.transfer);
      hhim.on('callinfo', that.parseCallInfo);
      hhim.on('hangup', that.calledHangup);
      hhim.callInfo();
    },
    _calledHangup: function _calledHangup() {
      that.hangup(false, 'HANGUP', false);
    },
    _parseCallInfo: function _parseCallInfo(res) {
      if ('undefined' == typeof res || !res) {
        hhim.on('callinfo', null);
        hhim.on('hangup', null);
        wx.navigateBack({
          delta: 1
        });
        return;
      }
      wx.hideLoading();
      if (res.doctor.name) {
        that.setData({
          name: res.doctor.name
        });
      }
      if (res.doctor.photourl) {
        that.setData({
          photoUrl: res.doctor.photourl + '?x-oss-process=image/resize,m_fixed,w_750'
        });
      }
      if (res.doctor.license) {
        that.setData({
          license: res.doctor.license + '?x-oss-process=image/resize,m_fixed,w_400'
        });
      }

      if (res.livePushUrl) {
        that.setData({
          pushUrl: res.livePushUrl
        });
      }
      if (res.livePlayUrl) {
        livePlayUrl = res.livePlayUrl;
      }
      if (res.orderId) {
        famOrderId = res.orderId;
      }
      wx.setNavigationBarTitle({
        title: '正在呼叫'
      });

      var pusher = wx.createLivePusherContext(this);
      that.setData({
        pusher: pusher,
        showCancelBtn: false,
        showCalledPanel: true
      });
      that._showPusher();

      ring.play();
      ring.onPlay(function () {
        ring.offPlay();
        pushStart = false;
        that.data.pusher.start();
        that._pusherMonitor();
      });

      wx.hideLoading();
    },


    /** 接听或拒绝 */
    _answerCall: function _answerCall(e) {
      ring.stop();
      wx.vibrateLong();
      hhim.callResponse(famOrderId, e.currentTarget.dataset.answer);
      if (1 == parseInt(e.currentTarget.dataset.answer)) {
        //接听
        that.setData({
          playUrl: livePlayUrl,
          status: 2
        });
        wx.setNavigationBarTitle({
          title: '通话中'
        });
        setTimeout(function () {
          that._startVideo();
        }, 500);
      } else {
        //取消
        hhim.on('callinfo', null);
        hhim.on('hangup', null);
        wx.navigateBack({
          delta: 1
        });
      }
    },


    _hhImError: function _hhImError(e) {
      that._hangup(false, 'HANGUP', false);
    },

    _navBack: function _navBack() {
      wx.navigateBack({
        delta: 1
      });
    }
  }
});

/***/ })
/******/ ]);