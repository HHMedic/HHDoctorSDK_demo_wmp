const httpUtil = require('./httpUtil.js');
const commonUtil = require('./commonUtil.js');

function pay(obj) {
  var ts = Math.floor(new Date().getTime() / 1000);
  if (!obj.nonce) {
    obj.nonce = commonUtil.sha1(ts);
  }
  var data = {
    appId: getApp().globalData.wxAppId,
    timeStamp: ts.toString(),
    nonceStr: obj.nonce,
    pkg: 'prepay_id=' + obj.prePayId,
    signType: 'MD5'
  };
  obj.data = data;
  getSign(obj);
}

function getSign(obj) {
  wx.showLoading({
    title: '支付中...'
  })
  var url = getApp().globalData.host + 'wx/getSign';
  httpUtil.post({
    url: url,
    data: obj.data,
    success: function(res) {
      if (res && res.data && 200 == res.data.status) {
        obj.sign = res.data.data;
        doWxPay(obj);
      } else {
        if (obj.fail) {
          obj.fail();
        }
      }
    },
    fail: function() {
      if (obj.fail) {
        obj.fail();
      }
    }
  })
}

function doWxPay(obj) {
  wx.hideLoading();
  wx.requestPayment({
    timeStamp: obj.data.timeStamp.toString(),
    nonceStr: obj.data.nonceStr,
    "package": obj.data.pkg,
    signType: obj.data.signType,
    paySign: obj.sign,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function(res) {
      if (obj.fail) {
        obj.fail(res);
      }
    }
  });
}

//对外公开接口
module.exports = {
  pay: pay
}