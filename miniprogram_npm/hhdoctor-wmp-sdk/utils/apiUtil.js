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
  getHistoryMsg: wmpHost + 'trtc/getHistoryMsg?asstUuid={0}',
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
  saveAddress: wmpHost + 'address/saveAddress'
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
        // wx.showModal({
        //   title: '提示',
        //   content: res && res.data && res.data.error || "网络请求错误",
        //   showCancel: false,
        //   success(){
        //     wx.reLaunch({
        //       url: '/pages/error/error'
        //     })
        //   }

        // });
        reject();
      }
    });
  });
}

function addPubVars(url) {
  url = addParam(url, 'sdkProductId', app.globalData._hhSdkOptions._sdkProductId);
  url = addParam(url, 'userToken', app.globalData._hhSdkOptions._userToken);
  url = addParam(url, 'openId', app.globalData._hhSdkOptions._openId);
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
function getHistoryMsg(asstUuid) {
  let url = urls.getHistoryMsg.format(asstUuid);
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

module.exports = {
  regUser,
  leaveLive,
  updateUser,
  reportTrace,
  addComment,
  getComment,
  getLicense,
  setAddress,
  saveAddress,
  getLiveInfo,
  decryptData,
  seckillList,
  seckillSign,
  seckillExec,
  getUserPhone,
  seckillApply,
  getVideoList,
  getHistoryMsg,
  getAddressList,
  getLoginUserByPhone
}