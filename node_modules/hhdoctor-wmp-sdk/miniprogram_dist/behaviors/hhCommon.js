const common = require('../utils/commonUtil.js');
const eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {},

  attached() {
    that = this;
    app = getApp();
  },
  methods: {
    propertyChanged(newVal, oldVal, changedPath) { },
    _triggerEvent(name, detail) {
      this.triggerEvent(name, detail, eventOption)
    },
    _getPublicRequestParams() {
      let wmpVersion = ''
      if (app.globalData.wxAppId && 'wx15e414719996d59f' == app.globalData.wxAppId
        && app.globalData.wmpVersion) {
        wmpVersion = app.globalData.wmpVersion
      }
      var params = 'profileName=' + this.data._request.profileName +
        '&subDomain=' + this.data._request.subDomain +
        '&sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&wmpVersion=' + wmpVersion +
        '&_=' + new Date().getTime();
      return params
    },

    _clearIntervalHandler(handler) {
      if (handler) {
        clearInterval(handler);
        handler = null;
      }
    },
    _isUnReg(alert) {
      if ('unreg' == this.data._request.userToken) {
        if (alert) wx.showToast({ title: '请注册登录后再试', icon: 'none' })
        return true;
      }
      return false;
    },
  }
})