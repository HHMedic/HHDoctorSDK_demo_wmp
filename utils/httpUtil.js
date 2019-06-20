var commonUtil = require('./commonUtil.js');
/**
 * 封装wx.request()，使之请求时携带相应header参数
 */
//var app = getApp();
//var cookie = app.globalData.header.Cookie
var cookie = '';

function httpPost(obj) {
  httpRequest(obj, 'POST');
};

function httpGet(obj) {
  httpRequest(obj, 'GET');
};

function httpRequest(obj, method) {
  wx.request({
    url: obj.url,
    data: obj.data,
    method: method,
    header: {
      'content-type': 'application/json',
      'cookie': cookie
    },
    success: function(res) {
      if (res.header['set-cookie']) {
        setCookie(res.header['set-cookie']);
      }
      if (res.header['Set-Cookie']) {
        setCookie(res.header['Set-Cookie']);
      }
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function() {
      if (obj.fail) {
        obj.fail();
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '网络不给力',
          icon: 'none',
          mask: true
        })
      }
    },
    complete: function() {
      if (obj.complete) {
        obj.complete();
      }
    }
  })
};

function success(res) {
  return res && res.data &&
    200 == res.data.status;
};

function setCookie(value) {
  console.log('setCookie:' + value);
  getApp().globalData.header.Cookie = value;
  cookie = value;
}

module.exports = {
  post: httpPost,
  get: httpGet,
  success: success
}