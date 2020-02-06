/**HH-MEDIC VideoDoctor IM SDK 1.0.0
 ***ALL RIGHTS RESERVED
 ***Author:HH-MYL
 ***注意：本文件不提交至github
 ***发布前需使用http://www.javascriptobfuscator.com/Javascript-Obfuscator.aspx或对应gui工具进行压缩混淆
 ***将压缩混淆后的文件进行发布
 */

//Private variables
var loginWithHisMsg = false;
var heartBeatInterval;
var imPhoto;
var demoStatus = -1;
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
}

var _callbacks = {
  onMsg: null,
  onError: null,
  onClose: null,
  onHistory: null,
  onCallRequest: null,
  onHangupRequest: null,
  onTransferCall: null,
  onUpgradeCall: null,
  onUpdateUrl: null,
  onUpdateOrderId: null,
  onCommand: null,
  onAllocate: null,
  login: null,
  sendMsg: [],
  addAttatch: null,
  preCall: null,
  call: null,
  hangup: null
}

var _cacheMsgs = {
  startTime: null,
  endTime: null,
  list: []
}

var _commandCache = new Array();
var socketTask;
var isPrecall = false;
var sendingMsg = [];
var upgradeOrderId = '';

//Public methods
//初始化配置
//option.debug:布尔型,是否打开调试开关输出调试信息，默认false
//option.wsServer:字符型,websocket服务器地址
function init(option) {
  if (option) {
    if ('undefined' != typeof(option.debug)) {
      _options.debug = option.debug;
    }
    if ('undefined' != typeof(option.wsServer)) {
      _options.wsServer = option.wsServer;
    }
    if ('undefined' != typeof(option.fileServer)) {
      _options.fileServer = option.fileServer;
    }
  }
  _options.wxAppId = wx.getAccountInfoSync().miniProgram.appId;
  log('init');
};

//登录
//function login(sdkProductId, uuid, token, openId, withHisMsg, callback) {
function login(sdkProductId, userToken, openId, wxAppId, withHisMsg, callback) {
  log('login');
  if ('undefined' != typeof(withHisMsg)) {
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
  }
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
  }
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
  }

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
      debug: false,
      waitList: true
    }
  }
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
  if (upgradeOrderId) {
    msg.data.orderId = upgradeOrderId;
    upgradeOrderId = '';
  }

  if (connected) {
    //已连接
    sendMessage(JSON.stringify(msg));
  } else {
    //处理页面打开但是没有连接到wss服务器的情况，尝试重连
    connectToWss();
    setTimeout(function() {
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
  }
  sendMessage(JSON.stringify(msg));
}

/** 查询被叫信息 */
function callInfo() {
  var msg = {
    action: 'CALLINFO_REQUEST',
    data: {}
  }
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
  }
  sendMessage(JSON.stringify(msg));
}

//挂断视频
function hangup(callback, debug, hangupType, videoTime, hangupSource) {
  log('hangup...');
  if (!doctorName || !doctorUuid) {
    //return;
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
  }
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
  }
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
  }
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
    case 'updateorderid':
      _callbacks.onUpdateOrderId = callback;
      break;
    case 'transfer':
      _callbacks.onTransferCall = callback;
      break;
    case 'upgradecall':
      _callbacks.onUpgradeCall = callback;
      break;
    case 'command':
      _callbacks.onCommand = callback;
      break;
    case 'allocate':
      _callbacks.onAllocate = callback;
    default:
      break;
  }
};

function off(event) {
  switch (event) {
    case 'msg':
      _callbacks.onMsg = null;
      break;
    case 'error':
      _callbacks.onError = null;
      break;
    case 'close':
      _callbacks.onClose = null;
      break;
    case 'history':
      _callbacks.onHistory = null;
      break;
    case 'call':
      _callbacks.onCallRequest = null;
      break;
    case 'callinfo':
      _callbacks.onCallInfoCb = null;
      break;
    case 'hangup':
      _callbacks.onHangupRequest = null;
      break;
    case 'updateurl':
      _callbacks.onUpdateUrl = null;
      break;
    case 'updateorderid':
      _callbacks.onUpdateOrderId = null;
      break;
    case 'transfer':
      _callbacks.onTransferCall = null;
      break;
    case 'upgradecall':
      _callbacks.onUpgradeCall = null;
    case 'command':
      _callbacks.onCommand = null;
      break;
    case 'allocate':
      _callbacks.onAllocate = null;
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
  wx.onSocketOpen(function(res) {
    log('websocket open');
    connected = true;
    startLogin();
  });

  wx.onSocketMessage(function(res) {
    log('websocket recv:' + res.data);
    parseSocketMessage(res.data);
  });

  wx.onSocketError(function(res) {
    connected = false;
    log('websocket error');
    if (_callbacks.onError) {
      _callbacks.onError('与服务器连接出错，请检查');
    }
  });

  wx.onSocketClose(function(res) {
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
  }
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

  getSendFileInfo(files[index], fileType, function(resFile) {
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
      success: function(res) {
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
          }
          sendMessage(JSON.stringify(msg));
          sendFile(files, index + 1, fileType, callback, duration);
        }
      }
    })
  }, function() {
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
    success: function(res) {
      if (callback) {
        callback(res.data);
      }
    },
    fail: function() {
      if (callback) {
        callback({
          statusCode: 400,
          status: 400
        });
      }
    }
  })
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
  }
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
  }
  sendMessage(JSON.stringify(msg));
}

//获取待发送文件的信息
function getSendFileInfo(file, fileType, success, fail) {
  wx.getFileInfo({
    filePath: file,
    digestAlgorithm: 'md5',
    success: function(fileResult) {
      if ('image' == fileType) {
        wx.getImageInfo({
          src: file,
          success: function(imageResult) {
            if (success) {
              var res = {
                size: fileResult.size,
                digest: fileResult.digest,
                height: imageResult.height,
                width: imageResult.width
              }
              success(res);
            }
          },
          fail: function() {
            if (fail) {
              fail('getSendFileInfo fail');
            }
          }
        })
      } else {
        var res = {
          size: fileResult.size,
          digest: fileResult.digest,
          height: 0,
          width: 0
        }
        success(res);
      }
    },
    fail: function() {
      if (fail) {
        fail('getSendFileInfo fail');
      }
    }
  })
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
    case 'ALLOCATE_REQUEST':
      parseAllocate(msg);
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
    case 'UPDATE_ORDERID':
      if (_callbacks.onUpdateOrderId) {
        _callbacks.onUpdateOrderId(msg);
      }
      break;
    case 'CALL_TRANSFER':
      sendLog('1', 'call transfer:' + data);
      parseTransfer(msg);
      break;
    case 'CALL_UPGRADE':
      sendLog('1', 'call upgrade:' + data);
      parseUpgradeCall(msg);
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
  if ('undefined' != typeof(msg.data.demoOptionStatus)) demoStatus = msg.data.demoOptionStatus;
  if (_callbacks.login) {
    _callbacks.login(msg.data.login);
  }
  procCommandCache();
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
      msgData.id = msg.data.msgId
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
    msg.data.imMessage = sendingMsg[id];
    _callbacks.sendMsg[id](msg.data);
    delete sendingMsg[id];
  }

}

function parseAllocate(msg) {
  if (msg.data && msg.data.doctor) {
    doctorName = msg.data.doctor.name;
    doctorUuid = msg.data.doctor.login.uuid;
    sendLog('1', 'allocate doctor success:' + msg.data.doctor.name + '(' + msg.data.doctor.login.uuid + ')');
  }


  if (msg && msg.data && msg.data.livePushUrl) sendLog('1', 'push:' + msg.data.livePushUrl);
  if (msg && msg.data && msg.data.livePlayUrl) sendLog('1', 'play:' + msg.data.livePlayUrl);

  if (_callbacks.onAllocate) {
    _callbacks.onAllocate(msg);
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
  var data;
  switch (msg.data.msgType) {
    case 'PICTURE': //图片消息
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
    case 'AUDIO': //音频消息
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
    case 'CARD': //卡片消息
      var attach = JSON.parse(msg.data.attach);
      var content = JSON.parse(attach.content);
      if ('summaryByFam' != content.command &&
        'buyDrugInformation' != content.command &&
        'buyService' != content.command &&
        'commandProductTips' != content.command) {
        return;
      }

      data = {
        id: msg.data.msgidServer,
        from: 'd',
        type: 'card',
        from: attach.talkUuid,
        head: attach.talkUserPic,
        name: attach.talkName,
        time: attach.createTime,
        patient: attach.patientUuid,
        body: attach,
        bodyContent: content
      };
      break;
    default: //默认是文本
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
      case 0: //文本消息
        msgs.push({
          id: msg.msgid,
          type: 'text',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          text: msg.body.msg,
        });
        break;
      case 1: //图片消息
        msgs.push({
          id: msg.msgid,
          type: 'image',
          from: from,
          head: head,
          name: name,
          time: msg.sendtime,
          url: msg.body.url,
          thumbnail: msg.body.url + '?x-oss-process=image/resize,m_fixed,w_200',
        });
        break;
      case 2: //音频消息
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
      case 9999: //卡片消息
        var content = JSON.parse(msg.body.content);
        if ('summaryByFam' == content.command ||
          'buyDrugInformation' == content.command ||
          'buyService' == content.command ||
          'commandProductTips' == content.command) {
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
  }
  if (_options && 'undefined' != typeof(_options.uuid)) {
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
    success: function() {

    },
    fail: function(e) {
      log('setCacheMsgs fail');
    }
  })
}

function sortMsg(a, b) {
  return a.time - b.time;
}

function existMsg(id) {
  var test = function(item) {
    return parseInt(item.id) == parseInt(id);
  }
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

//解析呼叫升级消息
function parseUpgradeCall(msg) {
  upgradeOrderId = msg.data.orderId;
  if (_callbacks.onUpgradeCall) {
    _callbacks.onUpgradeCall(msg);
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

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':') + '.' + mSecond
};

//格式化数字
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//websocket心跳，防止与服务器断开连接
function heartbeat() {
  if (!connected) {
    return;
  }
  if (heartBeatInterval) {
    clearInterval(heartBeatInterval);
  }
  heartBeatInterval = setInterval(function() {
    var msg = {
      action: 'HEARTBEAT_REQUEST'
    }
    sendMessage(JSON.stringify(msg));
  }, 10000);
}

function loginStatus() {
  return isLogin;
}

function getDemoStatus() {
  return demoStatus;
}

function addToCommandCache(commandName, commandArgs) {
  //console.log('将命令加入缓存');
  _commandCache.push({
    name: commandName,
    args: commandArgs
  })
}

function procCommandCache() {
  //console.log('处理缓存的命令');
  for (let i = 0; i < _commandCache.length; i++) {
    var _cmd = _commandCache.shift();
    if (!_cmd || !_cmd.name) {
      continue;
    }

    switch (_cmd.name) {
      case 'hangup':
        //console.log('缓存的hangup');
        hangup(_cmd.args[0], _cmd.args[1], _cmd.args[2], _cmd.args[3], _cmd.args[4]);
        break;
      default:
        break;
    }
  }
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
  off: off,
  loginStatus: loginStatus,
  getDemoStatus: getDemoStatus,
  clearCache: clearCache,
  addToCommandCache: addToCommandCache
}