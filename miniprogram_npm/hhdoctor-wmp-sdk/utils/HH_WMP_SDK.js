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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
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
function preCall(dept, callback, toUuid) {
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

/***/ })
/******/ ]);