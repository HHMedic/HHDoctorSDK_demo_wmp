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
    _name: 'hh-productright',
    product: null,
    productComment: []
  },
  lifetimes: {
    attached() {
      that = this;
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
        'my/productDetail?userToken=' + this.data._request.userToken + '&sdkProductId=' + this.data._request.sdkProductId + '&productId=' + this.data._request.productId;
      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              product: res.data.data,
              productComment: ['7×24小时视频看医生', '知名专家会诊咨询']
            })
          } else {

          }
        },
        fail:function(){
          
        }
      })
    },

    _buy() {
      if (!this.data.product) return;
      this._buyProduct(this.data.product.productServiceId);
    }
  }
})