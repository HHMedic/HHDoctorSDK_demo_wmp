const hostUtil = require('./utils/hostUtil.js')
const apis = require('./utils/api.js')
const TIM = require("./trtc-room/libs/tim-wx.js");
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
  callPage: null,
  isUserCancelInvite: false
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
    injectAppjsMethods()
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
      _status.appShow = false;
      addLog('1', 'life:onAppHide')
    });
    wx.onAppShow(() => {
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
      _subDomain: _options.subDomain,
      _callPage: _options.callPage
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
    tim.off(TIM.EVENT.ERROR, onTimError);
    tim.off(TIM.EVENT.SDK_READY, onTimReady);
    tim.off(TIM.EVENT.SDK_NOT_READY, onTimNotReady);
    tim.off(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
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

function getOptions() {
  return _options
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
//邀请人是否取消邀请
function isUserCancelInvite() {
  return _options.isUserCancelInvite;
}
/** 上报日志到服务器 */
function addLog(type, content, orderId) {
  //apis.requestRtcLog(type, content, orderId)
  doAddLog(type, content, orderId).then().catch(() => { })
}

function doAddLog(type, content, orderId) {
  return new Promise((resolve, reject) => {
    if (!_logUrl) {
      _logUrl = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
      _logUrl = _logUrl.substring(0, _logUrl.length - 1) + '-log/';
    }
    let url = _logUrl + '?sdkProductId=' + _options.sdkProductId +
      '&uuid=' + (_options.userId || '-1') +
      '&session=' + (_sessionId || '') +
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
/* 注入App.js函数 */
function injectAppjsMethods() {
  if (!app._throttle) {
    app._throttle = (btn, wait) => {
      let nowTime = Date.parse(new Date());
      let preTime = wx.getStorageSync(btn) || 0;
      let seconds = parseInt(nowTime - preTime)
      wx.setStorageSync(btn, nowTime);
      return seconds < (wait ? wait : 2000)
    }
  }
  if (!app.isOnlyOnePage) {
    app.isOnlyOnePage = () => {
      let pageList = getCurrentPages()
      return pageList.length == 1
    }
  }
}

function reportActive() {
  if (_intervals.reportActive) {
    clearInterval(_intervals.reportActive);
    _intervals.reportActive = null;
  }
  apis.requestRtcLog(1, '_reportActive', '');
  _intervals.reportActive = setInterval(function () {
    apis.requestRtcLog(1, '_reportActive', '');
  }, 60000);
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
      fail: function () {
        reject();
      }
    })
  })

}

/** 初始化TIM */
function initTIM() {
  return new Promise((resolve, reject) => {
    tim.setLogLevel('test' == _options.profileName ? 1 : 4);
    tim.on(TIM.EVENT.ERROR, onTimError);
    tim.on(TIM.EVENT.SDK_READY, onTimReady);
    tim.on(TIM.EVENT.SDK_NOT_READY, onTimNotReady);
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    tim.login({
      userID: _options.userId,
      userSig: _options.userSig
    })
      .then((imResponse) => {
        tim.on(TIM.EVENT.SDK_READY, function () {
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
  if ('test' == _options.profileName) console.log('hh-doctor>><<>><<>><<>><<', e)
  if (!e || !e.data || 0 == e.data.length) {
    return;
  }
  if (isCallWithCancel(e.data)) return;

  for (var i = 0; i < e.data.length; i++) {
    if ('C2C' != e.data[i].conversationType) {
      continue;
    }
    apis.requestRtcLog(1, 'onMessageReceived:====>' + JSON.stringify(e.data[i]));
    parseMsg(e.data[i]);
  }
}

function isCallWithCancel(dataList) {
  if (1 == dataList.length) return false
  let callOrderId = '', cancelOrderId = '';
  for (var i = 0; i < dataList.length; i++) {
    if ('C2C' != dataList[i].conversationType) {
      continue;
    }
    let msg = JSON.parse(dataList[i].payload.data);
    switch (msg.command) {
      case 'call':
        callOrderId = msg.orderId || ''
        break;
      case 'cancel':
        cancelOrderId = msg.orderId || ''
        break;
      default:
        break;
    }
  }
  return callOrderId && cancelOrderId && callOrderId == cancelOrderId
}

function onTimError(e) {
  addLog('1', 'timError:' + JSON.stringify(e))
}
function onTimReady(e) {
  addLog('1', 'timReady:' + JSON.stringify(e))
}
function onTimNotReady(e) {
  addLog('1', 'timNotReady:' + JSON.stringify(e))
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
    case 'call_invite':
      doCallInviteUser(msg, data.from)
      return;
    case 'cancel_invite': console.log('收到cancel_invite')
      _options.isUserCancelInvite = true;
      break;
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

// function busyInvite(){
//   if (!_options.callPage || !msg.uuid) return;
//   wx.showToast({
//     title:'医生忙碌中',
//     mask:true,
//     icon:'none',
//     duration:3000,
//     success(){
//       setTimeout(res=>{
//         wx.navigateBack()
//       },3000)
//     }
//   })
// }
//被邀请人收到邀请
function doCallInviteUser(msg, caller) {
  console.log('进入doCallInviteUser')
  if (!_options.callPage || !msg.uuid) return;
  _options.isUserCancelInvite = false;
  if (isBusy()) {
    //发送忙碌消息
    let msgData = {
      command: 'busy_invite',
      orderId: msg.orderId || '',
      uuid: _options.userId
    }
    sendMessage(msg.uuid, msgData, (msg.orderId || ''));
    return;
  }
  getDoctorInfo(msg)
    .then((res) => {
      console.log('getDoctorInfo', res)
      let pageUrl = _options.callPage + '?' +
        getPublicParams() +
        '&dept=' + msg.orderId +
        '&doctor=' + JSON.stringify(res.doctor) +
        '&order=' + JSON.stringify(res.order) +
        '&orderid=' + res.order.orderid +
        '&isInvite=' + 1
      if (_options.isUserCancelInvite) {
        wx.showToast({
          title: '对方已取消邀请',
          mask: true,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      wx.navigateTo({
        url: pageUrl
      })


    }).catch(() => {

    });
}
function doCallUser(msg, caller) {
  if (!_options.callPage || !msg.uuid) return;
  if (isBusy()) {
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
      console.log('getDoctorInfo', res)
      let pageUrl = _options.callPage + '?' +
        getPublicParams() +
        '&dept=' + msg.orderId +
        '&doctor=' + encodeURIComponent(JSON.stringify(res.doctor)) +
        '&order=' + encodeURIComponent(JSON.stringify(res.order)) +
        '&orderid=' + res.order.orderid +
        '&isInvite=' + 0
      console.log('pageUrl' + pageUrl)
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
      fail: function () {
        reject();
      }
    })
  })
}

/** 生成新的sessionId和日志编号 */
function refreshSession(timeout) {
  if (!timeout) timeout = 1;
  setTimeout(function () {
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
  getOptions,
  getUserInfo,
  getUserPhoto,
  getAsstInfo,
  addLog,
  refreshSession,
  getPublicParams,
  isUserCancelInvite
}