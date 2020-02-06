const hhBehaviors = require('./hhBehaviors.js');

var that;

Component({
  behaviors: [hhBehaviors],
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-personal',
    url: ''
  },

  lifetimes: {
    attached() {
      that = this;
    },
    ready() {},
    detached() {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      this._logInfo('初始化参数完成');
      that._viewPersonal();
    },

    _viewPersonal() {
      var vParam = 'module=' + this.data._request.personalModule +
        '&appId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion;

      var s = this.data._host.wmpHost + 'view/?' + vParam;
      console.log(s);
      this.setData({
        url: s
      })
    }
  }
})