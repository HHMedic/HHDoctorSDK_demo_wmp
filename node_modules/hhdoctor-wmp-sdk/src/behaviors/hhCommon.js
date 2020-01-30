const common = require('../utils/commonUtil.js');
const eventOption = {};
var that, app;
module.exports = Behavior({
  behaviors: [],
  properties: {

  },
  data: {

  },

  attached() {
    that = this;
    app = getApp();
  },
  methods: {
    propertyChanged(newVal, oldVal, changedPath) {

    },

    _logInfo(content, ...args) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      //console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content);
      console.log('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content, args);
    },

    _logError(content, ...args) {
      if (!this.data._request || 'prod' == this.data._request.profileName) {
        return;
      }
      console.error('[' + common.formatDate('hh:mm:ss.S') + '] [HH-IM-SDK:' + this.data._name + '] ' + content, args);
    },
    _ttt() {
      console.log(123);
    },

    _triggerEvent(name, detail) {
      this.triggerEvent(name, detail, eventOption)
      //this.triggerEvent(name, detail, eventOption)
    },

    _getPublicRequestParams() {
      var params = 'profileName=' + this.data._request.profileName +
        '&subDomain=' + this.data._request.subDomain +
        '&sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();
      return params
    },

    _appendUrlParams(url) {
      if (url.indexOf('?') >= 0) {
        url += '&';
      } else {
        url += '?';
      }
      url += ('_=' + new Date().getTime() + '&source=wmpSdk');

      if (url.indexOf('openId=') < 0 && this.data._request.openId) {
        url += ('&openId=' + this.data._request.openId);
      }
      if (url.indexOf('wmpVersion=') < 0 && getApp().globalData.wmpVersion) {
        url += ('&wmpVersion=' + getApp().globalData.wmpVersion);
      }
      if (url.indexOf('sdkVersion=') < 0) {
        url += ('&sdkVersion=' + this.data._sdkVersion);
      }
      if (url.indexOf('sdkProductId=') < 0 && this.data._request.sdkProductId) {
        url += ('&sdkProductId=' + this.data._request.sdkProductId);
      }
      if (url.indexOf('wxAppId=') < 0 && getApp().globalData.wxAppId) {
        url += ('&wxAppId=' + getApp().globalData.wxAppId);
      }
      return url;
    }
  }
})