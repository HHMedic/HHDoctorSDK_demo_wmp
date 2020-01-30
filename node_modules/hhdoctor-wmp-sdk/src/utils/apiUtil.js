const app = getApp();
const wmpHost = app.globalData._hhSdkOptions._host.wmpHost;
var urls = {
  videoReportTrace: wmpHost + 'video/reportTrace?targetId={0}&traceType={1}&traceCode={2}',
  videoLeaveLive: wmpHost + 'video/leaveLive?id={0}',
  videoAddComment: wmpHost + 'video/addComment',
  videoList: wmpHost + 'video/list?channelType={0}',
  videoComment: wmpHost + 'video/comments?videoId={0}&lastCommentId={1}&channelType={2}',
  getHistoryMsg: wmpHost + 'trtc/getHistoryMsg?asstUuid={0}'
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
    console.log('>>>>' + url);
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
        wx.showModal({
          title: '提示',
          content: res && res.data && res.data.error || "网络请求错误",
          showCancel: false
        });
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

module.exports = {
  reportTrace,
  leaveLive,
  addComment,
  getComment,
  getVideoList,
  getHistoryMsg
}