var that;
Component({
  behaviors: [require('./hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-medicine',
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
      this._viewMedicine();
    },

    _viewMedicine() {
      var vParam = 'drugOrderId=' + this.data._request.drugOrderId +
        '&sdkProductId=' + this.data._request.sdkProductId +
        '&userToken=' + this.data._request.userToken +
        '&openId=' + this.data._request.openId +
        '&source=wmpSdk' +
        '&version=' + this.data._sdkVersion +
        '&_=' + new Date().getTime();

      var s = this.data._host.patHost + 'drug/order.html?' + vParam;
      console.log(s);
      this.setData({
        url: s
      })
    }
  }
})