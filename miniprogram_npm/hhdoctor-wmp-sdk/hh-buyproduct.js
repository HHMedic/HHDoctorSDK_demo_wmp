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
    _name: 'hh-buyproduct',
    selectedPid: -1,
    productList: [],
    productComment:[]
  },
  lifetimes: {
    attached() {
      that = this;
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
      wx.showLoading({
        title: '加载中...'
      })
      var url = this._getHost().wmpHost +
        'my/selectProduct?userToken=' + this.data._request.userToken + '&sdkProductId=' + this.data._request.sdkProductId;
      url = this._appendUrlParams(url);

      wx.request({
        url: url,
        data: {},
        method: 'POST',
        success: function(res) {
          wx.hideLoading();
          if (res && res.data && 200 == res.data.status) {
            //成功
            that.setData({
              productList: res.data.data,
              productComment: ['7×24小时视频看医生','知名专家会诊咨询']
            })
            if (that.data.productList &&
              1 == that.data.productList.length) {
              that.setData({
                selectedPid: that.data.productList[0].productServiceId
              })
            }
          } else {

          }
        }
      })
    },
    _selectProduct(e) {
      this.setData({
        selectedPid: e.currentTarget.dataset.pid
      })
    },

    _viewProductRight(e) {
      var pageUrl = this.data.basePath + 'innerpages/productRight?' + this._getPublicRequestParams() + '&productId=' + e.currentTarget.dataset.pid + '&payPage=' + this.data._request.payPage;
      wx.navigateTo({
        url: pageUrl,
      })
    },

    _buySelect() {
      if (this.data.selectedPid < 0) {
        wx.showModal({
          title: '提示',
          content: '请先选择套餐',
          showCancel: false
        })
        return;
      }
      this._buyProduct(this.data.selectedPid);
    }
  }
})