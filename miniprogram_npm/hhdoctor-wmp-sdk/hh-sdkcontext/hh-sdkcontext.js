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
    _name: 'hh-sdkcontext',
    _requestComplete: false,
    _timeOut: 3000
  },
  lifetimes: {
    attached() {
      that = this;
    },
    ready() {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigateTo(options) {
      if (!options || !options.page) {
        return;
      }
      var _t = 0;
      var checkInterval = setInterval(function() {
        if (!that.data._requestComplete) {
          if (_t > that.data._timeOut) {
            //超时
            clearInterval(checkInterval);
            console.error('执行navigateTo超时，可能是参数不足');
          } else {
            _t += 100;
          }
          return;
        }

        clearInterval(checkInterval);
        that._doNaviTo(options);
      }, 100);
    },

    _requestComplete() {
      this.setData({
        _requestComplete: true
      })
    },

    _doNaviTo(options) {
      switch (options.page) {
        case 'drugOrder':
          this._viewMedicine(options.drugOrderId, options.redirectPage);
          break;
        case 'drugOrderList':
          this._viewMedicineOrderList(options.redirectPage);
          break;
        case 'personalPage':
          this._viewPersonal();
          break;
        case 'addressList':
          this._viewAddressList();
          break;
        default:
          return;
      }
    },

    _viewPersonal() {
      var pageUrl = this.data._request.personalPage ? this.data._request.personalPage : this.data.basePath + 'innerpages/user/user';
      pageUrl += '?' + this._getPublicRequestParams();
      if (!this.data._request.personalPage) {
        pageUrl += '&addressPage=' + this.data._request.addressPage + '&payPage=' + this.data._request.payPage + '&autoAcl=true';
      }
      wx.navigateTo({
        url: pageUrl
      })
    }
  }
})