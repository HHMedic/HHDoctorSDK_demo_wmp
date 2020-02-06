const hostUtil = require('./utils/hostUtil.js')
const apis = require('./utils/api.js')
const TIM = require("./webrtc-room/tim-wx.js");
const SDKAppID = 1400073238;
var app;
var tim = null; // SDK 实例通常用 tim 表示
var _status = {
  appShow: true
}

var _logUrl;
var _logId = 0;
var _sessionId;

var _options = {
  profileName: 'prod',
  subDomain: '',
  sdkProductId: null,
  userToken: null,
  userId: null,
  userSig: null,
  photo: null,
  openId: null,
  callPage: null
}
var _callbacks = {
  receiveMsg: null,
  chatMsg: null
}
var _intervals = {
  reportActive: null
}
var _asst = {}

/** 登录 */
function login(options) {
  return new Promise((resolve, reject) => {
    app = getApp();
    tim = getTim();
    if (tim) {
      resolve();
    }
    if (!options ||
      !options.sdkProductId ||
      !options.userToken ||
      !options.openId) {
      reject('缺少sdkProductId、userToken或openId参数');
    }
    refreshSession();
    wx.onAppHide(() => {
      console.log('小程序被隐藏');
      _status.appShow = false;
      addLog('1', 'life:onAppHide')
    });
    wx.onAppShow(() => {
      console.log('小程序被打开');
      _status.appShow = true;
      addLog('1', 'life:onAppShow')
    });

    tim = TIM.create({
      SDKAppID
    });
    _options = Object.assign(_options, options);

    let sdkOptions = {
      _host: hostUtil.getHost(_options.profileName, _options.subDomain),
      _sdkProductId: _options.sdkProductId,
      _userToken: _options.userToken,
      _openId: _options.openId,
      _profileName: _options.profileName,
      _subDomain: _options.subDomain
    };
    getApp().globalData._hhSdkOptions = sdkOptions;

    getUserInfo()
      .then(() => {
        initTIM().then((res) => {
          addLog(1, 'login tim success:' + JSON.stringify(res), '');
          reportActive();
          resolve();
        }).catch(err => {
          addLog(1, 'login tim fail' + (err ? ':' + JSON.stringify(err) : ''), '');
          reject('登录失败');
        })
      })
      .catch(() => {
        addLog(1, 'getuserSig:获取用户SIG失败', '');
        wx.reLaunch({
          url: '/pages/index/err',
        })
        reject('登录失败');
      })
  })
}

/** 退出 */
function logout() {
  return new Promise((resolve, reject) => {
    if (!tim) {
      resolve();
    }
    tim.logout();
    tim = null;
    if (app.globalData && app.globalData._hhTim) {
      app.globalData._hhTim = null;
    }
    resolve();
  })
}

/** 发送消息 */
function sendMessage(toUser, msgData, orderId) {
  return apis.requestSendMessage(toUser, msgData, orderId);
}

/** 注册事件回调 */
function on(event, callback) {
  switch (event) {
    case 'messageReceived':
      if (callback) {
        _callbacks.receiveMsg = callback;
      }
      break;
    case 'chatMessage':
      if (callback) {
        _callbacks.chatMsg = callback;
      }
      break;
    default:
      return
  }
}

/** 注销事件回调 */
function off(event) {
  switch (event) {
    case 'messageReceived':
      _callbacks.receiveMsg = null;
      break;
    case 'chatMessage':
      _callbacks.chatMsg = null;
      break;
    default:
      return
  }
}
/** 获取userId */
function getUserId() {
  return _options.userId;
}

/** 获取userId */
function getUserSig() {
  return _options.userSig;
}
/** 获取用户头像 */
function getUserPhoto() {
  return _options.photo;
}
/** 获取用户套餐产品 */
function getProduct() {
  return _options.product;
}

/** 获取医助信息 */
function getAsstInfo() {
  return _asst;
}
/** 上报日志到服务器 */
function addLog(type, content, orderId) {
  //apis.requestRtcLog(type, content, orderId)
  doAddLog(type, content, orderId).then().catch(() => {})
}

function doAddLog(type, content, orderId) {
  return new Promise((resolve, reject) => {
    if (!_logUrl) {
      _logUrl = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
      _logUrl = _logUrl.substring(0, _logUrl.length - 1) + '-log/';
    }
    let url = _logUrl + '?sdkProductId=' + _options.sdkProductId +
      '&uuid=' + _options.userId +
      '&session=' + _sessionId +
      '&id=' + _logId +
      '&orderId=' + (orderId || '') +
      '&type=' + type +
      '&content=' + encodeURIComponent(content) +
      '&version=' + app.globalData.wmpVersion +
      '&t=' + new Date().getTime();
    _logId++;
    wx.downloadFile({
      url: url
    })
    resolve();
  })
}

function reportActive() {
  if (_intervals.reportActive) {
    clearInterval(_intervals.reportActive);
    _intervals.reportActive = null;
  }
  _intervals.reportActive = setInterval(function() {
    apis.requestRtcLog(1, '_reportActive', '');
  }, 3000);
}

function getTim() {
  app = getApp();
  if (tim) return tim;
  if (app.globalData && app.globalData._hhTim) return app.globalData._hhTim;
  return null;
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    let url = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
    url += 'wmp/getUserSig' +
      '?sdkProductId=' + _options.sdkProductId +
      '&userToken=' + _options.userToken;
    wx.request({
      url: url,
      data: {},
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res && res.data && 200 == res.data.status) {
          var _req = res.data.data;
          _options.userSig = _req.userSig;
          _options.userId = _req.userId + '';
          _options.photo = _req.photoUrl;
          _options.product = _req.product;
          _asst = {
            uuid: _req.asstUuid,
            name: _req.asstName,
            photo: _req.asstPhotos
          }
          resolve();
        } else {
          reject();
        }
      },
      fail: function() {
        reject();
      }
    })
  })

}

/** 初始化TIM */
function initTIM() {
  return new Promise((resolve, reject) => {
    tim.setLogLevel('test' == _options.profileName ? 1 : 4);
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    tim.login({
        userID: _options.userId,
        userSig: _options.userSig
      })
      .then((imResponse) => {
        tim.on(TIM.EVENT.SDK_READY, function() {
          app.globalData._hhTim = tim;
          resolve(imResponse);
        })
      })
      .catch((imError) => {
        reject(imError);
      })
  })
}

function onMessageReceived(e) {
  if ('test' == _options.profileName) console.log('>><<>><<>><<>><<', e)
  if (!e || !e.data || 0 == e.data.length) {
    return;
  }
  for (var i = 0; i < e.data.length; i++) {
    if ('C2C' != e.data[i].conversationType) {
      continue;
    }
    parseMsg(e.data[i]);
  }
}

function parseMsg(data) {
  if (!data.payload || !data.payload.data) return;
  let msg = JSON.parse(data.payload.data);
  if (!data.to || (parseInt(data.to) != _options.userId && 'chat' != msg.command)) {
    return;
  }

  switch (msg.command) {
    //当前用户被叫
    case 'call':
      doCallUser(msg, data.from);
      return;
    case 'chat':
      if (_callbacks.chatMsg) {
        _callbacks.chatMsg(msg);
      }
      return;
    default:
      break;
  }
  if (_callbacks.receiveMsg) {
    _callbacks.receiveMsg([data]);
  }
}

function doCallUser(msg, caller) {
  if (!_options.callPage || !msg.uuid) return;
  if (isBusy()) {
    console.log('用户忙碌');
    //发送忙碌消息
    let msgData = {
      command: 'busy',
      orderId: msg.orderId || '',
      uuid: _options.userId
    }
    sendMessage(msg.uuid, msgData, (msg.orderId || ''));
    return;
  }
  getDoctorInfo(msg)
    .then((res) => {
      console.log(res)
      let pageUrl = _options.callPage + '?' +
        getPublicParams() +
        '&dept=' + msg.orderId +
        '&doctor=' + JSON.stringify(res.doctor) +
        '&orderid=' + res.order.orderid;
      wx.navigateTo({
        url: pageUrl
      })
    }).catch(() => {

    });
}

function isBusy() {
  if (!_status.appShow) return true;
  let pages = getCurrentPages();
  if (!_options.callPage ||
    !pages ||
    pages.length <= 0) {
    return false;
  }
  let curPage = pages[pages.length - 1].route;
  if (0 != curPage.indexOf('/')) {
    curPage = '/' + curPage;
  }
  return curPage == _options.callPage
}

function getDoctorInfo(msg) {
  return new Promise((resolve, reject) => {
    let url = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
    url += 'wmp/getCalledInfoByOrderId' +
      '?sdkProductId=' + _options.sdkProductId +
      '&userToken=' + _options.userToken +
      '&caller=' + msg.uuid +
      '&orderId=' + msg.orderId
    wx.request({
      url: url,
      data: {},
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res && res.data && 200 == res.data.status) {
          var _req = res.data.data;
          resolve(res.data.data);
        } else {
          reject();
        }
      },
      fail: function() {
        reject();
      }
    })
  })
}

/** 生成新的sessionId和日志编号 */
function refreshSession(timeout) {
  if (!timeout) timeout = 1;
  setTimeout(function() {
    _sessionId = _options.userToken + Math.random().toString(36).substr(2).substr(0, 8);
    _logId = 0;
  }, timeout)
}
/** 追加公共参数 */
function getPublicParams() {
  var params = 'profileName=' + _options.profileName +
    '&subDomain=' + _options.subDomain +
    '&sdkProductId=' + _options.sdkProductId +
    '&userToken=' + _options.userToken +
    '&openId=' + _options.openId +
    '&source=wmpSdk';
  return params
}

app = getApp();
module.exports = {
  login: login,
  logout: logout,
  sendMessage: sendMessage,
  on: on,
  off: off,
  getUserId,
  getProduct,
  getUserSig,
  getUserPhoto,
  getAsstInfo,
  addLog,
  refreshSession
}