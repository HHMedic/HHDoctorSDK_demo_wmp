var that;
Component({
  behaviors: [require('../hhBehaviors.js')],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    _name: 'hh-right',
    product: null
  },
  lifetimes: {
    attached() {
      that = this;
    },
    ready() {
      var info = wx.getSystemInfoSync();
      this.setData({
        sysInfo: info
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _requestComplete() {
      this._getProductInfo();
    },
    _getProductInfo() {
      var url = this._getHost().wmpHost +
        'my/product?userToken=' + this.data._request.userToken + '&sdkProductId=' + this.data._request.sdkProductId;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            if (res.data.data && res.data.data.product) {
              that.setData({
                product: res.data.data.product
              })
            }
          } else {

          }
        }
      })
    }
  }
})