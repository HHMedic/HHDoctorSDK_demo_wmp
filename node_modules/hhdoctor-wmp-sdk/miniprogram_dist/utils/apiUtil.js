const app = getApp();
const wmpHost = app.globalData._hhSdkOptions._host.wmpHost;
const secHost = app.globalData._hhSdkOptions._host.secHost;

var urls = {
  videoReportTrace: wmpHost + 'video/reportTrace?targetId={0}&traceType={1}&traceCode={2}',
  videoLeaveLive: wmpHost + 'video/leaveLive?id={0}',
  videoAddComment: wmpHost + 'video/addComment',
  videoList: wmpHost + 'video/list?channelType={0}',
  videoComment: wmpHost + 'video/comments?videoId={0}&lastCommentId={1}&channelType={2}',
  getLiveInfo: secHost + 'babyweb/page/v2.0/seckill/liveInfo?liveId={0}',
  getHistoryMsg: wmpHost + 'trtc/getHistoryMsg?asstUuid={0}&isFirst={1}&lastTime={2}',
  getUnregHistoryMsg: wmpHost + 'trtc/getUnregUserHistoryMessages',
  getCardInfo: wmpHost + 'trtc/getCardInfo?id={0}',
  decrypt: wmpHost + 'wx/decrypt',
  getLicense: wmpHost + 'wmp/license?type={0}',
  getLoginUserByPhone: wmpHost + 'wmp/getLoginUserByPhone?phone={0}',
  regUser: wmpHost + 'wmp/regUser',
  updateUser: wmpHost + 'wmp/updateUser',
  getUserPhone: wmpHost + 'wmp/getUserPhone',
  seckillList: secHost + 'babyweb/page/v2.0/seckill/index?liveId={0}&userPhone={1}',
  seckillSign: secHost + 'babyweb/page/v2.0/seckill/sign?seckillId={0}&userPhone={1}',
  seckillApply: secHost + 'babyweb/page/v2.0/seckill/apply',
  seckillExec: secHost + 'babyweb/page/v2.0/seckill/exec',
  setAddress: secHost + 'babyweb/page/v2.0/seckill/setAddress',
  getAddressList: wmpHost + 'address/listP',
  saveAddress: wmpHost + 'address/saveAddress',
  getDoctorInfo: wmpHost + 'wmp/getDoctorInfo?doctorId={0}',
  sendImMessage: wmpHost + 'trtc/sendImMessage',
  activeCode: wmpHost + 'wmp/activationCode?code={0}',
  uploadFile: wmpHost + 'im/upload',
  getStyle: wmpHost + 'wmp/style?productId={0}&appId={1}&page={2}',
  //---
  getSdkInfo: wmpHost + 'wmp/getSdkInfo?wxAppId={0}',
  checkRegToken: wmpHost + 'wmp/checkRegToken?sdkProductId={0}&token={1}&imei={2}',
  getCountryCodes: wmpHost + 'wmp/getCountryCodes',
  verifyCheckCode: wmpHost + 'bz/verifyCheckCode?phone={0}&code={1}&&countryCode={2}&sdkProductId={3}',
  addHealthData: wmpHost + 'proxy/familyhealth/api/healthData/add',
  addHealthReport: wmpHost + 'trtc/uploadDataByUserToken?sdkProductId={0}&userToken={1}&peDate={2}&type={3}&title={4}',
  parseShareCode: wmpHost + 'share/parseShareCode?mpAppId={0}&shareCode={1}',
  setManyVideo: wmpHost + 'proxy/familyapp/order/setManyVideo?orderId={0}',
}
var requestHeader = {};

String.prototype.format = function () {
  if (arguments.length == 0) return this;
  for (var s = this, i = 0; i < arguments.length; i++)
    s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
  return s;
};

function doRequest(url, method, data) {
  return new Promise(function (resolve, reject) {
    url = addPubVars(url);
    //console.log('>>>>' + url);
    wx.request({
      url: url,
      data: data,
      method: method ? method.toUpperCase() : 'POST',
      header: requestHeader,
      success(res) {
        if (200 == res.statusCode && res.data &&
          res.data.status && 200 == res.data.status) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail(res) {
        wx.navigateBack();
        reject();
      }
    });
  });
}

function addPubVars(url) {
  url = addParam(url, 'sdkProductId', app.globalData._hhSdkOptions._sdkProductId);
  url = addParam(url, 'userToken', app.globalData._hhSdkOptions._userToken);
  url = addParam(url, 'openId', app.globalData._hhSdkOptions._openId);
  url = addParam(url, 'hhDoctorSdkVersion', wx.getStorageSync('SdkVersion'));

  if (app.globalData.wxAppId) {
    url = addParam(url, 'wxAppId', app.globalData.wxAppId)
    if ('wx15e414719996d59f' == app.globalData.wxAppId && app.globalData.wmpVersion)
      url = addParam(url, 'wmpVersion', app.globalData.wmpVersion);
  }
  url = addParam(url, '_', new Date().getTime());
  return url;
}

function addParam(url, key, value) {
  if (url.indexOf(key + '=') < 0 && value) {
    url += ((url.indexOf('?') >= 0 ? '&' : '?') + key + '=' + value);
  }
  return url;
}

/** 上报小程序直播埋点数据 */
function reportTrace(targetId, traceType, traceCode) {
  let url = urls.videoReportTrace.format(targetId, traceType, traceCode);
  return doRequest(url, '', {});
}

/** 离开直播 */
function leaveLive(id) {
  let url = urls.videoLeaveLive.format(id);
  return doRequest(url, '', {});
}

/** 添加评论 */
function addComment(comment) {
  let url = urls.videoAddComment
  return doRequest(url, '', comment);
}

/** 获取评论列表 */
function getComment(videoId, lastCommentId, channelType) {
  let url = urls.videoComment.format(videoId, lastCommentId, channelType);
  return doRequest(url, '', {});
}

/** 获取视频列表 */
function getVideoList(channelType) {
  let url = urls.videoList.format(channelType);
  return doRequest(url, '', {});
}

/** 获取历史IM消息 */
function getHistoryMsg(asstUuid, isFirst, lastTime) {
  let url = urls.getHistoryMsg.format(asstUuid, isFirst, lastTime || '');
  return doRequest(url, '', {});
}

function getUnregHistoryMsg() {
  let url = urls.getUnregHistoryMsg
  return doRequest(url, '', {});
}

function getCardInfo(id) {
  let url = urls.getCardInfo.format(id);
  return doRequest(url, '', {});
}

function decryptData(encryptedData, iv) {
  let url = urls.decrypt;
  return doRequest(url, '', { encryptedData, iv });
}

function getLicense(type) {
  let url = urls.getLicense.format(type);
  return doRequest(url, '', {});
}

function getLoginUserByPhone(phone) {
  let url = urls.getLoginUserByPhone.format(phone);
  return doRequest(url, '', {});
}

function regUser(user) {
  let url = urls.regUser;
  return doRequest(url, '', user);
}

function updateUser(user) {
  let url = urls.updateUser;
  return doRequest(url, '', user);
}
function getUserPhone() {
  let url = urls.getUserPhone;
  return doRequest(url, '', {});
}
function seckillList(liveId, userPhone) {
  let url = urls.seckillList.format(liveId, userPhone);
  return doRequest(url, 'GET', {});
}
function seckillSign(seckillId, userPhone) {
  let url = urls.seckillSign.format(seckillId, userPhone);
  return doRequest(url, 'GET', {});
}
function seckillApply(seckillId, userPhone) {
  let data = {
    seckillId,
    userPhone,
    userToken: app.globalData._hhSdkOptions._userToken
  }
  let url = urls.seckillApply;
  return doRequest(url, '', data);
}
function seckillExec(seckillId, sign, userPhone) {
  let data = {
    seckillId,
    userPhone,
    sign
  }
  let url = urls.seckillExec;
  return doRequest(url, '', data);
}
function getAddressList() {
  let url = urls.getAddressList;
  return doRequest(url, '', {});
}
function saveAddress(name, phoneNum, address) {
  let data = {
    name,
    phoneNum,
    address
  }
  let url = urls.saveAddress;
  return doRequest(url, '', data);
}
function setAddress(seckillId, userPhone, receiverName, receiverPhone, receiverAddress) {
  let data = {
    seckillId,
    userPhone,
    receiverName,
    receiverPhone,
    receiverAddress
  }
  let url = urls.setAddress;
  return doRequest(url, '', data);
}
function getLiveInfo(liveId) {
  let url = urls.getLiveInfo.format(liveId);
  return doRequest(url, 'GET', {});
}

function getDoctorInfo(doctorId) {
  let url = urls.getDoctorInfo.format(doctorId);
  return doRequest(url, '', {});
}
function activeCode(code) {
  let url = urls.activeCode.format(code);
  return doRequest(url, '', {});
}
function addHealthData(data) {
  let url = urls.addHealthData.format();
  return doRequest(url, '', data);
}
function addHealthReport(sdkProductId, userToken, peDate, urlList, type, title) {
  let url = urls.addHealthReport.format(sdkProductId, userToken, peDate, type, encodeURIComponent(title));
  return doRequest(url, '', urlList);
}
function sendImMessage(msgRequest) {
  let url = urls.sendImMessage
  return doRequest(url, '', msgRequest);
}
function parseShareCode(mpAppId, shareCode) {
  let url = urls.parseShareCode.format(mpAppId, shareCode)
  return doRequest(url, '', {});
}
function uploadFile(filePath, fileType) {
  let app = getApp()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      filePath,
      name: 'uploadFile',
      url: urls.uploadFile,
      formData: {
        'sdkProductId': app.globalData._hhSdkOptions._sdkProductId,
        'userToken': app.globalData._hhSdkOptions._userToken,
        'openId': app.globalData._hhSdkOptions._openId,
        'fileType': fileType || ''
      },
      success: res => {
        let data = JSON.parse(res.data);
        if (200 == data.statusCode) return resolve(data.data)
        return reject()
      },
      fail: () => { reject() }
    })
  })
}
function getStyle(sdkProductId, wxAppId, page) {
  let url = urls.getStyle.format(sdkProductId, wxAppId, page);
  return doRequest(url, '', {});
}
function setManyVideo(orderId) {
  let url = urls.setManyVideo.format(orderId)
  return doRequest(url, '', {});
}

module.exports = {
  regUser,
  getStyle,
  leaveLive,
  activeCode,
  updateUser,
  reportTrace,
  addComment,
  getComment,
  getLicense,
  setAddress,
  uploadFile,
  saveAddress,
  getLiveInfo,
  decryptData,
  seckillList,
  seckillSign,
  seckillExec,
  getCardInfo,
  getUserPhone,
  seckillApply,
  getVideoList,
  setManyVideo,
  addHealthData,
  sendImMessage,
  getDoctorInfo,
  getHistoryMsg,
  parseShareCode,
  getAddressList,
  addHealthReport,
  getUnregHistoryMsg,
  getLoginUserByPhone
}