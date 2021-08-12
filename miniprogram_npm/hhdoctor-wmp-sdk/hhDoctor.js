const hostUtil = require('./utils/hostUtil.js')
const apis = require('./utils/api.js')
const TIM = require("./trtc-room/libs/tim-wx.js");
const cStyle = require('./utils/consoleStyle')
const SDKAppID = 1400073238;
const SdkVersion = '3.1.0'

let sysInfo
var app;
var tim = null; // SDK 实例通常用 tim 表示
var _status = {
  appShow: true
}
var _logUrl;
var _logId = 0;
var _sessionId;
var _options = {
  basePath: '/miniprogram_npm/hhdoctor-wmp-sdk/',
  profileName: 'test',
  subDomain: '',
  sdkProductId: null,
  userToken: null,
  userId: null,
  userSig: null,
  photo: null,
  openId: null,
  callPage: null,
  personalPage: null,
  addressPage: null,
  payPage: null,
  regPage: null,
  isUserCancelInvite: false
}
var _callbacks = {
  receiveMsg: null,
  chatMsg: null
}
var _asst = {}
let _logList = []

/** 登录 */
function login(options) {
  return new Promise((resolve, reject) => {
    app = getApp();
    tim = getTim();
    injectAppjsMethods()
    if (tim) {
      return resolve();
    }
    if (!options ||
      !options.sdkProductId ||
      !options.userToken ||
      !options.openId) {
      return reject('缺少sdkProductId、userToken或openId参数');
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
    _logUrl = ''
    getApp().globalData._hhSdkOptions = sdkOptions;
    getUserInfo().then(() => {
      initTIM().then((res) => {
        addLog(1, 'login tim [' + (_options.userId || '') + '] success:' + (res && JSON.stringify(res) || ''), '');
        resolve();
      }).catch(err => {
        addLog(1, 'login tim [' + (_options.userId || '') + '] fail:' + (err && JSON.stringify(err) || ''), '');
        reject('登录失败');
      })
    }).catch(() => {
      addLog(1, 'getuserSig:获取用户SIG失败', '');
      wx.reLaunch({ url: '/pages/index/err', })
      reject('登录失败');
    })
  })
}

/** 退出 */
function logout() {
  return new Promise((resolve, reject) => {
    if (!tim) {
      return resolve();
    }
    destroyTim()
    _options = {
      profileName: 'test',
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
    _asst = {}
    resolve();
  })
}

function destroyTim() {
  tim.off(TIM.EVENT.ERROR, onTimError);
  tim.off(TIM.EVENT.SDK_READY, onTimReady);
  tim.off(TIM.EVENT.SDK_NOT_READY, onTimNotReady);
  tim.off(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
  tim.logout();
  tim = null;
  if (app.globalData && app.globalData._hhTim) {
    app.globalData._hhTim = null;
  }
}

/** 发送消息 */
function sendMessage(toUser, msgData, orderId) {
  return apis.requestSendMessage(toUser, msgData, orderId);
}

function sendCustomMessage(uuid, toUser, command, orderId) {
  return apis.sendCustomerMessage(uuid, toUser, command, orderId)
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

/** 获取助理信息 */
function getAsstInfo() {
  return _asst;
}
/** 设置助理信息  */
function setAsstInfo(asst) {
  _asst = asst
}
//邀请人是否取消邀请
function isUserCancelInvite() {
  return _options.isUserCancelInvite;
}
/** 上报日志到服务器 */
function addLog(type, content, orderId) {
  doAddLog(type, content, orderId).then().catch()
}
/** 添加日志 */
function doAddLog(type, content, orderId) {
  return new Promise((resolve, reject) => {
    if (!_logUrl) {
      _logUrl = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
      _logUrl = _logUrl.substring(0, _logUrl.length - 1) + '-log/';
    }
    if (!_options.userId) {
      _logList.push({
        type, content, orderId, t: new Date().getTime()
      })
      return
    }
    if (_logList.length) {
      for (let i = 0; i < _logList.length; i++) {
        doDownload(_logList[i].type, _logList[i].content, _logList[i].orderId, _logList[i].t)
      }
      _logList = []
    }
    doDownload(type, content, orderId)
    resolve();
  })
}
function doDownload(type, content, orderId, t) {
  let url = _logUrl + '?sdkProductId=' + _options.sdkProductId +
    '&uuid=' + _options.userId +
    '&session=' + (_sessionId || '') +
    '&id=' + _logId +
    '&orderId=' + (orderId || '') +
    '&type=' + type +
    '&content=' + encodeURIComponent(content) +
    '&version=' + (getApp().globalData && getApp().globalData.wmpVersion || '') +
    '&t=' + (t || new Date().getTime());
  _logId++
  wx.downloadFile({ url: url })
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

function getTim() {
  app = getApp();
  if (tim) return tim;
  if (app.globalData && app.globalData._hhTim) return app.globalData._hhTim;
  return null;
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    if (_options && _options.userSig && _options.userId && _asst && _asst.uuid) return resolve()
    let url = hostUtil.getHost(_options.profileName, _options.subDomain).wmpHost;
    url += 'wmp/getUserSig' +
      '?sdkProductId=' + _options.sdkProductId +
      '&userToken=' + _options.userToken
    doRequest(url).then(res => {
      _options.userSig = res.userSig;
      _options.userId = res.userId + '';
      _options.photo = res.photoUrl;
      _options.product = res.product;
      _asst = { uuid: res.asstUuid, name: res.asstName, photo: res.asstPhotos }
      resolve()
    }).catch(err => {
      toastError(err)
      reject()
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
    }).then((imResponse) => {
      tim.on(TIM.EVENT.SDK_READY, function () {
        app.globalData._hhTim = tim;
        resolve(imResponse);
      })
    }).catch(imError => reject(imError))
  })
}

function onMessageReceived(e) {
  if ('test' == _options.profileName) console.log('%c hh-doctor onMessageReceived:', cStyle.info, e)
  if (!e || !e.data || !e.data.length) return
  if (isCallWithCancel(e.data)) return;
  for (var i = 0; i < e.data.length; i++) {
    if ('C2C' != e.data[i].conversationType) {
      continue;
    }
    addLog(1, 'onMessageReceived:====>' + JSON.stringify(e.data[i]))
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
  wx.showToast({
    title: '内部通信错误\r\n请尽快重启微信',
    icon: 'none',
    duration: 2500
  })
  timReconnect()
}
function timReconnect() {
  destroyTim()
  tim = TIM.create({
    SDKAppID
  });
  setTimeout(() => {
    addLog(1, 'tim reconnect...', '');
    initTIM().then(res => {
      addLog(1, 'tim reconnect success', '');
    }).catch(err => {
      addLog(1, 'tim reconnect fail:' + (err && JSON.stringify(err) || ''), '');
      timReconnect()
    })
  }, 3000)
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
    case 'conference_begin':
      console.log('>>> 启动白板，groupId:', msg.groupId)
      break
    case 'conference_end':
      console.log('>>> 结束白板，groupId:', msg.groupId)
      break
    default:
      break;
  }
  if (_callbacks.receiveMsg) {
    _callbacks.receiveMsg([data]);
  }
}
//被邀请人收到邀请
function doCallInviteUser(msg, caller) {
  if (!_options.callPage || !msg.uuid) return;
  if (!supportCall()) return
  _options.isUserCancelInvite = false;
  if (isBusy()) {
    //发送忙碌消息
    let msgData = {
      command: 'busy_invite',
      orderId: msg.orderId || '',
      uuid: _options.userId
    }
    // sendMessage(msg.uuid, msgData, (msg.orderId || ''));
    sendCustomMessage(msgData.uuid, msg.uuid, msgData.command, (msg.orderId || ''))
    return;
  }
  getDoctorInfo(msg)
    .then((res) => {
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
  if (!supportCall()) return
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
    doRequest(url)
      .then(res => resolve(res))
      .catch(err => {
        toastError(err)
        reject()
      })
  })
}

function navigateTo(options) {
  if (!options || !options.page) return
  if ('personalPage' != options.page && !_options.userToken) return
  let url = ''
  switch (options.page) {
    case 'drugOrder':
      if (!options.drugOrderId) return console.error('缺少必填参数：drugOrderId')
      getApp().globalData._hhSdkOptions.drugOrderId = options.drugOrderId;
      getApp().globalData._hhSdkOptions.redirectPage = options.redirectPage || '/pages/newIndex/newIndex';
      url = getApp().globalData._hhSdkOptions._host.patHost + 'drug/order.html?' + getPublicParams(1, 1) +
        '&drugOrderId=' + options.drugOrderId +
        '&payPage=' + encodeURIComponent(_options.basePath + 'innerpages/pay/pay') +
        '&redirectPage=' + encodeURIComponent(options.redirectPage ? options.redirectPage : '/pages/newIndex/newIndex')
      url = _options.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url)
      break
    case 'drugOrderList':
      getApp().globalData._hhSdkOptions.redirectPage = options.redirectPage || '/pages/newIndex/newIndex';
      url = getApp().globalData._hhSdkOptions._host.patHost + 'drug/order-list.html?' + getPublicParams(1, 1)
      url = _options.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url)
      break
    case 'personalPage':
      url = _options.basePath + 'innerpages/user/user?' + getPublicParams()
      break
    case 'addressList':
      url = getApp().globalData._hhSdkOptions._host.patHost + 'drug/addr-list.html?' + getPublicParams(1, 1)
      url = _options.basePath + 'innerpages/view/view?url=' + encodeURIComponent(url)
      break
    case 'ehrMemberList':
      url = _options.basePath + 'innerpages/ehr-family/ehr-family'
      break
    case 'ehrList':
      url = _options.basePath + 'innerpages/ehr-filings/ehr-filings?memberUserToken=' + (options.patient || _options.userToken) + '&nickname=' + (options.nickname || '档案列表')
      break
    case 'ehrDetail':
      if (!options.medicRecordId) return console.error('缺少必填参数：medicRecordId')
      url = _options.basePath + 'innerpages/ehr-filingdetail/ehr-filingdetail?id=' + options.medicRecordId + '&memberUserToken=' + (options.patient || _options.userToken)
      break
    default:
      break
  }
  if (url) wx.navigateTo({ url })
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
function getPublicParams(withVersion, withTimestamp) {
  var params = 'profileName=' + _options.profileName +
    '&subDomain=' + _options.subDomain +
    '&sdkProductId=' + (_options.sdkProductId || '') +
    '&userToken=' + (_options.userToken || '') +
    '&openId=' + (_options.openId || '') +
    '&source=wmpSdk'
  if (withVersion) params += ('&version=' + SdkVersion)
  if (withTimestamp) params += ('&_=' + new Date().getTime())
  return params
}
function supportCall() {
  if (!sysInfo) sysInfo = wx.getSystemInfoSync()
  let support = 'devtools' != sysInfo.brand && 'devtools' != sysInfo.platform && 'microsoft' != sysInfo.brand && 'windows' != sysInfo.platform
  if (!support) console.error('小程序IDE不支持实时音视频，请使用预览或真机调试！')
  return support
}
function doRequest(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url, data: {}, method: 'POST', header: { 'content-type': 'application/json' },
      success(res) {
        if (res && res.data && 200 == res.data.status) resolve(res.data.data);
        else reject(res || { message: '服务器异常(400)' })
      },
      fail: err => reject(err || { message: '服务器异常(fail)' })
    })
  })
}
function toastError(err) {
  wx.showToast({ title: err && err.message | '服务器异常', icon: 'none', mask: true })
}
function getMessageList(params) {
  tim.getMessageList({ conversationID: 'C2C17385747', count: 15 })
    .then(res => { console.log(JSON.stringify(res)) }).catch()
}

app = getApp();
module.exports = {
  on,
  off,
  login,
  logout,
  addLog,
  getUserId,
  navigateTo,
  getProduct,
  getUserSig,
  getOptions,
  getAsstInfo,
  setAsstInfo,
  getUserInfo,
  sendMessage,
  supportCall,
  getUserPhoto,
  getMessageList,
  refreshSession,
  getPublicParams,
  isUserCancelInvite
}